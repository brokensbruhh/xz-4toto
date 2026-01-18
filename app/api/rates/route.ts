import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { RateInput } from "@/lib/validators";

export async function GET() {
  const userId = requireUserId();
  const items = await prisma.exchangeRate.findMany({ where: { userId } });
  return Response.json({ items });
}

export async function POST(req: Request) {
  const userId = requireUserId();
  const body = await req.json().catch(() => null);
  const parsed = RateInput.safeParse(body);

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
    });
  }

  const data = parsed.data;

  const item = await prisma.exchangeRate.upsert({
    where: { userId_base_quote: { userId, base: data.base, quote: data.quote } },
    update: { rate: data.rate },
    create: { userId, base: data.base, quote: data.quote, rate: data.rate },
  });

  return Response.json({ item }, { status: 201 });
}
