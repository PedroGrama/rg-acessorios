import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { nextProductCode } from "@/lib/product-code";

export async function GET(request: Request) {
  if (!(await requireAdmin(request))) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const categoryId = new URL(request.url).searchParams.get("categoryId");
  if (!categoryId) return NextResponse.json({ error: "Informe a categoria." }, { status: 400 });
  try { return NextResponse.json({ code: await nextProductCode(categoryId) }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível gerar o SKU." }, { status: 400 }); }
}