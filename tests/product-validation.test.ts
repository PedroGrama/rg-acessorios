import test from "node:test";
import assert from "node:assert/strict";
import { categoryPrefix, slugify, validateProductInput } from "../src/lib/product-validation.ts";
import { buildShippingPayload, sortShippingOptions } from "../src/lib/melhor-envio.ts";

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

test("shipping payload uses the store postal code and sorts options by price", () => {
  process.env.MELHOR_ENVIO_POSTAL_CODE = "32183-970";
  const payload = buildShippingPayload("30110-000", [{ quantity: 2 }]);
  assert.equal(payload.from.postal_code, "32183970");
  assert.equal(payload.to.postal_code, "30110000");
  assert.equal(payload.products[0].quantity, 2);
  assert.deepEqual(sortShippingOptions([{ price: 20 }, { price: 10 }]).map((option) => option.price), [10, 20]);
});
