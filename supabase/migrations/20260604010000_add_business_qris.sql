alter table public.businesses
add column if not exists qris_image_url text;

insert into storage.buckets (id, name, public)
values ('qris-images', 'qris-images', true)
on conflict (id) do nothing;

drop policy if exists "authenticated upload qris images" on storage.objects;
create policy "authenticated upload qris images"
on storage.objects for insert
with check (bucket_id = 'qris-images' and auth.role() = 'authenticated');

drop policy if exists "public read qris images" on storage.objects;
create policy "public read qris images"
on storage.objects for select
using (bucket_id = 'qris-images');

notify pgrst, 'reload schema';
