"use client";

import Link from "next/link";

export type TransactionItem = {
  id: string;
  type: "income" | "expense";
  amount: string;
  currency: "USD" | "KZT";
  category: string;
  note: string | null;
  date: string;
};

type TransactionsTableProps = {
  items: TransactionItem[];
  onDelete: (id: string) => Promise<void>;
};

export default function TransactionsTable({
  items,
  onDelete,
}: TransactionsTableProps) {
  return (
    <div className="card overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-900/80 text-left text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Note</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {items.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-slate-500" colSpan={6}>
                No transactions found.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="text-slate-200">
                <td className="px-4 py-3 text-slate-400">
                  {item.date.slice(0, 10)}
                </td>
                <td className="px-4 py-3 capitalize">{item.type}</td>
                <td className="px-4 py-3">{item.category}</td>
                <td className="px-4 py-3 font-semibold text-slate-100">
                  {item.amount} {item.currency}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {item.note ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/transactions/${item.id}/edit`}
                      className="rounded-md border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300 hover:border-emerald-400/60 hover:text-emerald-300"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="rounded-md border border-rose-500/40 px-3 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
