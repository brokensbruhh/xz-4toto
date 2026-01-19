import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { HoldingInput, HoldingUpdateInput } from "@/lib/validators";

export async function GET() {
  const userId = requireUserId();
  const items = await prisma.holding.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
  return Response.json({ items });
}

export async function POST(req: Request) {
  const userId = requireUserId();
  const body = await req.json().catch(() => null);
  const parsed = HoldingInput.safeParse(body);

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
    });
  }

  const data = parsed.data;

  const item = await prisma.holding.upsert({
    where: { userId_coinId: { userId, coinId: data.coinId } },
    update: { amount: data.amount, symbol: data.symbol, name: data.name },
    create: {
      userId,
      coinId: data.coinId,
      symbol: data.symbol,
      name: data.name,
      amount: data.amount,
    },
  });

  return Response.json({ item }, { status: 201 });
}

export async function PATCH(req: Request) {
  const userId = requireUserId();
  const body = await req.json().catch(() => null);
  const parsed = HoldingUpdateInput.safeParse(body);

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
    });
  }

  const item = await prisma.holding.findFirst({
    where: { id: parsed.data.id, userId },
  });
  if (!item) return new Response("Not found", { status: 404 });

  const updated = await prisma.holding.update({
    where: { id: parsed.data.id },
    data: { amount: parsed.data.amount },
  });

  return Response.json({ item: updated });
}

export async function DELETE(req: Request) {
  const userId = requireUserId();
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return new Response("Missing id", { status: 400 });

  const existing = await prisma.holding.findFirst({ where: { id, userId } });
  if (!existing) return new Response("Not found", { status: 404 });

  await prisma.holding.delete({ where: { id } });
  return Response.json({ ok: true });
}
