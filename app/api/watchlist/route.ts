import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { WatchlistInput } from "@/lib/validators";

export async function GET() {
  const userId = requireUserId();
  const items = await prisma.watchlistItem.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
  return Response.json({ items });
}

export async function POST(req: Request) {
  const userId = requireUserId();
  const body = await req.json().catch(() => null);
  const parsed = WatchlistInput.safeParse(body);

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
    });
  }

  const data = parsed.data;

  const item = await prisma.watchlistItem.upsert({
    where: { userId_coinId: { userId, coinId: data.coinId } },
    update: { symbol: data.symbol, name: data.name },
    create: {
      userId,
      coinId: data.coinId,
      symbol: data.symbol,
      name: data.name,
    },
  });

  return Response.json({ item }, { status: 201 });
}

export async function DELETE(req: Request) {
  const userId = requireUserId();
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return new Response("Missing id", { status: 400 });

  const existing = await prisma.watchlistItem.findFirst({ where: { id, userId } });
  if (!existing) return new Response("Not found", { status: 404 });

  await prisma.watchlistItem.delete({ where: { id } });
  return Response.json({ ok: true });
}
