-- ============================================================
-- Meus Cadernos - Subtarefas no Kanban (estilo Trello)
-- Execute este script no SQL Editor do seu projeto Supabase
-- ============================================================

-- Adiciona a lista de subtarefas (checklist) dos cartões do Kanban.
-- Formato: [{"id": "...", "title": "...", "done": false}, ...]
alter table public.board_cards
  add column if not exists subtasks jsonb default '[]'::jsonb;