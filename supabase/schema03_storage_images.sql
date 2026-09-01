-- ============================================================
-- Meus Cadernos - Bucket de imagens para o editor
-- Execute este script no SQL Editor do seu projeto Supabase
-- ============================================================

-- Cria o bucket público para imagens das páginas
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- Permite que usuários autenticados façam upload de imagens
create policy "Authenticated users can upload images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'images');

-- Permite que o dono atualize/deleta sua imagem (caminho inicia com o uid)
create policy "Users can update own images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete own images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text);

-- Leitura pública (bucket público)
create policy "Public read images"
  on storage.objects for select
  using (bucket_id = 'images');