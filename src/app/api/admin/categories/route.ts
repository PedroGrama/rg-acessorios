import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { slugify } from "@/lib/product-validation";

export async function GET(request: Request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  return NextResponse.json(await prisma.category.findMany({ orderBy: { name: "asc" } }));
}

export async function POST(request: Request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const body = await request.json();
  if (!body.name?.trim()) return NextResponse.json({ error: "O nome da categoria é obrigatório." }, { status: 400 });
  return NextResponse.json(await prisma.category.create({
    data: { name: body.name.trim(), slug: body.slug || slugify(body.name), description: body.description || null },
  }), { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const body = await request.json();
  if (!body.id || !body.name?.trim()) return NextResponse.json({ error: "Informe id e nome da categoria." }, { status: 400 });
  return NextResponse.json(await prisma.category.update({ where: { id: body.id }, data: { name: body.name.trim(), slug: body.slug || slugify(body.name) } }));
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await request.json();
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}