# 📓 Meus Cadernos

Um aplicativo web de anotações inspirado no **Notion**, construído com **React + Vite + TypeScript**, com **backend no Supabase** e **deploy na Vercel**.

O usuário pode criar quantos **livros** quiser (ex.: "Comandos Linux", "Receitas", "Estudos") e preenchê-los com quantas **páginas** quiser, usando um editor de texto rico. Inclui **agenda**, **lista de tarefas**, **quadro Kanban** e **exportação para PDF**. Os dados ficam sincronizados na nuvem — basta fazer login.

## ✨ Funcionalidades

- **🔐 Conta e sincronização** — Acesse de qualquer dispositivo com login (Supabase Auth).
- **📚 Livros e Páginas** — Crie livros e quantas páginas quiser dentro de cada um.
- **✍️ Editor rico (estilo Notion)** — Formatação, títulos, listas, blocos de código, citações, divisores.
- **📅 Agenda** — Calendário mensal com eventos coloridos.
- **✅ Tarefas** — Lista de tarefas com conclusão.
- **📋 Quadro Kanban** — Cartões com arrastar e soltar entre colunas.
- **🖨️ Exportar PDF** — Gere PDF de qualquer página.

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| **React 19 + TypeScript** | Interface e tipagem |
| **Vite** | Build e dev server |
| **Tailwind CSS v4** | Estilos |
| **TipTap** | Editor de texto rico |
| **@dnd-kit** | Arrastar e soltar (Kanban) |
| **Zustand** | Estado |
| **React Router** | Navegação |
| **Supabase** | Banco de dados, autenticação e RLS |
| **Vercel** | Hospedagem / deploy |

## 🚀 Como rodar localmente

Requer **Node.js 20+**.

```bash
npm install
cp .env.example .env   # preencha com seus dados do Supabase
npm run dev            # abre em http://localhost:5173
```

## 🌐 Deploy (Vercel + Supabase)

> 📖 **Guia completo passo a passo:** veja o arquivo [SETUP.md](./SETUP.md).

Resumo rápido:

1. **Supabase**: crie um projeto, rode o `supabase/schema.sql`, habilite o Email em Authentication e copie a `Project URL` + `anon key`.
2. **Vercel**: importe o repositório e adicione as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Configure a **Site URL / Redirect URL** no Supabase apontando para a URL da Vercel.

## 📁 Estrutura

```
src/
├── components/
│   ├── editor/        # Editor rico TipTap
│   ├── layout/        # Barra lateral
│   └── ui/            # Componentes de UI
├── pages/             # Páginas (Home, Agenda, Tarefas, Kanban, Livro, Login)
├── store/             # Estado (Zustand) + autenticação
├── lib/               # Cliente Supabase + serviço de dados
└── types/             # Tipos do domínio
supabase/
└── schema.sql         # Script de criação das tabelas
```

## 🔒 Segurança
Os dados de cada usuário ficam **isolados por RLS** (Row Level Security) no Supabase — ninguém vê os dados de outra pessoa.
