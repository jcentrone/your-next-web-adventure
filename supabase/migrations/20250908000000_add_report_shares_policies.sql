-- Grant insert and delete on report_shares to report owners
create policy "Users can create report shares for their own reports"
  on public.report_shares
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.reports
      where reports.id = report_shares.report_id
        and reports.user_id = auth.uid()
    )
  );

create policy "Users can delete report shares for their own reports"
  on public.report_shares
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.reports
      where reports.id = report_shares.report_id
        and reports.user_id = auth.uid()
    )
  );
