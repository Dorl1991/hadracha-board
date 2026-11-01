-- =====================================================================
-- 06: סגל לכל השתלמות (בנוסף לחניכים מכב"ה / לא מכב"ה).
-- הריצו פעם אחת אחרי 05_advance_reports.sql. בטוח להריץ שוב.
-- =====================================================================

alter table public.courses add column if not exists staff int not null default 0;
do $$ begin
  alter table public.courses add constraint courses_staff_range check (staff between 0 and 9999);
exception when duplicate_object then null; end $$;

-- מספרי האנשים לכל השתלמות שפעילה ביום מסוים: סגל, מכב"ה (org), לא מכב"ה (ext)
create or replace function public.report_counts(p_unit uuid, p_day date, p_counts jsonb)
returns jsonb language sql stable set search_path = public as $$
  select coalesce(jsonb_object_agg(c.id::text, jsonb_build_object(
           'org',   greatest(0, least(9999, coalesce((p_counts -> c.id::text ->> 'org')::int,   c.org))),
           'ext',   greatest(0, least(9999, coalesce((p_counts -> c.id::text ->> 'ext')::int,   c.ext))),
           'staff', greatest(0, least(9999, coalesce((p_counts -> c.id::text ->> 'staff')::int, c.staff))))), '{}'::jsonb)
    from public.courses c
   where c.unit_id = p_unit and not c.cancelled and p_day between c.start_date and c.end_date;
$$;
revoke execute on function public.report_counts(uuid, date, jsonb) from public, anon, authenticated;

-- הוספת השתלמות, עכשיו גם עם סגל
drop function if exists public.add_course(text, uuid, text, date, date, int, int);
create or replace function public.add_course(
  p_token text, p_unit uuid, p_name text, p_start date, p_end date, p_org int, p_ext int, p_staff int default 0)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_role text := public.can_write_unit(p_token, p_unit); v_id uuid;
begin
  if v_role is null then raise exception 'not_authorized' using errcode = '42501'; end if;
  if v_role <> 'admin' and (p_end < public.il_today() or p_start > public.il_today() + 365) then
    raise exception 'bad_dates';
  end if;
  insert into public.courses (unit_id, name, start_date, end_date, org, ext, staff)
  values (p_unit, trim(p_name), p_start, p_end,
          greatest(0, least(9999, coalesce(p_org, 0))), greatest(0, least(9999, coalesce(p_ext, 0))),
          greatest(0, least(9999, coalesce(p_staff, 0))))
  returning id into v_id;
  return v_id;
end $$;
grant execute on function public.add_course(text, uuid, text, date, date, int, int, int) to anon, authenticated;

-- הלוח מקבל גם את הסגל של כל השתלמות
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
        'end_date', x.end_date, 'org', x.org, 'ext', x.ext, 'staff', x.staff)), '[]'::jsonb)
      from public.courses x
      where not x.cancelled and x.end_date >= p_from and x.start_date <= p_to + 60),
    'reports', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'unit_id', r.unit_id, 'report_date', r.report_date, 'staff_in', r.staff_in,
        'staff_out', r.staff_out, 'no_course', r.no_course, 'counts', r.counts,
        'reported_at', r.reported_at, 'carried_from', r.carried_from)), '[]'::jsonb)
      from public.reports r where r.report_date between p_from and p_to),
    'special', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'day', s.day, 'kind', s.kind, 'deadline', to_char(s.deadline, 'HH24:MI'), 'label', s.label
      ) order by s.day), '[]'::jsonb)
      from public.special_days s where s.day between p_from and p_to + 400)
  );
end $$;
grant execute on function public.board_data(text, date, date) to anon, authenticated;
