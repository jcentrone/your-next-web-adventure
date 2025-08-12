
-- 1) Create a private bucket for report media (idempotent)
insert into storage.buckets (id, name, public)
values ('report-media', 'report-media', false)
on conflict (id) do nothing;

-- 2) Ensure RLS is enabled on storage.objects (usually enabled by default)
alter table storage.objects enable row level security;

-- 3) Allow authenticated users to upload into this bucket
create policy "Upload to report-media (authenticated)"
on storage.objects for insert to authenticated
with check (bucket_id = 'report-media');

-- 4) Only the owner can read their files (used when generating signed URLs)
create policy "Read own files in report-media"
on storage.objects for select to authenticated
using (bucket_id = 'report-media' and owner = auth.uid());

-- 5) Only the owner can update their files
create policy "Update own files in report-media"
on storage.objects for update to authenticated
using (bucket_id = 'report-media' and owner = auth.uid())
with check (bucket_id = 'report-media' and owner = auth.uid());

-- 6) Only the owner can delete their files
create policy "Delete own files in report-media"
on storage.objects for delete to authenticated
using (bucket_id = 'report-media' and owner = auth.uid());
