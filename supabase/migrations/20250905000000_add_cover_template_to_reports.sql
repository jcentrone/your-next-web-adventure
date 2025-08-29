alter table reports
  add column if not exists cover_template text default 'templateOne';
