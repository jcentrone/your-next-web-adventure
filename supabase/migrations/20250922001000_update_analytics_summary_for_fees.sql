-- Update analytics_summary to use report fees for revenue calculations
create or replace function public.analytics_summary(
  p_user_id uuid,
  p_start_date timestamptz,
  p_end_date timestamptz
)
returns jsonb
language sql
security definer
as $$
with report_totals as (
  select
    count(*) as total_reports,
    count(*) filter (where status = 'Final') as completed_reports,
    coalesce(sum(fee), 0) as total_revenue
  from reports
  where user_id = p_user_id
    and created_at between p_start_date and p_end_date
),
month_series as (
  select generate_series(
    date_trunc('month', p_start_date),
    date_trunc('month', p_end_date),
    interval '1 month'
  ) as month_start
),
monthly_counts as (
  select
    m.month_start,
    coalesce(count(r.id), 0) as count,
    coalesce(sum(r.fee), 0) as revenue
  from month_series m
  left join reports r
    on r.user_id = p_user_id
   and r.created_at >= m.month_start
   and r.created_at < m.month_start + interval '1 month'
  group by m.month_start
  order by m.month_start
),
report_types as (
  select
    coalesce(report_type, 'home_inspection') as type,
    count(*) as count
  from reports
  where user_id = p_user_id
    and created_at between p_start_date and p_end_date
  group by 1
),
contacts_total as (
  select count(*) as total_contacts
  from contacts
  where user_id = p_user_id
    and is_active = true
),
appointments_total as (
  select count(*) as total_appointments
  from appointments
  where user_id = p_user_id
    and appointment_date between p_start_date and p_end_date
)
select jsonb_build_object(
  'totalReports', (select total_reports from report_totals),
  'completedReports', (select completed_reports from report_totals),
  'totalContacts', (select total_contacts from contacts_total),
  'totalAppointments', (select total_appointments from appointments_total),
  'totalRevenue', (select total_revenue from report_totals),
  'monthlyReports', (
    select coalesce(jsonb_agg(
      jsonb_build_object(
        'month', to_char(month_start, 'Mon YY'),
        'count', count,
        'revenue', revenue
      )
    ), '[]'::jsonb)
    from monthly_counts
  ),
  'reportsByType', (
    select coalesce(jsonb_agg(
      jsonb_build_object(
        'type', initcap(replace(type, '_', ' ')),
        'count', count,
        'value', count * 100.0 / greatest((select total_reports from report_totals), 1)
      )
    ), '[]'::jsonb)
    from report_types
  ),
  'recentActivity', (
    select coalesce(jsonb_agg(
      jsonb_build_object(
        'date', to_char(month_start, 'Mon YY'),
        'type', 'Reports',
        'count', count
      ) order by month_start desc limit 7
    ), '[]'::jsonb)
    from monthly_counts
  )
);
$$;
