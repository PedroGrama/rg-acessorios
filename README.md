# RG Acessórios

Loja virtual de joias e semijoias da Raphaela. Este repositório contém a aplicação web, o painel administrativo e a camada de dados da loja.

A aplicação usa o Next.js com renderização no servidor para o catálogo público e APIs protegidas para as operações administrativas. O banco fica no Supabase e é acessado pelo Prisma.

## Stack

### Aplicação

- **Next.js 16** com App Router e Turbopack
- **React 19** e TypeScript
- **Tailwind CSS 4**
- **Lucide React** para ícones
- **Base UI** e `class-variance-authority` para componentes

### Dados e autenticação

- **Supabase PostgreSQL** como banco de dados
- **Prisma 5** como ORM e cliente de banco
- **Supabase Auth** para login de administradores e cadastro de clientes
- **Supabase Storage** para imagens de produtos

### Integrações

- **Melhor Envio** para cotação de frete
- PagSeguro será integrado para administrar o checkout com PIX, cartão de crédito e débito
- Deploy planejado na **Vercel**

## Como executar

Requisitos: Node.js 20 ou superior e acesso ao projeto Supabase.

```bash
npm install
npm run dev
```

A aplicação fica disponível em [http://localhost:3000](http://localhost:3000).

Comandos úteis:

```bash
npm run lint       # ESLint
npm test           # testes unitários
npm run build      # build de produção
npm start          # inicia o build de produção
```

## Variáveis de ambiente

Crie um arquivo `.env` na raiz. O arquivo não deve ser commitado.

```env
DATABASE_URL="postgresql://...pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://...pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-publica"
SUPABASE_SERVICE_ROLE_KEY="sua-chave-privada"
MELHOR_ENVIO_TOKEN="seu-token"
MELHOR_ENVIO_POSTAL_CODE="32183970"
```

`SUPABASE_SERVICE_ROLE_KEY` nunca deve ser exposta no navegador ou commitada. Ela é usada somente em rotas server-side, como o upload para o Storage.

O bucket público do Storage esperado pelo upload é `product-images`.

## Estrutura principal

```text
src/
  app/
    (store)/              catálogo público
      buscar/             busca de produtos
      cadastro/           cadastro de clientes
      categoria/[slug]/   produtos por categoria
      produto/[slug]/     detalhe do produto
    admin/                painel administrativo
    api/                  APIs públicas e protegidas
  lib/
    prisma.ts             cliente Prisma singleton
    admin-auth.ts         autorização dos administradores
    product-code.ts       geração de SKU
    product-validation.ts validações e normalização
    unique-slug.ts        slugs únicos
    melhor-envio.ts       payload e ordenação de frete
prisma/
  schema.prisma            modelos do banco
```

## Catálogo e regras de negócio

### Produtos

O produto possui, entre outros, os seguintes dados:

- código/SKU
- nome
- slug
- descrição
- preço e preço promocional
- estoque
- categoria
- imagem principal
- status ativo/inativo

O estoque continua armazenado no banco para uso no catálogo e em futuras etapas de checkout, embora não seja editado no modal simplificado atual.

### SKU automático

O SKU é criado no backend usando o prefixo da categoria e uma sequência de cinco dígitos:

```text
AN00001
AN00002
BR00001
```

Os prefixos são derivados do nome da categoria, sem acentos. Para nomes com mais de uma palavra, são usadas as iniciais das palavras relevantes. Exemplos: `Anéis` vira `AN` e `Joias em Prata` vira `JP`.

A coluna `Product.code` possui restrição de unicidade. Ao mover um produto para outra categoria, o backend mantém o SKU quando possível ou gera a próxima sequência da nova categoria.

### Slug automático

O slug é gerado a partir do nome no backend. A normalização:

- converte para minúsculas;
- remove acentos e caracteres especiais;
- troca espaços e pontuação por hífens;
- adiciona sufixo incremental em caso de duplicidade.

O formulário administrativo exibe o slug apenas para consulta.

## Painel administrativo

Acesse `/admin` com uma conta autorizada no Supabase Auth. Atualmente os administradores permitidos são configurados em `src/lib/admin-auth.ts`.

O painel oferece:

- grid responsivo de produtos;
- busca por nome e SKU;
- filtros por estoque, status e categoria;
- paginação de 12 itens;
- criação, edição e exclusão de produtos;
- criação, edição e exclusão de categorias;
- upload e preview de imagens;
- ativação e desativação de produtos.

As APIs administrativas exigem um Bearer token válido do Supabase Auth.

## Melhor Envio

A cotação está disponível em:

```text
POST /api/shipping/calculate
```

Exemplo de payload:

```json
{
  "postalCode": "30110-000",
  "items": [
    { "quantity": 1, "weight": 0.1 }
  ]
}
```

A rota usa o CEP de origem configurado em `MELHOR_ENVIO_POSTAL_CODE`, aplica dimensões padrão para semijoias e retorna as opções ordenadas pelo menor preço.

A emissão de etiqueta ainda não está conectada ao fluxo de pedidos. Para completar essa etapa, é necessário implementar carrinho, checkout, criação de pedido confirmado e a gestão de pedidos no painel.

## Banco de dados

O schema está em `prisma/schema.prisma`. A conexão de desenvolvimento usa o pooler IPv4 do Supabase:

- `DATABASE_URL`: transaction pooler, porta 6543;
- `DIRECT_URL`: session pooler, porta 5432, usado pelo Prisma em operações de schema.

Comandos Prisma úteis:

```bash
npx prisma validate
npx prisma generate
npx prisma db pull
npx prisma db push
```

Antes de executar `db push` em produção, revise a alteração do schema e mantenha uma estratégia de migração/baseline.

## Testes e validação

Os testes unitários ficam em `tests/` e atualmente cobrem:

- slugificação;
- prefixos de categoria;
- validação de produto;
- payload e ordenação da cotação de frete.

Antes de abrir um pull request:

```bash
npm test
npm run lint -- --quiet
npm run build
```

## Deploy

O deploy planejado é na Vercel, conectado ao repositório GitHub `PedroGrama/rg-acessorios`. O Supabase continua sendo o provedor de banco, autenticação e Storage.

Na Vercel, cadastre as variáveis de ambiente do `.env` nos ambientes necessários. Nunca envie `.env` ao GitHub. Depois do primeiro deploy, valide:

- login do admin;
- CRUD de produto e categoria;
- upload no bucket `product-images`;
- busca e páginas de categoria;
- cotação de frete com token válido.

## Próximas etapas

- implementar carrinho e checkout;
- persistir pedidos e pagamentos;
- criar detalhes de pedido no painel;
- integrar compra, geração e impressão de etiquetas do Melhor Envio;
- adicionar notificações por e-mail para novas vendas;
- adicionar testes de integração das rotas protegidas e do fluxo de frete.
