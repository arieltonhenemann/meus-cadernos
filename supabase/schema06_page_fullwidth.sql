-- ============================================================
-- Meus Cadernos - Largura da página (full width)
-- Execute este script no SQL Editor do seu projeto Supabase
-- ============================================================

-- Permite que cada página use a largura inteira do conteúdo
-- (em vez de ficar centralizada com largura limitada).
alter table public.pages
  add column if not exists full_width boolean default false;