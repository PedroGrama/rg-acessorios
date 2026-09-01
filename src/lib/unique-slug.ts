import { prisma } from "@/lib/prisma";
import { buildProductSlug, slugify } from "@/lib/product-validation";

export async function uniqueProductSlug(name: string, excludeId?: string, code?: string) {
  const base = buildProductSlug(name, code);
  let slug = base || "produto";
  let suffix = 1;
  while (await prisma.product.findFirst({ where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) }, select: { id: true } })) {
    slug = `${base || "produto"}-${suffix++}`;
  }
  return slug;
}

export async function uniqueCategorySlug(name: string, excludeId?: string) {
  const base = slugify(name);
  let slug = base || "categoria";
  let suffix = 1;
  while (await prisma.category.findFirst({ where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) }, select: { id: true } })) {
    slug = `${base || "categoria"}-${suffix++}`;
  }
  return slug;
}
