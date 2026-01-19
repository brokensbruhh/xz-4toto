import { ExplainMoveQuery } from "@/lib/validators";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const NEWS_URL = "https://newsapi.org/v2/everything";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = ExplainMoveQuery.safeParse({
    coinId: url.searchParams.get("coinId") ?? "",
    days: url.searchParams.get("days") ?? "7",
  });

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
    });
  }

  const openAiKey = process.env.OPENAI_API_KEY;
  const newsKey = process.env.NEWS_API_KEY;
  if (!openAiKey || !newsKey) {
    return new Response(
      JSON.stringify({
        error:
          "Missing OPENAI_API_KEY or NEWS_API_KEY. Set them in your environment.",
      }),
      { status: 400 }
    );
  }

  const days = Number(parsed.data.days ?? 7);
  const coinId = parsed.data.coinId;

  const marketUrl = new URL("https://api.coingecko.com/api/v3/coins/markets");
  marketUrl.searchParams.set("vs_currency", "usd");
  marketUrl.searchParams.set("ids", coinId);
  marketUrl.searchParams.set("sparkline", "false");
  marketUrl.searchParams.set("price_change_percentage", "7d");

  const marketRes = await fetch(marketUrl.toString());
  if (!marketRes.ok) {
    return new Response(JSON.stringify({ error: "Price fetch failed" }), {
      status: 502,
    });
  }

  const marketJson = await marketRes.json();
  const market = marketJson[0];
  const coinName = market?.name ?? coinId;
  const priceChange = market?.price_change_percentage_7d_in_currency ?? null;

  const newsUrl = new URL(NEWS_URL);
  newsUrl.searchParams.set("q", coinName);
  newsUrl.searchParams.set("language", "en");
  newsUrl.searchParams.set("sortBy", "publishedAt");
  newsUrl.searchParams.set("pageSize", "5");
  newsUrl.searchParams.set("apiKey", newsKey);

  const newsRes = await fetch(newsUrl.toString());
  if (!newsRes.ok) {
    return new Response(JSON.stringify({ error: "News fetch failed" }), {
      status: 502,
    });
  }

  const newsJson = await newsRes.json();
  const articles = (newsJson.articles ?? []).map((article: any) => ({
    title: article.title,
    url: article.url,
    publishedAt: article.publishedAt,
    source: article.source?.name ?? "Unknown",
  }));

  if (articles.length === 0) {
    return Response.json({
      summary:
        "Not enough recent news coverage to explain the move without speculation.",
      evidence: [],
      priceChange,
    });
  }

  const prompt = `You are a crypto analyst. Explain the last ${days}d move for ${coinName}.

Rules:
- Only use evidence from the provided news items.
- If the news is insufficient, say so and avoid speculation.
- Provide a short paragraph followed by a bullet list of cited headlines with dates.

News items:
${articles
    .map(
      (article: any) =>
        `- ${article.title} (${article.publishedAt}) [${article.source}]`
    )
    .join("\n")}

Price change over ${days}d: ${priceChange ?? "unknown"}%.
`;

  const aiRes = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Respond in concise English." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    }),
  });

  if (!aiRes.ok) {
    const text = await aiRes.text();
    return new Response(JSON.stringify({ error: text }), { status: 502 });
  }

  const aiJson = await aiRes.json();
  const content = aiJson.choices?.[0]?.message?.content ?? "";

  return Response.json({
    summary: content,
    evidence: articles,
    priceChange,
  });
}
