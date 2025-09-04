-- Create private bucket for terms-conditions documents
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'terms-conditions') then

    -- Use positional arguments to avoid named-argument syntax issues
    perform storage.create_bucket('terms-conditions', 'terms-conditions', false);

  end if;
end
$$;

-- Policy: organization members can view files
create policy "Organization members can view terms-conditions files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'terms-conditions'
    and public.is_organization_member((storage.foldername(name))[1]::uuid)
  );

-- Policy: organization admins can manage files
create policy "Organization admins can manage terms-conditions files"
  on storage.objects for all to authenticated
  using (
    bucket_id = 'terms-conditions'
    and (
      public.has_organization_role((storage.foldername(name))[1]::uuid, 'owner'::organization_role)
      or public.has_organization_role((storage.foldername(name))[1]::uuid, 'admin'::organization_role)
    )
  )
  with check (
    bucket_id = 'terms-conditions'
    and (
      public.has_organization_role((storage.foldername(name))[1]::uuid, 'owner'::organization_role)
      or public.has_organization_role((storage.foldername(name))[1]::uuid, 'admin'::organization_role)
    )
  );
