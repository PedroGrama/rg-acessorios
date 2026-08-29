import { prisma } from "@/lib/prisma";
import { categoryPrefix } from "@/lib/product-validation";

export async function nextProductCode(categoryId: string, excludeProductId?: string) {
  const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { code: true, name: true } });
  if (!category) throw new Error("Categoria não encontrada.");
  const prefix = category.code ?? categoryPrefix(category.name);
  const products = await prisma.product.findMany({ where: { categoryId, ...(excludeProductId ? { NOT: { id: excludeProductId } } : {}) }, select: { code: true } });
  const highest = products.reduce((current, product) => {
    const match = product.code?.match(new RegExp(`^${prefix}(\\d{5})$`));
    return match ? Math.max(current, Number(match[1])) : current;
  }, 0);
  if (highest >= 99999) throw new Error(`A sequência da categoria ${prefix} atingiu o limite de 5 dígitos.`);
  return `${prefix}${String(highest + 1).padStart(5, "0")}`;
}