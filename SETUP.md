# 🚀 Guia de Configuração — Supabase + Vercel

Este documento explica, passo a passo, como conectar o **Meus Cadernos** ao **Supabase** (banco de dados + login) e publicá-lo na **Vercel**.

---

## Parte 1 — Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login.
2. Clique em **New project**.
3. Dê um nome (ex.: *meus-cadernos*), escolha uma senha de banco e a região mais próxima.
4. Aguarde o projeto ser criado (leva ~1 minuto).

### Criar as tabelas

1. No menu lateral esquerdo, clique em **SQL Editor**.
2. Clique em **New query**.
3. Abra o arquivo `supabase/schema.sql` deste projeto e **copie todo o conteúdo**.
4. Cole no editor e clique em **Run** (ou **Execute**).

> Isso cria as tabelas `books`, `pages`, `tasks`, `board_cards` e `events`, com as políticas de segurança para isolar os dados de cada usuário logado.

### Configurar autenticação

1. No menu lateral, clique em **Authentication → Providers**.
2. Em **Email**, confirme que está **Enabled** (para permitir login com e-mail e senha).
   - Recomendado: ative também **Confirm email** para que o usuário confirme o cadastro.
3. (Opcional) Para login com Google: em **Providers**, ative o **Google** seguindo as instruções.

### Copiar as chaves do projeto

1. No menu lateral, clique em **Project Settings → API**.
2. Copie o valor de **Project URL** (algo como `https://xxxx.supabase.co`).
3. Copie o valor de **anon public key** (chave longa que começa com `eyJ...`).

---

## Parte 2 — Configurar o projeto localmente

1. Abra o arquivo **`.env`** (se não existir, copie o `.env.example` para `.env`).
2. Preencha:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA-CHAVE-ANON
```

3. Rode o app:

```bash
npm install
npm run dev
```

4. Abra `http://localhost:5173`. Deve aparecer a tela de login/cadastro.

> 💡 Se aparecer a mensagem "Configuração pendente", confirme que preencheu o `.env` e reiniciou o `npm run dev`.

---

## Parte 3 — Publicar na Vercel

#### Opção A — Direto do Git (recomendado)

1. Suba o projeto para um repositório **GitHub** (ou GitLab/Bitbucket).
2. Acesse [vercel.com](https://vercel.com) e faça login (de preferência com a mesma conta que o GitHub).
3. Clique em **Add New → Project**.
4. Importe o repositório do projeto.
5. Antes de implantar, clique em **Environment Variables** e adicione:

| Nome | Valor |
|---|---|
| `VITE_SUPABASE_URL` | A Project URL do Supabase |
| `VITE_SUPABASE_ANON_KEY` | A anon public key |

6. Clique em **Deploy**. A Vercel detecta automaticamente o **Vite**.

#### Opção B — Usando o CLI da Vercel

```bash
npm i -g vercel
vercel login
vercel
```

Siga as instruções e, quando pedir as variáveis de ambiente, informe:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## Parte 4 — Configurar a URL do app no Supabase

Para que o login por e-mail funcione na Vercel:

1. No **Supabase**, vá em **Authentication → URL Configuration**.
2. Em **Site URL**, coloque a URL do seu site na Vercel (ex.: `https://meu-app.vercel.app`).
3. Em **Redirect URLs**, adicione a mesma URL.
4. Salve.

---

## ✅ Pronto!

Seu app estará publicado e acessível de qualquer lugar. Os dados ficam sincronizados entre dispositivos, pois são armazenados no Supabase — basta fazer login com a mesma conta.

## 🧹 Resetar dados de teste
Se quiser apagar tudo e começar de novo, basta excluir as linhas das tabelas no **Supabase → Table Editor**.

## 🛠️ Problemas comuns

| Problema | Solução |
|---|---|
| "Configuração pendente" no app | Verifique o `.env` (local) ou as Environment Variables (Vercel) e reinicie. |
| Não recebe o e-mail de confirmação | Vá em Authentication → Providers → Email e confirme que está habilitado; confira a caixa de spam. |
| Erro "duplicate key" | Houve dados duplicados; apague as linhas desnecessárias no Table Editor. |
| Usuário logado vê dados de outro | Confira se rodou o `schema.sql` (as policies de RLS são criadas lá). |
