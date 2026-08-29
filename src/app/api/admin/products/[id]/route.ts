import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { validateProductInput } from "@/lib/product-validation";
import { nextProductCode } from "@/lib/product-code";
import { uniqueProductSlug } from "@/lib/unique-slug";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const validated = validateProductInput(body);
  if (validated.error) return NextResponse.json({ error: validated.error }, { status: 400 });
  try {
    const current = await prisma.product.findUnique({ where: { id }, select: { categoryId: true, code: true } });
    if (!current) return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    const code = current.categoryId === validated.data!.categoryId ? current.code : await nextProductCode(validated.data!.categoryId, id);
    const slug = await uniqueProductSlug(validated.data!.name, id);
    const product = await prisma.product.update({ where: { id }, data: { ...validated.data!, code, slug }, include: { category: true, images: true } });
    return NextResponse.json(product);
  } catch { return NextResponse.json({ error: "Produto não encontrado ou dados inválidos." }, { status: 400 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  try { await prisma.product.delete({ where: { id } }); return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 }); }
}