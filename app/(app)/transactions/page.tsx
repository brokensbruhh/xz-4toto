"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TransactionsTable, {
  TransactionItem,
} from "@/components/TransactionsTable";

const emptyFilters = {
  from: "",
  to: "",
  type: "",
  category: "",
};

type Budget = {
  id: string;
  category: string;
  limit: string;
  currency: "USD" | "KZT";
};

type Rate = {
  id: string;
  base: "USD" | "KZT";
  quote: "USD" | "KZT";
  rate: string;
};

export default function TransactionsPage() {
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [rate, setRate] = useState<Rate | null>(null);
  const [budgetForm, setBudgetForm] = useState({
    category: "",
    limit: "",
    currency: "USD" as "USD" | "KZT",
  });
  const [rateForm, setRateForm] = useState({ base: "USD", quote: "KZT", rate: "" });

  const conversionRate = useMemo(() => {
    if (!rate) return null;
    return Number(rate.rate);
  }, [rate]);

  async function loadData() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    if (filters.type) params.set("type", filters.type);
    if (filters.category) params.set("category", filters.category);

    const [txRes, budgetRes, rateRes] = await Promise.all([
      fetch(`/api/transactions?${params.toString()}`),
      fetch("/api/budgets"),
      fetch("/api/rates"),
    ]);

    const txJson = await txRes.json();
    const budgetJson = await budgetRes.json();
    const rateJson = await rateRes.json();

    setItems(txJson.items ?? []);
    setBudgets(budgetJson.items ?? []);
    const usdKzt = (rateJson.items ?? []).find(
      (r: Rate) => r.base === "USD" && r.quote === "KZT"
    );
    setRate(usdKzt ?? null);
    setRateForm((prev) => ({ ...prev, rate: usdKzt?.rate ?? "" }));
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this transaction?")) return;
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    await loadData();
  }

  async function handleFiltersSubmit(event: React.FormEvent) {
    event.preventDefault();
    await loadData();
  }

  function parseCsv(text: string) {
    const rows = text.split("\n").map((row) => row.trim());
    return rows
      .filter((row) => row.length > 0)
      .map((row) => row.split(","))
      .map((cols) => ({
        date: cols[0],
        type: cols[1],
        amount: cols[2],
        currency: cols[3],
        category: cols[4],
        note: cols[5] ?? "",
      }));
  }

  async function handleCsvUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rows = parseCsv(text);
    setMessage("Importing...");

    try {
      await Promise.all(
        rows.map((row) =>
          fetch("/api/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: row.type,
              amount: row.amount,
              currency: row.currency,
              category: row.category,
              note: row.note,
              date: new Date(row.date).toISOString(),
            }),
          })
        )
      );
      setMessage("CSV import completed");
      await loadData();
    } catch (err) {
      setMessage("Failed to import CSV");
    }
  }

  async function handleBudgetSubmit(event: React.FormEvent) {
    event.preventDefault();
    await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(budgetForm),
    });
    setBudgetForm({ category: "", limit: "", currency: "USD" });
    await loadData();
  }

  async function deleteBudget(id: string) {
    await fetch(`/api/budgets?id=${id}`, { method: "DELETE" });
    await loadData();
  }

  async function handleRateSubmit(event: React.FormEvent) {
    event.preventDefault();
    await fetch("/api/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rateForm),
    });
    await loadData();
  }

  const converted = items.map((item) => {
    if (item.currency === "USD" || !conversionRate) return item;
    return {
      ...item,
      amount: (Number(item.amount) / conversionRate).toFixed(2),
      currency: "USD" as const,
    };
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Transactions
          </h1>
          <p className="text-sm text-slate-500">
            Filter, import, and manage your cash flow.
          </p>
        </div>
        <Link
          href="/transactions/new"
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          Add transaction
        </Link>
      </header>

      <form
        onSubmit={handleFiltersSubmit}
        className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-4"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">From</label>
          <input
            type="date"
            value={filters.from}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, from: event.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">To</label>
          <input
            type="date"
            value={filters.to}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, to: event.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Type</label>
          <select
            value={filters.type}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, type: event.target.value }))
            }
          >
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Category</label>
          <input
            value={filters.category}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, category: event.target.value }))
            }
            placeholder="e.g. Rent"
          />
        </div>
        <div className="md:col-span-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Apply filters
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
            onClick={() => setFilters(emptyFilters)}
          >
            Reset
          </button>
          <label className="text-sm font-medium text-slate-600">
            CSV Import
            <input
              type="file"
              accept=".csv"
              className="mt-2 block text-sm"
              onChange={handleCsvUpload}
            />
          </label>
          {message ? <p className="text-sm text-slate-500">{message}</p> : null}
        </div>
      </form>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">
            All transactions
          </h2>
          <p className="text-sm text-slate-500">
            {loading ? "Loading..." : `${items.length} items`}
          </p>
          <div className="mt-4">
            <TransactionsTable items={items} onDelete={handleDelete} />
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Manual FX rate
            </h3>
            <p className="text-sm text-slate-500">
              Set USD/KZT conversion for reporting.
            </p>
            <form onSubmit={handleRateSubmit} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input value={rateForm.base} disabled />
                <input value={rateForm.quote} disabled />
              </div>
              <input
                value={rateForm.rate}
                onChange={(event) =>
                  setRateForm((prev) => ({ ...prev, rate: event.target.value }))
                }
                placeholder="470"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Save rate
              </button>
            </form>
            <p className="mt-3 text-xs text-slate-400">
              Converted preview shown below.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Budgets</h3>
            <form onSubmit={handleBudgetSubmit} className="mt-4 space-y-3">
              <input
                value={budgetForm.category}
                onChange={(event) =>
                  setBudgetForm((prev) => ({ ...prev, category: event.target.value }))
                }
                placeholder="Category"
              />
              <input
                value={budgetForm.limit}
                onChange={(event) =>
                  setBudgetForm((prev) => ({ ...prev, limit: event.target.value }))
                }
                placeholder="Limit"
              />
              <select
                value={budgetForm.currency}
                onChange={(event) =>
                  setBudgetForm((prev) => ({ ...prev, currency: event.target.value as "USD" | "KZT" }))
                }
              >
                <option value="USD">USD</option>
                <option value="KZT">KZT</option>
              </select>
              <button
                type="submit"
                className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Save budget
              </button>
            </form>
            <div className="mt-4 space-y-2">
              {budgets.length === 0 ? (
                <p className="text-sm text-slate-400">No budgets yet.</p>
              ) : (
                budgets.map((budget) => (
                  <div
                    key={budget.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-700">
                        {budget.category}
                      </p>
                      <p className="text-xs text-slate-400">
                        {budget.limit} {budget.currency}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteBudget(budget.id)}
                      className="text-xs font-semibold text-rose-500"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              USD preview
            </h3>
            <p className="text-sm text-slate-500">
              Converted amounts using the manual rate.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {converted.slice(0, 5).map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>{item.category}</span>
                  <span className="font-semibold">
                    {item.amount} {item.currency}
                  </span>
                </li>
              ))}
              {converted.length === 0 ? (
                <li className="text-slate-400">No data yet.</li>
              ) : null}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
