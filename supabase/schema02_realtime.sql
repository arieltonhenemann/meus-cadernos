-- ============================================================
-- Meus Cadernos - Habilitar Realtime nas tabelas
-- Execute este script no SQL Editor do seu projeto Supabase
-- (Alternativa ao Dashboard: Database -> Replication)
-- ============================================================

alter publication supabase_realtime add table public.books;
alter publication supabase_realtime add table public.pages;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.board_cards;
alter publication supabase_realtime add table public.events;