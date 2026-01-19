"use client";

import { useEffect, useMemo, useState } from "react";
import DonutChart from "@/components/DonutChart";

type AllocationCoin = {
  id: string;
  coinId: string;
  symbol: string;
  name: string;
  amount: string;
  price: number;
  value: number;
  allocation: number;
  change24h: number | null;
};

type AllocationResponse = {
  assetClasses: { label: string; value: number }[];
  coins: AllocationCoin[];
};

type ExplainResult = {
  summary: string;
  evidence: { title: string; publishedAt: string; url: string }[];
};

export default function PortfolioPage() {
  const [data, setData] = useState<AllocationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [explain, setExplain] = useState<Record<string, ExplainResult>>({});

  async function loadData() {
    setLoading(true);
    const res = await fetch("/api/portfolio/allocation");
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const assetLabels = data?.assetClasses.map((item) => item.label) ?? [];
  const assetValues = data?.assetClasses.map((item) => item.value) ?? [];

  const coinLabels = data?.coins.map((coin) => coin.symbol.toUpperCase()) ?? [];
  const coinValues = data?.coins.map((coin) => coin.value) ?? [];

  async function updateAmount(id: string, amount: string) {
    const res = await fetch("/api/holdings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, amount }),
    });
    if (!res.ok) {
      setMessage("Failed to update holding");
      return;
    }
    setMessage("Holding updated");
    await loadData();
  }

  async function removeHolding(id: string) {
    if (!confirm("Remove this holding?")) return;
    await fetch(`/api/holdings?id=${id}`, { method: "DELETE" });
    await loadData();
  }

  async function explainMove(coinId: string) {
    setMessage("Generating explanation...");
    const res = await fetch(`/api/ai/explain-move?coinId=${coinId}&days=7`);
    const json = await res.json();
    if (!res.ok) {
      setMessage(json.error ?? "Failed to fetch explanation");
      return;
    }
    setExplain((prev) => ({ ...prev, [coinId]: json }));
    setMessage(null);
  }

  const rows = useMemo(() => data?.coins ?? [], [data]);

  return (
    <div className="space-y-6">
      <header className="card flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-50">
            Portfolio Allocation
          </h2>
          <p className="text-sm text-slate-400">
            Track asset class split and coin exposure.
          </p>
        </div>
        {message ? <p className="text-sm text-slate-400">{message}</p> : null}
      </header>

      {loading ? (
        <div className="card p-6 text-slate-400">Loading allocation...</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <DonutChart
            title="Asset Class Allocation"
            labels={assetLabels}
            values={assetValues}
          />
          <DonutChart
            title="Crypto Breakdown"
            labels={coinLabels}
            values={coinValues}
          />
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/80 text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Coin</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Allocation</th>
              <th className="px-4 py-3">24h</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={7}>
                  No holdings yet. Add some from the watchlist search.
                </td>
              </tr>
            ) : (
              rows.map((coin) => (
                <tr key={coin.id} className="text-slate-200">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-100">
                      {coin.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {coin.symbol.toUpperCase()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className="w-24"
                      defaultValue={coin.amount}
                      onBlur={(event) =>
                        updateAmount(coin.id, event.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-3">${coin.price.toFixed(2)}</td>
                  <td className="px-4 py-3">${coin.value.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    {coin.allocation.toFixed(2)}%
                  </td>
                  <td
                    className={`px-4 py-3 font-semibold ${
                      (coin.change24h ?? 0) >= 0
                        ? "text-emerald-300"
                        : "text-rose-300"
                    }`}
                  >
                    {coin.change24h !== null
                      ? `${coin.change24h.toFixed(2)}%`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => explainMove(coin.coinId)}
                        className="rounded-md border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300 hover:border-emerald-400/60 hover:text-emerald-300"
                      >
                        Explain last 7d move
                      </button>
                      <button
                        onClick={() => removeHolding(coin.id)}
                        className="rounded-md border border-rose-500/40 px-3 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-500/10"
                      >
                        Delete
                      </button>
                    </div>
                    {explain[coin.coinId] ? (
                      <div className="mt-3 text-xs text-slate-400">
                        <p className="whitespace-pre-wrap">
                          {explain[coin.coinId].summary}
                        </p>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
