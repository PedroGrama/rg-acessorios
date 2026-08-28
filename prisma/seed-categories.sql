INSERT INTO "Category" ("id", "name", "slug", "description", "createdAt")
SELECT gen_random_uuid(), category.name, category.slug, NULL, NOW()
FROM (VALUES
  ('Lançamentos e Coleções', 'lancamentos-e-colecoes'), ('Brincos', 'brincos'), ('Alianças', 'aliancas'),
  ('Anéis', 'aneis'), ('Masculino', 'masculino'), ('Colares', 'colares'), ('Pulseiras', 'pulseiras'),
  ('Relógios', 'relogios'), ('Pingentes', 'pingentes'), ('Infantil', 'infantil'), ('Religioso', 'religioso'),
  ('Joias em Prata Maciça 925', 'joias-em-prata-macica-925'), ('Catálogos', 'catalogos'),
  ('Embalagens de presente', 'embalagens-de-presente'), ('Porta Joias', 'porta-joias')
) AS category(name, slug)
WHERE NOT EXISTS (SELECT 1 FROM "Category" existing WHERE existing."slug" = category.slug);
DELETE FROM "Category" WHERE "slug" = 'sale';