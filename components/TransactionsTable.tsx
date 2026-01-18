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
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Note</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-slate-400" colSpan={6}>
                No transactions found.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="text-slate-700">
                <td className="px-4 py-3">{item.date.slice(0, 10)}</td>
                <td className="px-4 py-3 capitalize">{item.type}</td>
                <td className="px-4 py-3">{item.category}</td>
                <td className="px-4 py-3 font-semibold">
                  {item.amount} {item.currency}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {item.note ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/transactions/${item.id}/edit`}
                      className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-brand-300 hover:text-brand-600"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="rounded-md border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-500 hover:bg-rose-50"
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
