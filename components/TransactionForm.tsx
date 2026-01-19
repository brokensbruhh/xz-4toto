"use client";

import { useState } from "react";

export type TransactionFormValues = {
  type: "income" | "expense";
  amount: string;
  currency: "USD" | "KZT";
  category: string;
  note?: string;
  date: string;
};

type TransactionFormProps = {
  initial?: TransactionFormValues;
  onSubmit: (values: TransactionFormValues) => Promise<void>;
  submitLabel: string;
};

export default function TransactionForm({
  initial,
  onSubmit,
  submitLabel,
}: TransactionFormProps) {
  const [form, setForm] = useState<TransactionFormValues>(
    initial ?? {
      type: "expense",
      amount: "",
      currency: "USD",
      category: "",
      note: "",
      date: new Date().toISOString(),
    }
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof TransactionFormValues>(
    key: K,
    value: TransactionFormValues[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(form);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Type</label>
          <select
            value={form.type}
            onChange={(event) =>
              update("type", event.target.value as "income" | "expense")
            }
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Amount</label>
          <input
            type="text"
            value={form.amount}
            onChange={(event) => update("amount", event.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Currency</label>
          <select
            value={form.currency}
            onChange={(event) =>
              update("currency", event.target.value as "USD" | "KZT")
            }
          >
            <option value="USD">USD</option>
            <option value="KZT">KZT</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Category</label>
          <input
            value={form.category}
            onChange={(event) => update("category", event.target.value)}
            placeholder="e.g. Groceries"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Date</label>
          <input
            type="datetime-local"
            value={form.date.slice(0, 16)}
            onChange={(event) =>
              update("date", new Date(event.target.value).toISOString())
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Note</label>
          <input
            value={form.note}
            onChange={(event) => update("note", event.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

      {error ? <p className="text-sm text-rose-500">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
