# Guia de Configuração de Email Customizado - Supabase

## Como Aplicar o Template de Email em Português

### Passo 1: Acessar o Dashboard do Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Selecione o projeto **RgAcessorios**
3. No menu lateral, clique em **Authentication**

### Passo 2: Configurar Email Templates

1. Em **Authentication**, procure por **Email Templates** ou **Providers** → **Email**
2. Você verá um template chamado **"Confirm signup"**
3. Clique em "Edit" ou "Edit template"

### Passo 3: Substituir pelo Template Customizado

1. Abra o arquivo `email-template-pt-br.html` neste projeto
2. Copie todo o conteúdo HTML
3. No Supabase, na seção de edição de template:
   - Limpe o conteúdo atual
   - Cole o HTML que copiou
   - Clique em **"Save"** ou **"Update"**

### Passo 4: Testar o Template

1. Vá para a página `/cadastro`
2. Crie uma conta de teste com um e-mail
3. Você deve receber um e-mail com o novo design em português

## Variáveis Disponíveis no Template

O Supabase fornece as seguintes variáveis que você pode usar no template:

| Variável | Descrição |
|----------|-----------|
| `{{ confirm_email_link }}` | Link completo para confirmar o e-mail (aponta para `/auth/callback`) |
| `{{ user_metadata.name }}` | Nome do usuário cadastrado |
| `{{ email }}` | E-mail do usuário |

## Personalizar o Template

Você pode editar o template para:

### 1. Adicionar Links Personalizados
Altere os links do Instagram e WhatsApp:
```html
<a href="https://www.instagram.com/seu-instagram/" style="...">Instagram</a>
<a href="https://wa.me/seu-numero" style="...">WhatsApp</a>
```

### 2. Customizar Cores
Para mudar as cores, altere o CSS:
- `background-color: #000;` → cor de fundo
- `color: #fff;` → cor do texto
- `background-color: #f9f9f9;` → cor secundária

### 3. Adicionar Logo
Para adicionar um logo no topo, adicione antes de `<h1>`:
```html
<img src="URL_DA_LOGO" alt="RG Acessórios" style="max-width: 100px; margin-bottom: 10px;">
```

## Fluxo Completo de Autenticação

```
1. Usuário vai para /cadastro
         ↓
2. Preenche formulário com:
   - Nome completo
   - E-mail
   - Senha (mínimo 6 caracteres)
   - Repetir senha
         ↓
3. Clica em "Criar cadastro"
         ↓
4. Supabase envia e-mail de confirmação
   (com o template customizado em português)
         ↓
5. Usuário clica no link no e-mail
         ↓
6. Link redireciona para /auth/callback?code=...
         ↓
7. Página de callback processa o código
         ↓
8. E-mail é confirmado e usuário é autenticado
         ↓
9. Usuário é redirecionado para /carrinho
```

## Troubleshooting

### "Não recebi o e-mail de confirmação"
- Verifique a pasta de spam
- Certifique-se de que o Supabase está configurado para enviar e-mails
- Verifique se o template de e-mail foi salvo corretamente

### "Link de confirmação não funciona"
- O link expira após 24 horas
- Certifique-se de que a URL de redirecionamento está configurada (veja `SUPABASE_CONFIG.md`)
- Verifique se está acessando de um domínio autorizado no Supabase

### "E-mail ainda em inglês"
- O template customizado pode levar alguns minutos para entrar em vigência
- Tente criar uma nova conta de teste
- Se ainda estiver em inglês, verifique se o template foi salvo corretamente

## Contato e Suporte

Para mais informações sobre configuração de e-mails no Supabase:
- [Documentação Supabase Auth](https://supabase.com/docs/guides/auth)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email#custom-email-templates)
