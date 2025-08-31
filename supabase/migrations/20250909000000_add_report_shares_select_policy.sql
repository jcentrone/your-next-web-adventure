-- Allow report owners to view their share links
create policy "Users can view report shares for their own reports"
  on public.report_shares
  for select
  to authenticated
  using (
    exists (
      select 1 from public.reports
      where reports.id = report_shares.report_id
        and reports.user_id = auth.uid()
    )
  );
