"use client";

import { useRouter } from "next/navigation";
import TransactionForm, {
  TransactionFormValues,
} from "@/components/TransactionForm";

export default function NewTransactionPage() {
  const router = useRouter();

  async function handleSubmit(values: TransactionFormValues) {
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload.error?.formErrors?.[0] ?? "Failed to create");
    }

    router.push("/transactions");
    router.refresh();
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">
        Add transaction
      </h1>
      <p className="text-sm text-slate-500">Record a new income or expense.</p>
      <div className="mt-6">
        <TransactionForm onSubmit={handleSubmit} submitLabel="Create" />
      </div>
    </div>
  );
}
