# Configuração do Supabase

## URLs de Redirecionamento de Autenticação

Para que a confirmação de e-mail funcione corretamente em diferentes ambientes, você precisa configurar as URLs de redirecionamento no Supabase:

### Dashboard Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para **Authentication** → **Providers** → **Email**
4. Na seção "Redirect URLs", adicione:
   - **Desenvolvimento local**: `http://localhost:3000/auth/callback`
   - **Produção**: `https://seu-dominio.com/auth/callback`

### Variáveis de Ambiente

Crie um arquivo `.env.local` com as seguintes variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

## Email de Confirmação

O email de confirmação é enviado automaticamente pelo Supabase. Para customizar a aparência:

1. No Dashboard Supabase, vá para **Authentication** → **Email Templates**
2. Edite o template **Confirm signup** para adicionar sua marca e mensagens em português

### Template Recomendado

Use um template que inclua:
- Logo da RG Acessórios
- Mensagem de boas-vindas em português
- Botão "Confirmar E-mail" que aponta para `/auth/callback`
- Instruções claras sobre o que fazer

## Fluxo de Autenticação

1. Usuário se cadastra em `/cadastro`
2. Supabase envia email de confirmação com link para `/auth/callback?code=...`
3. Página de callback processa o código e confirma a sessão
4. Usuário é redirecionado para `/carrinho`

## Troubleshooting

### Problema: "Link inválido ou expirado"
- Verifique se a URL de redirecionamento está configurada corretamente no Supabase
- Os links de confirmação expiram após 24 horas

### Problema: "Redirecionamento para localhost"
- Certifique-se de que `NEXT_PUBLIC_SUPABASE_URL` está configurado corretamente
- Verifique se a URL de redirecionamento contém o domínio correto (não localhost em produção)
