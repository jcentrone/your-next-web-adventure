
-- 1) Create private storage bucket for report media
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'report-media') then
    perform storage.create_bucket(
      id => 'report-media',
      name => 'report-media',
      public => false
    );
  end if;
end
$$;

-- 2) Policies on storage.objects to scope access by user folder prefix
-- Convention: object name (path) begins with the user's UUID, e.g.:
--   {user_id}/{report_id}/{finding_id}/{filename}

-- Allow authenticated users to upload to their own folder
create policy "Users can upload report media to their folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'report-media'
  and split_part(name, '/', 1) = auth.uid()::text
);

-- Allow authenticated users to read their own files
create policy "Users can read their own report media"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'report-media'
  and split_part(name, '/', 1) = auth.uid()::text
);

-- Allow authenticated users to update their own files (not used often, but safe)
create policy "Users can update their own report media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'report-media'
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'report-media'
  and split_part(name, '/', 1) = auth.uid()::text
);

-- Allow authenticated users to delete their own files
create policy "Users can delete their own report media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'report-media'
  and split_part(name, '/', 1) = auth.uid()::text
);
