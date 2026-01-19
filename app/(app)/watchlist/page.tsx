"use client";

import { useEffect, useMemo, useState } from "react";
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

type SearchResult = {
  id: string;
  name: string;
  symbol: string;
  thumb: string | null;
  price: number | null;
  change24h: number | null;
};

type ExplainResult = {
  summary: string;
  evidence: { title: string; publishedAt: string; url: string }[];
};

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ coinId: "", symbol: "", name: "" });
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [explain, setExplain] = useState<Record<string, ExplainResult>>({});

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

  async function addWatchlistFromSearch(result: SearchResult) {
    await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coinId: result.id,
        symbol: result.symbol,
        name: result.name,
      }),
    });
    await loadItems();
  }

  async function addHoldingFromSearch(result: SearchResult) {
    const amount = prompt(`Amount of ${result.symbol} to add?`, "0.0");
    if (!amount) return;
    await fetch("/api/holdings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coinId: result.id,
        symbol: result.symbol,
        name: result.name,
        amount,
      }),
    });
    setMessage("Added holding");
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

  useEffect(() => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    const handler = setTimeout(async () => {
      setSearching(true);
      const res = await fetch(`/api/coingecko/search?q=${query}`);
      const json = await res.json();
      setSearchResults(json.results ?? []);
      setSearching(false);
    }, 350);
    return () => clearTimeout(handler);
  }, [query]);

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

  const tableItems = useMemo(
    () =>
      items.map((item) => {
        const price = prices.find((p) => p.id === item.coinId);
        return {
          id: item.id,
          coinId: item.coinId,
          name: item.name,
          symbol: item.symbol,
          price: price?.current_price ?? null,
          change24h: price?.price_change_percentage_24h ?? null,
        };
      }),
    [items, prices]
  );

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

      <div className="card p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-300">
            Search coins
          </label>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Bitcoin, Ethereum..."
          />
        </div>
        {searching ? (
          <p className="text-sm text-slate-400">Searching...</p>
        ) : null}
        {searchResults.length > 0 ? (
          <div className="space-y-3">
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800/70 bg-slate-900/60 px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-3">
                  {result.thumb ? (
                    <img
                      src={result.thumb}
                      alt=""
                      className="h-6 w-6 rounded-full"
                    />
                  ) : null}
                  <div>
                    <p className="font-medium text-slate-200">
                      {result.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {result.symbol}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-slate-300">
                  <span>
                    {result.price !== null
                      ? `$${result.price.toFixed(2)}`
                      : "—"}
                  </span>
                  <span
                    className={
                      (result.change24h ?? 0) >= 0
                        ? "text-emerald-300"
                        : "text-rose-300"
                    }
                  >
                    {result.change24h !== null
                      ? `${result.change24h.toFixed(2)}%`
                      : "—"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => addWatchlistFromSearch(result)}
                    className="rounded-md border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300 hover:border-emerald-400/60 hover:text-emerald-300"
                  >
                    Add to watchlist
                  </button>
                  <button
                    onClick={() => addHoldingFromSearch(result)}
                    className="rounded-md border border-emerald-500/40 px-3 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10"
                  >
                    Add as holding
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

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
          {message ? (
            <span className="ml-3 text-sm text-slate-500">{message}</span>
          ) : null}
        </div>
      </form>

      <CryptoTable items={tableItems} onRemove={removeItem} onExplain={explainMove} />

      {Object.keys(explain).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(explain).map(([coinId, info]) => (
            <div key={coinId} className="card p-4 text-sm text-slate-300">
              <p className="font-semibold text-slate-100">{coinId}</p>
              <p className="mt-2 whitespace-pre-wrap">{info.summary}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
