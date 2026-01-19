export type CoinPrice = {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number | null;
};

type CacheEntry = {
  expiresAt: number;
  data: CoinPrice[];
};

const marketCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60_000;

function cacheKey(ids: string[]) {
  return ids.slice().sort().join(",");
}

export async function fetchCoinPrices(ids: string[]): Promise<CoinPrice[]> {
  if (ids.length === 0) return [];
  const key = cacheKey(ids);
  const cached = marketCache.get(key);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const url = new URL("https://api.coingecko.com/api/v3/coins/markets");
  url.searchParams.set("vs_currency", "usd");
  url.searchParams.set("ids", ids.join(","));
  url.searchParams.set("order", "market_cap_desc");
  url.searchParams.set("per_page", String(Math.min(ids.length, 50)));
  url.searchParams.set("page", "1");
  url.searchParams.set("sparkline", "false");

  const res = await fetch(url.toString(), { next: { revalidate: 30 } });
  if (!res.ok) throw new Error("Failed to fetch CoinGecko prices");
  const data = (await res.json()) as CoinPrice[];
  marketCache.set(key, { data, expiresAt: now + CACHE_TTL_MS });
  return data;
}
