UPDATE "Category"
SET "code" = CASE "slug"
  WHEN 'aliancas' THEN 'AL'
  WHEN 'aneis' THEN 'AN'
  WHEN 'brincos' THEN 'BR'
  WHEN 'catalogos' THEN 'CA'
  WHEN 'colares' THEN 'CO'
  WHEN 'embalagens-de-presente' THEN 'EP'
  WHEN 'infantil' THEN 'IN'
  WHEN 'joias-em-prata-macica-925' THEN 'JP'
  WHEN 'lancamentos-e-colecoes' THEN 'LC'
  WHEN 'masculino' THEN 'MA'
  WHEN 'pingentes' THEN 'PI'
  WHEN 'porta-joias' THEN 'PJ'
  WHEN 'pulseiras' THEN 'PU'
  WHEN 'religioso' THEN 'RE'
  WHEN 'relogios' THEN 'RE'
  ELSE "code"
END
WHERE "code" IS NULL;
