import { SearchQuery } from "@/lib/validators";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = SearchQuery.safeParse({ q: url.searchParams.get("q") ?? "" });

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
    });
  }

  const query = parsed.data.q;
  const searchUrl = new URL("https://api.coingecko.com/api/v3/search");
  searchUrl.searchParams.set("query", query);

  const searchRes = await fetch(searchUrl.toString());
  if (!searchRes.ok) {
    return new Response(JSON.stringify({ error: "Search failed" }), {
      status: 502,
    });
  }

  const searchJson = await searchRes.json();
  const coins = (searchJson.coins ?? []).slice(0, 8);
  const ids = coins.map((coin: { id: string }) => coin.id);

  const marketUrl = new URL("https://api.coingecko.com/api/v3/coins/markets");
  marketUrl.searchParams.set("vs_currency", "usd");
  marketUrl.searchParams.set("ids", ids.join(","));
  marketUrl.searchParams.set("order", "market_cap_desc");
  marketUrl.searchParams.set("per_page", "8");
  marketUrl.searchParams.set("page", "1");
  marketUrl.searchParams.set("sparkline", "false");

  const marketRes = ids.length ? await fetch(marketUrl.toString()) : null;
  const marketJson = marketRes && marketRes.ok ? await marketRes.json() : [];

  const results = coins.map((coin: any) => {
    const market = marketJson.find((item: any) => item.id === coin.id);
    return {
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol?.toUpperCase() ?? "",
      thumb: coin.thumb,
      price: market?.current_price ?? null,
      change24h: market?.price_change_percentage_24h ?? null,
    };
  });

  return Response.json({ results });
}
