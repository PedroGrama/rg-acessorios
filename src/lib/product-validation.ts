export function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function validateProductInput(input: Record<string, unknown>) {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const code = typeof input.code === "string" ? input.code.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const slug = typeof input.slug === "string" ? input.slug.trim() : "";
  const price = Number(input.price);
  const stock = Number(input.stock ?? 0);
  const categoryId = typeof input.categoryId === "string" ? input.categoryId : "";

  if (!name || name.length > 160) return { error: "O nome é obrigatório e deve ter até 160 caracteres." };
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { error: "O slug deve conter apenas letras minúsculas, números e hífens." };
  if (!Number.isFinite(price) || price < 0) return { error: "Informe um preço válido." };
  if (!Number.isInteger(stock) || stock < 0) return { error: "O estoque deve ser um número inteiro não negativo." };
  if (!categoryId) return { error: "Selecione uma categoria." };

  return { data: { code: code || null, name, slug, description, price, stock, categoryId, compareAtPrice: input.compareAtPrice ? Number(input.compareAtPrice) : null, isActive: input.isActive !== false } };
}