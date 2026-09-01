-- ============================================================
-- Meus Cadernos - Correções de segurança para produção
-- Execute este script no SQL Editor do seu projeto Supabase
-- ============================================================

-- ---------- 1. user_id sempre = usuário autenticado ----------
-- Todos os INSERT do app NÃO enviam user_id. Sem este default,
-- o RLS rejeita os registros e o usuário perde dados silenciosamente.
-- Com `default auth.uid()` o próprio banco garante a origem do dado,
-- e o RLS (auth.uid() = user_id) impede qualquer tentativa de
-- fingir ser outro usuário.
alter table public.books       alter column user_id set default auth.uid();
alter table public.pages       alter column user_id set default auth.uid();
alter table public.tasks       alter column user_id set default auth.uid();
alter table public.board_cards alter column user_id set default auth.uid();
alter table public.events      alter column user_id set default auth.uid();

-- ---------- 2. Upload de imagem somente na própria pasta ----------
-- A policy antiga permitia que qualquer usuário autenticado subisse
-- arquivos em QUALQUER diretório do bucket (inclusive de outros usuários)
-- e em QUALQUER formato (não apenas imagens).
drop policy if exists "Authenticated users can upload images" on storage.objects;

create policy "Authenticated users can upload own images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = auth.uid()::text
    and lower(split_part(name, '.', -1)) in ('png', 'jpg', 'jpeg', 'gif', 'webp')
  );