import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { TransactionInput } from "@/lib/validators";

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  const userId = requireUserId();
  const body = await req.json().catch(() => null);
  const parsed = TransactionInput.safeParse(body);

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
    });
  }

  const id = ctx.params.id;

  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) return new Response("Not found", { status: 404 });

  const data = parsed.data;

  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      type: data.type,
      amount: data.amount,
      currency: data.currency,
      category: data.category,
      note: data.note && data.note.length ? data.note : null,
      date: new Date(data.date),
    },
  });

  return Response.json({ item: updated });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  const userId = requireUserId();
  const id = ctx.params.id;

  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) return new Response("Not found", { status: 404 });

  await prisma.transaction.delete({ where: { id } });
  return Response.json({ ok: true });
}
