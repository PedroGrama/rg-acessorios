import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { validateProductInput } from "@/lib/product-validation";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const validated = validateProductInput(body);
  if (validated.error) return NextResponse.json({ error: validated.error }, { status: 400 });
  try {
    const product = await prisma.product.update({ where: { id }, data: { ...validated.data!, code: body.code?.trim() || null }, include: { category: true, images: true } });
    return NextResponse.json(product);
  } catch { return NextResponse.json({ error: "Produto não encontrado ou dados inválidos." }, { status: 400 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await params;
  try { await prisma.product.delete({ where: { id } }); return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 }); }
}