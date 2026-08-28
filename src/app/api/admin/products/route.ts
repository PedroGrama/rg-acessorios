import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

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
  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description ?? "",
      price: body.price,
      compareAtPrice: body.compareAtPrice || null,
      stock: Number(body.stock ?? 0),
      categoryId: body.categoryId,
      images: body.imageUrl ? { create: { url: body.imageUrl, isMain: true } } : undefined,
    },
    include: { category: true, images: true },
  });
  return NextResponse.json(product, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await request.json();
  const product = await prisma.product.update({
    where: { id: body.id },
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description ?? "",
      price: body.price,
      compareAtPrice: body.compareAtPrice || null,
      stock: Number(body.stock ?? 0),
      categoryId: body.categoryId,
    },
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