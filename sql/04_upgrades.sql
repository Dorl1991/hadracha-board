-- =====================================================================
-- שדרוגים: ימים מיוחדים (חגים / ימים מקוצרים).
-- הריצו פעם אחת אחרי 03_permissions.sql. בטוח להריץ שוב.
-- =====================================================================

create table if not exists public.special_days (
  day         date primary key,
  kind        text not null check (kind in ('off', 'short')),   -- off = אין חובת דיווח, short = שעת סגירה אחרת
  deadline    time,
  label       text not null default '' check (length(label) <= 80),
  created_at  timestamptz not null default now(),
  check (kind <> 'short' or deadline is not null)
);
alter table public.special_days enable row level security;
grant select, insert, update, delete on public.special_days to authenticated;
do $$ begin grant all on public.special_days to service_role; exception when undefined_object then null; end $$;
drop policy if exists admin_all on public.special_days;
create policy admin_all on public.special_days for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop trigger if exists special_days_pulse on public.special_days;
create trigger special_days_pulse after insert or update or delete on public.special_days for each statement execute function public.touch_pulse();

-- הלוח מקבל גם את רשימת הימים המיוחדים
create or replace function public.board_data(p_token text, p_from date, p_to date)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  c record;
  v_admin boolean;
begin
  select * into c from public.access_ctx(p_token);
  if c.role is null then raise exception 'not_authorized' using errcode = '42501'; end if;
  v_admin := c.role = 'admin';
  if p_to - p_from > 400 then p_from := p_to - 400; end if;

  return jsonb_build_object(
    'role',  c.role,
    'me',    c.unit_id,
    'email', public.my_email(),
    'today', public.il_today(),
    'units', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', u.id, 'name', u.name, 'manager_name', u.manager_name, 'site', u.site,
        'sort_order', u.sort_order, 'active', u.active,
        'phone', case when v_admin then u.phone end,
        'token', case when v_admin then u.token end
      ) order by u.sort_order, u.name), '[]'::jsonb)
      from public.units u where u.active),
    'courses', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', x.id, 'unit_id', x.unit_id, 'name', x.name, 'start_date', x.start_date,
        'end_date', x.end_date, 'org', x.org, 'ext', x.ext)), '[]'::jsonb)
      from public.courses x
      where not x.cancelled and x.end_date >= p_from and x.start_date <= p_to + 60),
    'reports', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'unit_id', r.unit_id, 'report_date', r.report_date, 'staff_in', r.staff_in,
        'staff_out', r.staff_out, 'no_course', r.no_course, 'counts', r.counts,
        'reported_at', r.reported_at)), '[]'::jsonb)
      from public.reports r where r.report_date between p_from and p_to),
    'special', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'day', s.day, 'kind', s.kind, 'deadline', to_char(s.deadline, 'HH24:MI'), 'label', s.label
      ) order by s.day), '[]'::jsonb)
      from public.special_days s where s.day between p_from and p_to + 400)
  );
end $$;
grant execute on function public.board_data(text, date, date) to anon, authenticated;
