import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { fetchCoinPrices } from "@/lib/coingecko";

export async function GET() {
  const userId = requireUserId();
  const holdings = await prisma.holding.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  const ids = holdings.map((holding) => holding.coinId);
  const prices = await fetchCoinPrices(ids);

  const coins = holdings.map((holding) => {
    const price = prices.find((item) => item.id === holding.coinId);
    const priceUsd = price?.current_price ?? 0;
    const value = priceUsd * Number(holding.amount);
    return {
      id: holding.id,
      coinId: holding.coinId,
      symbol: holding.symbol,
      name: holding.name,
      amount: holding.amount,
      price: priceUsd,
      value,
      change24h: price?.price_change_percentage_24h ?? null,
    };
  });

  const totalCrypto = coins.reduce((sum, coin) => sum + coin.value, 0);
  const coinAllocations = coins.map((coin) => ({
    ...coin,
    allocation: totalCrypto ? (coin.value / totalCrypto) * 100 : 0,
  }));

  const transactions = await prisma.transaction.findMany({
    where: { userId },
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

  const assetClasses = [
    { label: "Cash", value: cash },
    { label: "Crypto", value: totalCrypto },
  ];

  return Response.json({ assetClasses, coins: coinAllocations });
}
