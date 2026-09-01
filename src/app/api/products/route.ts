import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";
  const ids = url.searchParams.get("ids")?.split(",").filter(Boolean) ?? [];

  const where: any = { isActive: true };

  if (ids.length > 0) {
    where.id = { in: ids };
  } else if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { category: { name: { contains: query, mode: "insensitive" } } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: true, images: { orderBy: [{ isMain: "desc" }, { id: "asc" }] } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}