import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  return NextResponse.json(await prisma.category.findMany({ orderBy: { name: "asc" } }));
}

export async function POST(request: Request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const body = await request.json();
  return NextResponse.json(await prisma.category.create({
    data: { name: body.name, slug: body.slug, description: body.description || null },
  }), { status: 201 });
}