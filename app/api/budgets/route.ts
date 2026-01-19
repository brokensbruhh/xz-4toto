import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { BudgetInput } from "@/lib/validators";

export async function GET() {
  const userId = requireUserId();
  const items = await prisma.budget.findMany({
    where: { userId },
    orderBy: { category: "asc" },
  });
  return Response.json({ items });
}

export async function POST(req: Request) {
  const userId = requireUserId();
  const body = await req.json().catch(() => null);
  const parsed = BudgetInput.safeParse(body);

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
    });
  }

  const data = parsed.data;

  const item = await prisma.budget.upsert({
    where: { userId_category: { userId, category: data.category } },
    update: { limit: data.limit, currency: data.currency },
    create: { userId, category: data.category, limit: data.limit, currency: data.currency },
  });

  return Response.json({ item }, { status: 201 });
}

export async function DELETE(req: Request) {
  const userId = requireUserId();
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return new Response("Missing id", { status: 400 });

  const existing = await prisma.budget.findFirst({ where: { id, userId } });
  if (!existing) return new Response("Not found", { status: 404 });

  await prisma.budget.delete({ where: { id } });
  return Response.json({ ok: true });
}
