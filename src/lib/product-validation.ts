export function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function buildProductSlug(name: string, code?: string) {
  const base = (code || name || "").trim();
  return slugify(base) || "produto";
}

export function normalizeImageUrls(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string" && !!item.trim()).slice(0, 3);
  if (typeof value === "string" && value.trim()) return [value.trim()].slice(0, 3);
  return [];
}

const ignoredPrefixWords = new Set(["a", "as", "o", "os", "e", "em", "de", "da", "do", "das", "dos"]);

export function categoryPrefix(name: string) {
  const words = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().match(/[A-Z0-9]+/g) ?? [];
  const significantWords = words.filter((word) => !ignoredPrefixWords.has(word.toLowerCase()));
  if (words.length === 1) return words[0].slice(0, 2).padEnd(2, "X");
  return (significantWords.map((word) => word[0]).join("").slice(0, 2) || "PR").padEnd(2, "X");
}

export function validateProductInput(input: Record<string, unknown>) {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const rawSlug = typeof input.slug === "string" ? input.slug.trim() : "";
  const code = typeof input.code === "string" ? input.code.trim() : "";
  const slug = buildProductSlug(name, code) || "produto";
  const price = Number(input.price);
  const stockValue = input.stock === undefined || input.stock === null || input.stock === "" ? 0 : Number(input.stock);
  const stock = Number.isFinite(stockValue) ? Math.max(0, Math.trunc(stockValue)) : 0;
  const categoryId = typeof input.categoryId === "string" ? input.categoryId : "";

  if (!name || name.length > 160) return { error: "O nome é obrigatório e deve ter até 160 caracteres." };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { error: "O slug deve conter apenas letras minúsculas, números e hífens." };
  if (!Number.isFinite(price) || price < 0) return { error: "Informe um preço válido." };
  if (!Number.isInteger(stock) || stock < 0) return { error: "O estoque deve ser um número inteiro não negativo." };
  if (!categoryId) return { error: "Selecione uma categoria." };

  return { data: { name, slug, description, price, stock, categoryId, compareAtPrice: input.compareAtPrice ? Number(input.compareAtPrice) : null, isActive: input.isActive !== false } };
}