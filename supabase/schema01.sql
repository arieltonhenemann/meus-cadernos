-- ============================================================
-- Meus Cadernos - Schema do Supabase
-- Execute este script no SQL Editor do seu projeto Supabase
-- ============================================================

-- ---------- LIVROS (Books) ----------
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  icon text default '📔',
  color text default 'text-purple-600',
  created_at timestamptz default now(),
  sort_order int default 0
);

alter table public.books enable row level security;

create policy "Users can manage own books"
  on public.books for all
  using (auth.uid() = user_id);

-- ---------- PÁGINAS (Pages) ----------
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text default 'Sem título',
  icon text default '📄',
  content text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  sort_order int default 0
);

alter table public.pages enable row level security;

create policy "Users can manage own pages"
  on public.pages for all
  using (auth.uid() = user_id);

-- ---------- TAREFAS (Tasks) ----------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  done boolean default false,
  book_id uuid references public.books (id) on delete set null,
  page_id uuid references public.pages (id) on delete set null,
  created_at timestamptz default now()
);

alter table public.tasks enable row level security;

create policy "Users can manage own tasks"
  on public.tasks for all
  using (auth.uid() = user_id);

-- ---------- QUADRO KANBAN (Board cards) ----------
create table if not exists public.board_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  status text default 'todo' check (status in ('todo', 'doing', 'done')),
  created_at timestamptz default now()
);

alter table public.board_cards enable row level security;

create policy "Users can manage own board cards"
  on public.board_cards for all
  using (auth.uid() = user_id);

-- ---------- EVENTOS / AGENDA (Events) ----------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  date date not null,
  time time,
  color text default '#3b82f6',
  created_at timestamptz default now()
);

alter table public.events enable row level security;

create policy "Users can manage own events"
  on public.events for all
  using (auth.uid() = user_id);
