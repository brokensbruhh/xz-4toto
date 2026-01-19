import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { PortfolioSummaryQuery } from "@/lib/validators";
import { fetchCoinPrices } from "@/lib/coingecko";

function parseDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET(req: Request) {
  const userId = requireUserId();
  const url = new URL(req.url);
  const parsed = PortfolioSummaryQuery.safeParse({
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
  });

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
    });
  }

  const from = parseDate(parsed.data.from);
  const to = parseDate(parsed.data.to);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
  });

  const exchangeRate = await prisma.exchangeRate.findFirst({
    where: { userId, base: "USD", quote: "KZT" },
  });
  const usdToKzt = exchangeRate ? Number(exchangeRate.rate) : null;

  const cash = transactions.reduce((acc, tx) => {
    const amount = Number(tx.amount);
    const normalized =
      tx.currency === "KZT" && usdToKzt ? amount / usdToKzt : amount;
    return tx.type === "income" ? acc + normalized : acc - normalized;
  }, 0);

  const holdings = await prisma.holding.findMany({
    where: { userId },
  });
  const ids = holdings.map((holding) => holding.coinId);
  const prices = await fetchCoinPrices(ids);

  const crypto = holdings.reduce((sum, holding) => {
    const price = prices.find((item) => item.id === holding.coinId);
    return sum + (price?.current_price ?? 0) * Number(holding.amount);
  }, 0);

  return Response.json({
    cash,
    crypto,
    net: cash + crypto,
  });
}
