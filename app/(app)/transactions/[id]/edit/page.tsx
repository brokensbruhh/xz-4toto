"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TransactionForm, {
  TransactionFormValues,
} from "@/components/TransactionForm";

export default function EditTransactionPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [initial, setInitial] = useState<TransactionFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/transactions?`);
      const data = await res.json();
      const item = data.items.find((tx: any) => tx.id === params.id);
      if (!item) {
        setError("Transaction not found");
        return;
      }
      setInitial({
        type: item.type,
        amount: item.amount,
        currency: item.currency,
        category: item.category,
        note: item.note ?? "",
        date: new Date(item.date).toISOString(),
      });
    }
    load();
  }, [params.id]);

  async function handleSubmit(values: TransactionFormValues) {
    const res = await fetch(`/api/transactions/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload.error?.formErrors?.[0] ?? "Failed to update");
    }

    router.push("/transactions");
    router.refresh();
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-rose-500">{error}</p>
      </div>
    );
  }

  if (!initial) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Edit transaction</h1>
      <p className="text-sm text-slate-500">
        Update transaction details.
      </p>
      <div className="mt-6">
        <TransactionForm
          initial={initial}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
