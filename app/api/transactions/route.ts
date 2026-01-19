import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { TransactionInput } from "@/lib/validators";

export async function GET(req: Request) {
  const userId = requireUserId();
  const url = new URL(req.url);

  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const type = url.searchParams.get("type");
  const category = url.searchParams.get("category");

  const where: { userId: string; type?: string; category?: string; date?: any } = {
    userId,
  };

  if (type === "income" || type === "expense") where.type = type;
  if (category) where.category = category;

  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);
  }

  const items = await prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
  });

  return Response.json({ items });
}

export async function POST(req: Request) {
  const userId = requireUserId();
  const body = await req.json().catch(() => null);
  const parsed = TransactionInput.safeParse(body);

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
    });
  }

  const data = parsed.data;

  const created = await prisma.transaction.create({
    data: {
      userId,
      type: data.type,
      amount: data.amount,
      currency: data.currency,
      category: data.category,
      note: data.note && data.note.length ? data.note : null,
      date: new Date(data.date),
    },
  });

  return Response.json({ item: created }, { status: 201 });
}
