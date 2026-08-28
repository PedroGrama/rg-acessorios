import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { validateProductInput } from "@/lib/product-validation";

export async function GET(request: Request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const products = await prisma.product.findMany({
    include: { category: true, images: true, variations: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await request.json();
  const validated = validateProductInput(body);
  if (validated.error) return NextResponse.json({ error: validated.error }, { status: 400 });
  const product = await prisma.product.create({
    data: {
      ...validated.data!,
      images: body.imageUrl ? { create: { url: body.imageUrl, isMain: true } } : undefined,
    },
    include: { category: true, images: true },
  });
  return NextResponse.json(product, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await request.json();
  const validated = validateProductInput(body);
  if (validated.error) return NextResponse.json({ error: validated.error }, { status: 400 });
  const product = await prisma.product.update({
    where: { id: body.id },
    data: validated.data!,
    include: { category: true, images: true },
  });
  return NextResponse.json(product);
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await request.json();
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}