import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userId = "demo";

  await prisma.transaction.createMany({
    data: [
      {
        userId,
        type: "income",
        amount: "2500.00",
        currency: "USD",
        category: "Salary",
        note: "June payout",
        date: new Date(),
      },
      {
        userId,
        type: "expense",
        amount: "120.50",
        currency: "USD",
        category: "Groceries",
        note: "Weekly shop",
        date: new Date(),
      },
      {
        userId,
        type: "expense",
        amount: "85000",
        currency: "KZT",
        category: "Rent",
        note: "Apartment",
        date: new Date(),
      }
    ],
  });

  await prisma.watchlistItem.createMany({
    data: [
      { userId, coinId: "bitcoin", symbol: "BTC", name: "Bitcoin" },
      { userId, coinId: "ethereum", symbol: "ETH", name: "Ethereum" },
      { userId, coinId: "solana", symbol: "SOL", name: "Solana" },
    ],
    skipDuplicates: true,
  });

  await prisma.budget.createMany({
    data: [
      { userId, category: "Groceries", limit: "300", currency: "USD" },
      { userId, category: "Rent", limit: "100000", currency: "KZT" },
      { userId, category: "Travel", limit: "200", currency: "USD" },
    ],
    skipDuplicates: true,
  });

  await prisma.exchangeRate.upsert({
    where: {
      userId_base_quote: { userId, base: "USD", quote: "KZT" },
    },
    update: { rate: "470" },
    create: { userId, base: "USD", quote: "KZT", rate: "470" },
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
