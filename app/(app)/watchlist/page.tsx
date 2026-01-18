"use client";

import { useEffect, useState } from "react";
import CryptoTable from "@/components/CryptoTable";

type WatchlistItem = {
  id: string;
  coinId: string;
  symbol: string;
  name: string;
};

type CoinPrice = {
  id: string;
  current_price: number;
  price_change_percentage_24h: number | null;
};

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ coinId: "", symbol: "", name: "" });

  async function loadItems() {
    setLoading(true);
    const res = await fetch("/api/watchlist");
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function addItem(event: React.FormEvent) {
    event.preventDefault();
    await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ coinId: "", symbol: "", name: "" });
    await loadItems();
  }

  async function removeItem(id: string) {
    await fetch(`/api/watchlist?id=${id}`, { method: "DELETE" });
    await loadItems();
  }

  async function loadPrices(ids: string[]) {
    if (ids.length === 0) return [] as CoinPrice[];
    const url = new URL("https://api.coingecko.com/api/v3/coins/markets");
    url.searchParams.set("vs_currency", "usd");
    url.searchParams.set("ids", ids.join(","));
    url.searchParams.set("order", "market_cap_desc");
    url.searchParams.set("per_page", String(Math.min(ids.length, 50)));
    url.searchParams.set("page", "1");
    url.searchParams.set("sparkline", "false");
    const res = await fetch(url.toString());
    if (!res.ok) return [];
    return res.json();
  }

  const [prices, setPrices] = useState<CoinPrice[]>([]);

  useEffect(() => {
    async function fetchPrices() {
      const ids = items.map((item) => item.coinId);
      const data = await loadPrices(ids);
      setPrices(data);
    }
    fetchPrices();
  }, [items]);

  const tableItems = items.map((item) => {
    const price = prices.find((p) => p.id === item.coinId);
    return {
      id: item.id,
      name: item.name,
      symbol: item.symbol,
      price: price?.current_price ?? null,
      change24h: price?.price_change_percentage_24h ?? null,
    };
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-50">
          Crypto watchlist
        </h1>
        <p className="text-sm text-slate-400">
          Track live prices with CoinGecko.
        </p>
      </header>

      <form
        onSubmit={addItem}
        className="card grid gap-4 p-6 md:grid-cols-3"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Coin ID</label>
          <input
            value={form.coinId}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, coinId: event.target.value }))
            }
            placeholder="bitcoin"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Symbol</label>
          <input
            value={form.symbol}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, symbol: event.target.value }))
            }
            placeholder="BTC"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Name</label>
          <input
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, name: event.target.value }))
            }
            placeholder="Bitcoin"
          />
        </div>
        <div className="md:col-span-3">
          <button
            type="submit"
            className="rounded-lg bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Add to watchlist
          </button>
          {loading ? (
            <span className="ml-3 text-sm text-slate-500">Loading...</span>
          ) : null}
        </div>
      </form>

      <CryptoTable items={tableItems} onRemove={removeItem} />
    </div>
  );
}
