# 📘 Log do Projeto — Meus Cadernos

Este documento registra **tudo o que foi feito** no projeto, desde o início até o momento atual. Serve como histórico, referência e ponto de partida para o que vier a seguir.

---

## 📋 Visão Geral

| Item | Detalhe |
|---|---|
| **Nome do app** | Meus Cadernos |
| **Tipo** | Aplicação web de anotações (similar ao Notion) |
| **Stack** | React 19 + TypeScript + Vite |
| **Banco de dados** | Supabase (PostgreSQL + Auth + RLS) |
| **Deploy** | Vercel |
| **Linguagem da UI** | Português (pt-BR) |

---

## ✅ O Que Foi Feito

### 1. Definição do projeto (conversa inicial)

O usuário pediu um app de anotações com:
- Agenda
- Lista de tarefas
- Modelos de tarefas em lista
- Quadro **Kanban**
- Criação de arquivos para gerar **PDF**
- **Livros** com **páginas específicas** (ex.: um livro "Comandos Linux" com páginas de comandos; um livro de tarefas com várias páginas)
- Liberdade para criar/modificar de várias formas de anotações
- Pedido de sugestão de linguagens e tecnologias

### 2. Decisão de stack

- Comparando **Next.js** vs **Vite**: para um app ferramenta pessoal (sem necessidade de SEO/SSR), Vite é mais leve e rápido.
- **Stack escolhida:** Vite + React + TypeScript + Tailwind + shadcn-style components.

### 3. Configuração do ambiente

- **Node.js v24.20.0 (LTS)** instalado via **nvm** (não havia Node na máquina).

### 4. Criação do projeto

- Projeto Vite + React + TypeScript criado.
- **Dependências instaladas:**
  - `react-router-dom` — navegação
  - `zustand` — estado global
  - `lucide-react` — ícones
  - `tailwindcss v4` (via `@tailwindcss/vite`) — estilos
  - `@dnd-kit/*` — arrastar e soltar (Kanban)
  - `class-variance-authority`, `clsx`, `tailwind-merge` — utilitários de estilo
  - `@radix-ui/*` — componentes acessíveis (dialog, dropdown, tabs, tooltip)
  - `@tiptap/*` — editor de texto rico
  - `@react-pdf/renderer` (removido depois — exportação é feita via `window.print()`)

### 5. Componentes de UI criados (estilo shadcn)

- `src/lib/utils.ts` — função `cn()` (clsx + tailwind-merge)
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/dropdown-menu.tsx`
- `src/components/ui/tabs.tsx`
- `src/components/ui/tooltip.tsx`

### 6. Tipos do domínio

`src/types/index.ts` — tipos `Page`, `Book`, `Task`, `BoardStatus`, `BoardCard`, `EventItem`.

### 7. Store (estado global com persistência)

`src/store/useAppStore.ts` — armazena livros, páginas, tarefas, cartões de kanban e eventos, com operações CRUD.

### 8. Editor de texto rico (TipTap)

`src/components/editor/RichTextEditor.tsx` — barra de ferramentas com negrito, itálico, riscado, títulos H1/H2, listas, bloco de código, citação e divisor.

### 9. Páginas do app

- `src/pages/HomePage.tsx` — painel inicial com acesso rápido, eventos de hoje, tarefas pendentes e lista de livros
- `src/pages/AgendaPage.tsx` — calendário mensal com eventos coloridos
- `src/pages/TarefasPage.tsx` — lista de tarefas pendentes/concluídas
- `src/pages/KanbanPage.tsx` — quadro Kanban com drag & drop (A fazer / Em andamento / Concluído)
- `src/pages/BookPage.tsx` — livros com múltiplas páginas + editor + exportação de PDF
- `src/pages/NotFoundPage.tsx`

### 10. Layout

`src/components/layout/Sidebar.tsx` — menu lateral com navegação, lista de livros, criação de livros/páginas, exclusão e botão de sair (colapsável).

### 11. Importação do Supabase (2ª etapa)

- `src/lib/supabase.ts` — cliente Supabase
- **`supabase/schema.sql`** — cria as tabelas:
  - `books`
  - `pages`
  - `tasks`
  - `board_cards`
  - `events`
  - Todas com **Row Level Security (RLS)** para isolar dados por usuário.
- `src/lib/dataService.ts` — CRUD completo no banco.
- `src/store/useAuthStore.ts` — autenticação (login, cadastro, recuperação de senha).
- `src/pages/AuthPage.tsx` — tela de login/cadastro.
- `src/App.tsx` — roteamento condicional (login vs app) e carregamento de dados.

### 12. Configuração de deploy (Vercel)

- `vercel.json` — rewrites configurados.
- `.env.example` e `.env` — variáveis de ambiente (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`).
- `README.md` — documentação geral.
- `SETUP.md` — guia completo de configuração Supabase + Vercel.

### 13. Login com Google (OAuth)

- `src/store/useAuthStore.ts` — adicionada função `signInWithGoogle()` usando `supabase.auth.signInWithOAuth` com provider `google` e `redirectTo` apontando para a raiz do app.
- `src/pages/AuthPage.tsx` — adicionado botão "Entrar com Google" com ícone oficial do Google e divisor "ou continuar com e-mail".
- **Configuração necessária no Supabase:** habilitar o provider Google em Authentication → Providers e configurar os tokens (Client ID e Client Secret) obtidos no Google Cloud Console. Também adicionar as URLs de redirect na seção "Redirect URLs" do Supabase e no Google Cloud Console.

### 14. Modo escuro / temas

- `src/hooks/useTheme.ts` — hook com toggle light/dark, persistência em `localStorage` (chave `meus-cadernos-theme`) e detecção automática da preferência do sistema (`prefers-color-scheme`).
- `src/index.css` — adicionada `@custom-variant dark` do Tailwind v4 e variáveis CSS dark mode (cores de fundo, card, texto, primárias, bordas, etc.).
- `src/components/layout/Sidebar.tsx` — botão de alternância de tema no rodapé (modo expandido e colapsado), com ícones Sol/Lua.
- `src/main.tsx` — aplica a classe `dark` no `<html>` antes do render para evitar flash de conteúdo.
- Como todos os componentes e páginas usam tokens de tema (`bg-card`, `text-muted-foreground`, etc.), o tema escuro funciona automaticamente em todo o app.

### 15. Sincronização em tempo real (Realtime)

- `src/lib/realtime.ts` — canal `realtime-data` que assina mudanças (INSERT/UPDATE/DELETE) nas 5 tabelas (`books`, `pages`, `tasks`, `board_cards`, `events`) e dispara atualização dos dados.
- `src/store/useAppStore.ts` — adicionada action `applyRealtimeEvent()` que refaz o fetch dos dados quando o banco muda.
- `src/App.tsx` — `setupRealtime()` conectado no `AppRoutes` (só roda logado), com cleanup ao sair.
- **Importante:** é preciso habilitar Realtime no Supabase. Execute `supabase/schema02_realtime.sql` no SQL Editor (ou em Database → Replication, marque as 5 tabelas).

### 16. Upload de imagens nas páginas

- `npm install @tiptap/extension-image` (versão 3.30.6, compatível com o TipTap do projeto).
- `src/lib/storage.ts` — `ensureBucket()` cria o bucket `images` público se não existir; `uploadImage()` envia o arquivo para `images/{user_id}/{timestamp}.{ext}` e retorna a URL pública.
- `src/components/editor/RichTextEditor.tsx` — extensão `Image` configurada no editor, botão "Inserir imagem" na toolbar com indicador de carregamento, e upload automático ao selecionar o arquivo.
- `src/store/useAppStore.ts` — `loadData()` chama `ensureBucket()` para garantir o bucket no login.
- **Configuração:** execute `supabase/schema03_storage_images.sql` no SQL Editor para criar o bucket e as policies de acesso (as policies permitem upload só para usuários autenticados e gerenciamento apenas dos próprios arquivos, com leitura pública).

### 17. Responsividade mobile

- **Sidebar (`src/components/layout/Sidebar.tsx`)** — virou gaveta (drawer) no mobile: escondida por padrão com `-translate-x-full`, abre com backdrop translúcido, fecha ao clicar num link ou no fundo. No desktop mantém o comportamento atual (expandida/recolhida). No mobile sempre usa a versão expandida.
- **App (`src/App.tsx`)** — barra superior mobile com botão hambúrguer (`Menu`) e logo "Meus Cadernos".
- **Kanban (`src/pages/KanbanPage.tsx`)** — colunas com rolagem horizontal + snap no mobile (`w-72 snap-start`), grade de 3 no desktop.
- **BookPage** — lista de páginas vira uma faixa horizontal rolável no mobile; painel lateral no desktop. Padding ajustado (`p-4 md:p-8`).
- **Pads globais** — Home, Tarefas, Agenda e BookPage com `p-4 md:p-8`.
- **Agenda** — botão "Novo evento" com texto oculto em telas pequenas.
- `src/store/useAppStore.ts` — novos campos `mobileSidebarOpen` e action `setMobileSidebarOpen`.

### 18. Modelos prontos de páginas

- `src/lib/pageTemplates.ts` — 7 modelos com conteúdo HTML inicial (Em branco, Lista de tarefas, Notas de reunião, Material de estudo, Planejamento semanal, Metas e objetivos, Lista de contatos). Cada um com nome, descrição, emoji (vira ícone da página), título sugerido e conteúdo formatado (títulos, listas, citações, blocos de código).
- `src/pages/BookPage.tsx` — diálogo "Nova página" agora tem seletor visual de modelo (grade com cards clicáveis, caixa com scroll), título opcional e botão Criar. A página é criada com o conteúdo do modelo escolhido.
- Modelos são compatíveis com as extensões existentes do editor (StarterKit), então renderizam corretamente também na exportação de PDF.

---

## 🛡️ Auditoria de Segurança (pré-produção – 01/09/2026)

### 🔴 CRÍTICO corrigido: perda silenciosa de dados
Os `INSERT` do app **não enviavam `user_id`** e a coluna não tinha `default`. Como o RLS exige `auth.uid() = user_id`, os registros eram criados mas **bloqueados pelo banco** → o dado aparecia na tela e **sumia para sempre** no reload. Correção dupla:
- **App** (`src/lib/dataService.ts`): todo `INSERT` agora envia `user_id` via `currentUserId()` (lê o usuário logado; lança erro se não autenticado).
- **Banco** (`supabase/schema04_security.sql`, **já executado no SQL Editor**): `alter column user_id set default auth.uid()` nas 5 tabelas + correção da policy de upload.

### 🔴 CRÍTICO corrigido: upload de imagem aberto
A policy de upload (`schema03`) permitia que **qualquer usuário autenticado** subisse arquivos em **qualquer pasta** (inclusive de outros usuários) e em **qualquer formato**. Corrigido em `schema04_security.sql`: acesso restrito à própria pasta `auth.uid()::text` e apenas extensões `png/jpg/jpeg/gif/webp`.

### 🟡 Removido: Google OAuth e login por magic link
Definido que o app usará **somente e-mail/senha**. Removidos do código: botão "Entrar com Google", `signInWithGoogle()` e `signInWithMagicLink()` (`src/pages/AuthPage.tsx` e `src/store/useAuthStore.ts`).

### ✅ Confirmado OK
- Sem `service_role`/secrets no código-fonte (só chave anon no `.env`).
- `.env`, `.env.local` e `.vercel` ignorados pelo git (`.env.example` é o único versionado).
- RLS habilitado nas 5 tabelas com policies por usuário.
- Bucket `images` listável (HTTP 200) e upload sem login rejeitado (policies ativas).

### ⚠️ CLI (email) ainda precisa
Acolhimento de novas contas exige **confirmação de e-mail** (Supabase → Authentication → Providers → E-mail: botão "Confirm email" ativo) — fluxo já validado.

---

| Bug | Causa | Correção |
|---|---|---|
| Build falhava | `baseUrl` deprecado no TS 6 | Removido do `tsconfig.app.json` |
| Erro de tipo no TipTap v3 (`setContent`) | API mudou entre v2 e v3 | Usado `{ emitUpdate: false }` |
| Import não utilizado (`DropdownMenuSeparator`) | Código remanescente | Removido |
| Navegação para nova página não funcionava | Estado obsoleto no closure | Gerar o ID antes e navegar direto a ele |
| **Tela branca / "Invalid supabaseUrl"** | `.env` com espaço e prefixo extra: `VITE_SUPABASE_URL= NEXT_PUBLIC_SUPABASE_URL=...` | Limpada a linha para `VITE_SUPABASE_URL=https://ameurvwqcatgmanzapna.supabase.co` e reiniciado o `npm run dev` |

---

## 🧪 Testes Realizados (Verificação)

- **Compilação:** `npm run build` passou sem erros de tipo.
- **Lint:** `npm run lint` (oxlint) — apenas 2 avisos não-bloqueantes (fast-refresh e set-state-in-effect, ambos intencionais).
- **Tabelas do Supabase:** as 5 tabelas respondem **HTTP 200** com a chave anon.
- **Cadastro de usuário:** criada conta de teste `teste-opencode@gmail.com` → e-mail de confirmação enviado (fluxo OK).
- **Login:** retornou `email_not_confirmed` — comprova que o provider de e-mail está ativo (é só confirmar via link do e-mail).
- **Servidor Vite:** inicia e carrega módulos sem erro.
- **Segurança (01/09/2026):** simulado INSERT e upload; RLS ativo nas 5 tabelas; bucket `images` listável (200) e upload sem login rejeitado; `schema04_security.sql` aplicado no banco com `default auth.uid()` e policy de upload restrita.
- **Deploy (01/09/2026):** produção publicado em **https://meus-cadernos.vercel.app** (HTTP 200), repositório GitHub sincronizado (branch `main`), varáveis `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` configuradas para produção e preview.

> ⚠️ A conta de teste `teste-opencode@gmail.com` foi criada **sem confirmação** e pode ser removida, se desejado, em Supabase → Authentication → Users.

---

## 📁 Estrutura do Projeto

```
meu-programa-de-anotações/
├── .env                        # Variáveis reais (NÃO versionar)
├── .env.example                # Modelo das variáveis
├── .gitignore
├── .oxlintrc.json
├── index.html                  # Entrada HTML (fontes Inter)
├── package.json                # Dependências e scripts
├── vite.config.ts              # Config do Vite + Tailwind plugin
├── vercel.json                 # Config de deploy Vercel
├── tsconfig*.json              # Configs TypeScript
├── README.md                   # Documentação geral
├── SETUP.md                    # Guia Supabase + Vercel
├── supabase/
│   └── schema.sql              # Script de criação das tabelas
└── src/
    ├── components/
    │   ├── editor/RichTextEditor.tsx
    │   ├── layout/Sidebar.tsx
    │   └── ui/                 # button, input, dialog, dropdown-menu, tabs, tooltip
    ├── lib/
    │   ├── utils.ts            # cn()
    │   ├── supabase.ts         # cliente Supabase
    │   └── dataService.ts      # CRUD no banco
    ├── pages/
    │   ├── HomePage.tsx
    │   ├── AgendaPage.tsx
    │   ├── TarefasPage.tsx
    │   ├── KanbanPage.tsx
    │   ├── BookPage.tsx
    │   ├── AuthPage.tsx
    │   └── NotFoundPage.tsx
    ├── store/
    │   ├── useAppStore.ts      # dados (livros, tarefas, etc.)
    │   └── useAuthStore.ts     # autenticação
    ├── types/index.ts          # tipos do domínio
    ├── App.tsx                 # roteamento + gate de login
    ├── main.tsx
    └── index.css               # Tailwind + temas (TipTap/Notion)
```

---

## 🚀 Como Rodar

```bash
npm install
npm run dev     # abre em http://localhost:5173
```

Outros comandos:

```bash
npm run build    # build de produção (gera dist/)
npm run preview  # visualizar build
npm run lint     # verificação (oxlint)
```

---

## 🌐 Deploy (resumo)

1. **Supabase:** projeto criado, `schema.sql` executado, Email habilitado em Authentication, chaves copiadas para `.env`.
2. **Vercel:** importar repositório e adicionar variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`; configurar Site URL/Redirect URL no Supabase apontando para a URL da Vercel.

> O **deploy na Vercel já foi realizado** (19/09/2026):
> - URL de produção: **https://meus-cadernos.vercel.app**
> - Repositório GitHub: https://github.com/arieltonhenemann/meus-cadernos
> - Variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` configuradas para produção e preview.
> - Pendente no Supabase: Site URL/Redirect URL apontando para `https://meus-cadernos.vercel.app`, Realtime (schema02) e Storage (schema03).

Guia completo: [SETUP.md](./SETUP.md)

---

## 🔮 Próximos Passos Possíveis

- **Login com Google (OAuth) no Supabase** ✅ implementado (código pronto; falta configurar as credenciais no dashboard)
- **Modo escuro / temas** ✅ implementado (toggle na sidebar, persistência, detecção do sistema)
- **Sincronização em tempo real (realtime)** ✅ implementado (código pronto; falta habilitar Realtime no Supabase via `schema02_realtime.sql`)
- **Upload de imagens nas páginas** ✅ implementado (editor + storage; falta rodar `schema03_storage_images.sql` no Supabase)
- **Responsividade mobile aprimorada** ✅ (sidebar-gaveta, kanban com rolagem horizontal, paddings e listas ajustados)
- **Modelos prontos de páginas** ✅ (7 modelos com seletor visual ao criar página)
- Arrastar e soltar para reordenar livros/páginas.
- Deploy efetivo na Vercel.

---

*Última atualização deste log: 01/09/2026 — Todos os 6 próximos passos concluídos (Google OAuth código, modo escuro, realtime, upload de imagens, responsividade mobile e modelos de páginas); build e lint OK.
