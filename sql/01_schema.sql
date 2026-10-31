-- =====================================================================
-- לוח התייצבות אגף הדרכה — מבנה מסד הנתונים
-- הריצו את כל הקובץ פעם אחת ב-Supabase: SQL Editor ← New query ← Run
-- =====================================================================

-- ---------- טבלאות ----------

-- מגמות / יחידות מדווחות (מגמה אחת = מנהל אחד = קישור אישי אחד)
create table if not exists public.units (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (length(name) between 1 and 120),
  manager_name  text not null default '',
  phone         text not null default '',
  site          text not null default 'המכללה הארצית',
  token         text not null unique default replace(gen_random_uuid()::text, '-', ''),
  sort_order    int  not null default 0,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- השתלמויות (יום אחד או כמה ימים)
create table if not exists public.courses (
  id          uuid primary key default gen_random_uuid(),
  unit_id     uuid not null references public.units(id),
  name        text not null check (length(name) between 1 and 200),
  start_date  date not null,
  end_date    date not null,
  org         int  not null default 0 check (org between 0 and 9999),
  ext         int  not null default 0 check (ext between 0 and 9999),
  cancelled   boolean not null default false,
  created_at  timestamptz not null default now(),
  check (end_date >= start_date)
);
create index if not exists courses_dates_idx on public.courses (start_date, end_date);

-- דיווח יומי: שורה אחת לכל מגמה ויום
create table if not exists public.reports (
  unit_id      uuid not null references public.units(id),
  report_date  date not null,
  staff_in     int  not null default 0 check (staff_in  between 0 and 9999),
  staff_out    int  not null default 0 check (staff_out between 0 and 9999),
  no_course    boolean not null default false,
  counts       jsonb not null default '{}'::jsonb,   -- {course_id: {org, ext}}
  reported_at  timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  primary key (unit_id, report_date)
);
create index if not exists reports_date_idx on public.reports (report_date);

-- מנהלי מערכת (מפקד האגף ומי שהוא מוסיף)
create table if not exists public.admins (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  email       text,
  created_at  timestamptz not null default now()
);

-- "דופק": שורה אחת שמתעדכנת בכל שינוי, כדי שכל המסכים הפתוחים יתרעננו מיד.
-- לא מכילה שום מידע מלבד שעה.
create table if not exists public.pulse (
  id          int primary key default 1 check (id = 1),
  changed_at  timestamptz not null default now()
);
insert into public.pulse (id) values (1) on conflict do nothing;

-- ---------- הרשאות (Row Level Security) ----------
alter table public.units     enable row level security;
alter table public.courses   enable row level security;
alter table public.reports   enable row level security;
alter table public.admins    enable row level security;
alter table public.pulse     enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.il_today()
returns date language sql stable as $$
  select (now() at time zone 'Asia/Jerusalem')::date;
$$;

create or replace function public.unit_for_token(p_token text)
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.units where token = p_token and active and length(coalesce(p_token,'')) >= 16;
$$;
revoke execute on function public.unit_for_token(text) from public, anon, authenticated;

drop policy if exists admin_all on public.units;
drop policy if exists admin_all on public.courses;
drop policy if exists admin_all on public.reports;
drop policy if exists admins_read on public.admins;
drop policy if exists pulse_read on public.pulse;

create policy admin_all on public.units     for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.courses   for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.reports   for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admins_read on public.admins  for select to authenticated using (public.is_admin() or user_id = auth.uid());
create policy pulse_read  on public.pulse   for select to anon, authenticated using (true);

-- ---------- פונקציות שהאתר קורא להן ----------

-- המשתמש הראשון שמתחבר במייל הופך אוטומטית למנהל מערכת
create or replace function public.claim_first_admin()
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  if exists (select 1 from public.admins) then
    return public.is_admin();
  end if;
  insert into public.admins (user_id, email)
  select id, email from auth.users where id = auth.uid();
  return true;
end $$;
revoke execute on function public.claim_first_admin() from public, anon;
grant  execute on function public.claim_first_admin() to authenticated;

-- הוספת מנהל מערכת נוסף (המשתמש צריך להתחבר פעם אחת לפני כן)
create or replace function public.add_admin(p_email text)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not public.is_admin() then raise exception 'not_authorized' using errcode = '42501'; end if;
  select id into v_id from auth.users where lower(email) = lower(trim(p_email));
  if v_id is null then raise exception 'user_not_found'; end if;
  insert into public.admins (user_id, email) values (v_id, lower(trim(p_email))) on conflict do nothing;
  return true;
end $$;
revoke execute on function public.add_admin(text) from public, anon;
grant  execute on function public.add_admin(text) to authenticated;

-- כל הנתונים שהלוח צריך, לפי הרשאה: מנהל מערכת או קישור אישי של מגמה
create or replace function public.board_data(p_token text, p_from date, p_to date)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v_admin boolean := public.is_admin();
  v_unit  uuid;
begin
  if not v_admin then
    v_unit := public.unit_for_token(p_token);
    if v_unit is null then raise exception 'not_authorized' using errcode = '42501'; end if;
  end if;
  if p_to - p_from > 400 then p_from := p_to - 400; end if;

  return jsonb_build_object(
    'role',  case when v_admin then 'admin' else 'unit' end,
    'me',    v_unit,
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
        'id', c.id, 'unit_id', c.unit_id, 'name', c.name, 'start_date', c.start_date,
        'end_date', c.end_date, 'org', c.org, 'ext', c.ext)), '[]'::jsonb)
      from public.courses c
      where not c.cancelled and c.end_date >= p_from and c.start_date <= p_to + 60),
    'reports', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'unit_id', r.unit_id, 'report_date', r.report_date, 'staff_in', r.staff_in,
        'staff_out', r.staff_out, 'no_course', r.no_course, 'counts', r.counts,
        'reported_at', r.reported_at)), '[]'::jsonb)
      from public.reports r where r.report_date between p_from and p_to)
  );
end $$;
grant execute on function public.board_data(text, date, date) to anon, authenticated;

-- שליחת / עדכון דיווח יומי
create or replace function public.submit_report(
  p_token text, p_unit uuid, p_staff_in int, p_staff_out int, p_counts jsonb, p_date date default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_admin  boolean := public.is_admin();
  v_date   date := coalesce(p_date, public.il_today());
  v_counts jsonb;
begin
  if not v_admin then
    if public.unit_for_token(p_token) is distinct from p_unit then
      raise exception 'not_authorized' using errcode = '42501';
    end if;
    v_date := public.il_today();           -- מנהל מגמה מדווח רק על היום
  end if;
  if not exists (select 1 from public.units where id = p_unit and active) then
    raise exception 'unit_not_found';
  end if;

  -- נשמרים רק מספרים של השתלמויות של המגמה שפעילות באותו יום
  select coalesce(jsonb_object_agg(c.id::text, jsonb_build_object(
           'org', greatest(0, least(9999, coalesce((p_counts -> c.id::text ->> 'org')::int, c.org))),
           'ext', greatest(0, least(9999, coalesce((p_counts -> c.id::text ->> 'ext')::int, c.ext))))), '{}'::jsonb)
    into v_counts
    from public.courses c
   where c.unit_id = p_unit and not c.cancelled and v_date between c.start_date and c.end_date;

  insert into public.reports (unit_id, report_date, staff_in, staff_out, no_course, counts)
  values (p_unit, v_date,
          greatest(0, least(9999, coalesce(p_staff_in, 0))),
          greatest(0, least(9999, coalesce(p_staff_out, 0))),
          v_counts = '{}'::jsonb, v_counts)
  on conflict (unit_id, report_date) do update
     set staff_in = excluded.staff_in, staff_out = excluded.staff_out,
         no_course = excluded.no_course, counts = excluded.counts, updated_at = now();

  return jsonb_build_object('ok', true, 'date', v_date);
end $$;
grant execute on function public.submit_report(text, uuid, int, int, jsonb, date) to anon, authenticated;

-- הוספת השתלמות (חד-יומית או רב-יומית)
create or replace function public.add_course(
  p_token text, p_unit uuid, p_name text, p_start date, p_end date, p_org int, p_ext int)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not public.is_admin() then
    if public.unit_for_token(p_token) is distinct from p_unit then
      raise exception 'not_authorized' using errcode = '42501';
    end if;
    if p_end < public.il_today() or p_start > public.il_today() + 365 then
      raise exception 'bad_dates';
    end if;
  end if;
  insert into public.courses (unit_id, name, start_date, end_date, org, ext)
  values (p_unit, trim(p_name), p_start, p_end,
          greatest(0, least(9999, coalesce(p_org, 0))), greatest(0, least(9999, coalesce(p_ext, 0))))
  returning id into v_id;
  return v_id;
end $$;
grant execute on function public.add_course(text, uuid, text, date, date, int, int) to anon, authenticated;

-- ---------- עדכון לייב ----------
create or replace function public.touch_pulse()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.pulse set changed_at = now() where id = 1;
  return null;
end $$;

drop trigger if exists units_pulse   on public.units;
drop trigger if exists courses_pulse on public.courses;
drop trigger if exists reports_pulse on public.reports;
create trigger units_pulse   after insert or update or delete on public.units   for each statement execute function public.touch_pulse();
create trigger courses_pulse after insert or update or delete on public.courses for each statement execute function public.touch_pulse();
create trigger reports_pulse after insert or update or delete on public.reports for each statement execute function public.touch_pulse();

do $$ begin
  alter publication supabase_realtime add table public.pulse;
exception when duplicate_object then null; end $$;
