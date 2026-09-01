import test from "node:test";
import assert from "node:assert/strict";
import { categoryPrefix, slugify, validateProductInput } from "../src/lib/product-validation.ts";
import { buildShippingPayload, sortShippingOptions } from "../src/lib/melhor-envio.ts";
import { addCartItem, getCartCount, readCartItems } from "../src/lib/cart.ts";

test("slugify removes accents and creates a URL slug", () => {
  assert.equal(slugify("Joias em Prata Maciça 925"), "joias-em-prata-macica-925");
});

test("category prefixes use initials without accents or linking words", () => {
  assert.equal(categoryPrefix("Anéis"), "AN");
  assert.equal(categoryPrefix("Brincos"), "BR");
  assert.equal(categoryPrefix("Colares"), "CO");
  assert.equal(categoryPrefix("Joias em Prata"), "JP");
});

test("product validation rejects missing category and invalid price", () => {
  assert.equal(validateProductInput({ name: "Anel", slug: "anel", price: -1, stock: 1, categoryId: "cat" }).error, "Informe um preço válido.");
  assert.equal(validateProductInput({ name: "Anel", slug: "anel", price: 10, stock: 1 }).error, "Selecione uma categoria.");
});

test("product validation normalizes accepted input", () => {
  const result = validateProductInput({ name: "  Anel  ", slug: "anel", description: " Ouro ", price: "19.90", stock: "4", categoryId: "cat" });
  assert.deepEqual(result.data, { name: "Anel", slug: "anel", description: "Ouro", price: 19.9, stock: 4, categoryId: "cat", compareAtPrice: null, isActive: true });
});

test("product validation auto-generates slug and defaults stock to one available unit", () => {
  const result = validateProductInput({ name: "  Anel de Ouro  ", description: "Acompanha caixa", price: "99.90", stock: "", categoryId: "cat" });
  assert.ok(result.data);
  assert.equal(result.data.slug, "anel-de-ouro");
  assert.equal(result.data.stock, 1);
  assert.equal(result.data.isActive, true);
});

test("product slug uses the unique SKU code when available", () => {
  const result = validateProductInput({ name: "Pulseira de Prata", code: "PRD-102", description: "Modelo elegante", price: "89", stock: "10", categoryId: "cat" });
  assert.ok(result.data);
  assert.equal(result.data.slug, "prd-102");
});

test("product validation ignores manual slug edits and keeps the generated slug locked", () => {
  const result = validateProductInput({ name: "Pulseira de Prata", code: "PRD-102", slug: "alterado-manual", description: "Modelo elegante", price: "89", stock: "10", categoryId: "cat" });
  assert.ok(result.data);
  assert.equal(result.data.slug, "prd-102");
});

test("cart helpers merge items and count quantities correctly", () => {
  const storage = {
    data: {} as Record<string, string>,
    getItem(key: string) { return this.data[key] ?? null; },
    setItem(key: string, value: string) { this.data[key] = value; },
    removeItem(key: string) { delete this.data[key]; },
  };

  const first = addCartItem({ productId: "p1", slug: "anel-de-ouro", name: "Anel de Ouro", price: 99.9, quantity: 1 }, storage);
  const second = addCartItem({ productId: "p1", slug: "anel-de-ouro", name: "Anel de Ouro", price: 99.9, quantity: 2 }, storage);

  assert.equal(first, 1);
  assert.equal(second, 3);
  assert.equal(getCartCount(storage), 3);
  assert.equal(readCartItems(storage)[0].quantity, 3);
});

test("shipping payload uses the store postal code and sorts options by price", () => {
  process.env.MELHOR_ENVIO_POSTAL_CODE = "32183-970";
  const payload = buildShippingPayload("30110-000", [{ quantity: 2 }]);
  assert.equal(payload.from.postal_code, "32183970");
  assert.equal(payload.to.postal_code, "30110000");
  assert.equal(payload.products[0].quantity, 2);
  assert.deepEqual(sortShippingOptions([{ price: 20 }, { price: 10 }]).map((option) => option.price), [10, 20]);
});
