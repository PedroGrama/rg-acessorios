import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  const products = await prisma.product.findMany({
    where: { isActive: true, ...(query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { description: { contains: query, mode: "insensitive" } }, { category: { name: { contains: query, mode: "insensitive" } } }] } : {}) },
    include: { category: true, images: { where: { isMain: true }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}