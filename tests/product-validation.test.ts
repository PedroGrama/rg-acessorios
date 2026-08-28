import test from "node:test";
import assert from "node:assert/strict";
import { slugify, validateProductInput } from "../src/lib/product-validation.ts";

test("slugify removes accents and creates a URL slug", () => {
  assert.equal(slugify("Joias em Prata Maciça 925"), "joias-em-prata-macica-925");
});

test("product validation rejects missing category and invalid price", () => {
  assert.equal(validateProductInput({ name: "Anel", slug: "anel", price: -1, stock: 1, categoryId: "cat" }).error, "Informe um preço válido.");
  assert.equal(validateProductInput({ name: "Anel", slug: "anel", price: 10, stock: 1 }).error, "Selecione uma categoria.");
});

test("product validation normalizes accepted input", () => {
  const result = validateProductInput({ name: "  Anel  ", slug: "anel", description: " Ouro ", price: "19.90", stock: "4", categoryId: "cat" });
  assert.deepEqual(result.data, { code: null, name: "Anel", slug: "anel", description: "Ouro", price: 19.9, stock: 4, categoryId: "cat", compareAtPrice: null, isActive: true });
});
