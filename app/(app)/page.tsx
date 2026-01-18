import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { daysBetween, endOfDay, startOfDay, toISODate } from "@/lib/dates";
import Charts from "@/components/Charts";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const userId = requireUserId();
  const today = new Date();
  const from = searchParams.from
    ? new Date(searchParams.from)
    : new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
  const to = searchParams.to ? new Date(searchParams.to) : today;

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startOfDay(from),
        lte: endOfDay(to),
      },
    },
    orderBy: { date: "asc" },
  });

  const budgets = await prisma.budget.findMany({
    where: { userId },
    orderBy: { category: "asc" },
  });

  const rate = await prisma.exchangeRate.findFirst({
    where: { userId, base: "USD", quote: "KZT" },
  });

  const totals = transactions.reduce(
    (acc, tx) => {
      const amount = Number(tx.amount);
      if (tx.type === "income") acc.income += amount;
      if (tx.type === "expense") acc.expense += amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const byCategory = transactions
    .filter((tx) => tx.type === "expense")
    .reduce<Record<string, number>>((acc, tx) => {
      const current = acc[tx.category] ?? 0;
      acc[tx.category] = current + Number(tx.amount);
      return acc;
    }, {});

  const days = daysBetween(from, to);
  const series = days.map((date) => {
    const iso = toISODate(date);
    const daily = transactions.filter(
      (tx) => toISODate(new Date(tx.date)) === iso
    );
    return {
      date: iso,
      income: daily
        .filter((tx) => tx.type === "income")
        .reduce((sum, tx) => sum + Number(tx.amount), 0),
      expense: daily
        .filter((tx) => tx.type === "expense")
        .reduce((sum, tx) => sum + Number(tx.amount), 0),
    };
  });

  return (
    <div className="space-y-8">
      <header className="card flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <p className="text-sm text-slate-400">Selected period</p>
          <h1 className="text-2xl font-semibold text-slate-50">
            {toISODate(from)} → {toISODate(to)}
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs uppercase text-slate-500">Income</p>
            <p className="text-lg font-semibold text-emerald-300">
              {totals.income.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase text-slate-500">Expense</p>
            <p className="text-lg font-semibold text-rose-300">
              {totals.expense.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase text-slate-500">Balance</p>
            <p className="text-lg font-semibold text-slate-100">
              {(totals.income - totals.expense).toFixed(2)}
            </p>
          </div>
        </div>
      </header>

      <Charts
        pieData={byCategory}
        lineData={series}
        from={toISODate(from)}
        to={toISODate(to)}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-50">
            Category budgets
          </h2>
          <p className="text-sm text-slate-400">
            Track progress against each budget.
          </p>
          <div className="mt-4 space-y-4">
            {budgets.length === 0 ? (
              <p className="text-sm text-slate-500">No budgets yet.</p>
            ) : (
              budgets.map((budget) => {
                const spent = transactions
                  .filter(
                    (tx) =>
                      tx.category === budget.category &&
                      tx.type === "expense" &&
                      tx.currency === budget.currency
                  )
                  .reduce((sum, tx) => sum + Number(tx.amount), 0);
                const limit = Number(budget.limit);
                const pct = Math.min(spent / Math.max(limit, 1), 1) * 100;
                return (
                  <div
                    key={budget.id}
                    className="rounded-xl border border-slate-800/70 bg-slate-900/50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-200">
                          {budget.category}
                        </p>
                        <p className="text-xs text-slate-500">
                          Limit {budget.limit} {budget.currency}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-slate-200">
                        {spent.toFixed(2)}
                      </p>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800/70">
                      <div
                        className="h-full rounded-full bg-emerald-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-50">
            FX rate
          </h2>
          <p className="text-sm text-slate-400">
            Manual USD/KZT rate for conversions.
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <p className="text-slate-200">
              Current rate: 1 USD = {rate?.rate ?? "—"} KZT
            </p>
            <p className="text-slate-500">
              Update it in the Transactions page.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
