import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { normalizeImageUrls, validateProductInput } from "@/lib/product-validation";
import { nextProductCode } from "@/lib/product-code";
import { uniqueProductSlug } from "@/lib/unique-slug";

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
  const code = await nextProductCode(validated.data!.categoryId);
  const slug = await uniqueProductSlug(validated.data!.name, undefined, code);
  const imageUrls = normalizeImageUrls(body.imageUrls ?? body.imageUrl);
  const product = await prisma.product.create({
    data: {
      ...validated.data!, slug,
      code,
      images: imageUrls.length > 0 ? { create: imageUrls.slice(0, 3).map((url: string, index: number) => ({ url, isMain: index === 0 })) } : undefined,
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