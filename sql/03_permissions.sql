-- =====================================================================
-- הרשאות: מנהלי מערכת, עורכים וצופים (כולל קישורי צפייה).
-- הריצו פעם אחת אחרי 01_schema.sql. בטוח להריץ שוב.
-- =====================================================================

create table if not exists public.members (
  id          uuid primary key default gen_random_uuid(),
  name        text not null default '' check (length(name) <= 120),
  role        text not null check (role in ('admin', 'editor', 'viewer')),
  email       text unique check (email is null or email = lower(email)),
  token       text unique,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  check ((email is not null) <> (token is not null)),   -- או משתמש עם מייל, או קישור אישי
  check (role <> 'admin' or email is not null)          -- מנהל מערכת רק עם משתמש וסיסמה
);
alter table public.members enable row level security;   -- אין גישה ישירה; רק דרך הפונקציות למטה

-- מנהלים קיימים עוברים לטבלה החדשה
insert into public.members (role, email)
select 'admin', lower(email) from public.admins where email is not null
on conflict (email) do nothing;

-- המייל של המשתמש המחובר, רק אם אומת
create or replace function public.my_email()
returns text language sql stable security definer set search_path = public as $$
  select lower(email) from auth.users where id = auth.uid() and (email_confirmed_at is not null or exists (select 1 from public.admins a where a.user_id = auth.uid()));
$$;
revoke execute on function public.my_email() from public, anon, authenticated;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid())
      or exists (select 1 from public.members m where m.role = 'admin' and m.active and m.email = public.my_email());
$$;

-- מי הצופה הנוכחי: לפי משתמש מחובר ו/או קישור אישי. הדרגה הגבוהה מנצחת.
create or replace function public.access_ctx(p_token text, out role text, out unit_id uuid)
language plpgsql stable security definer set search_path = public as $$
declare
  v_email text := public.my_email();
  v_acc   text;
  v_link  text;
  v_unit  uuid;
begin
  role := null; unit_id := null;
  if public.is_admin() then role := 'admin'; return; end if;
  if v_email is not null then
    select m.role into v_acc from public.members m where m.email = v_email and m.active;
  end if;
  if length(coalesce(p_token, '')) >= 16 then
    select m.role into v_link from public.members m where m.token = p_token and m.active and m.role <> 'admin';
    select u.id into v_unit from public.units u where u.token = p_token and u.active;
  end if;
  if v_acc = 'editor' or v_link = 'editor' then role := 'editor'; return; end if;
  if v_unit is not null then role := 'unit'; unit_id := v_unit; return; end if;
  if v_acc = 'viewer' or v_link = 'viewer' then role := 'viewer'; return; end if;
end $$;
revoke execute on function public.access_ctx(text) from public, anon, authenticated;

-- המשתמש הראשון הופך למנהל (גם בטבלה החדשה)
create or replace function public.claim_first_admin()
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  if exists (select 1 from public.admins) or exists (select 1 from public.members where role = 'admin' and active) then
    return public.is_admin();
  end if;
  insert into public.admins (user_id, email) select id, email from auth.users where id = auth.uid();
  insert into public.members (role, email) select 'admin', lower(email) from auth.users where id = auth.uid()
  on conflict (email) do update set role = 'admin', active = true;
  return true;
end $$;

-- ---------- הלוח, לפי הרשאה ----------
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
      from public.reports r where r.report_date between p_from and p_to)
  );
end $$;
grant execute on function public.board_data(text, date, date) to anon, authenticated;

create or replace function public.can_write_unit(p_token text, p_unit uuid)
returns text language plpgsql stable security definer set search_path = public as $$
declare c record;
begin
  select * into c from public.access_ctx(p_token);
  if c.role in ('admin', 'editor') then return c.role; end if;
  if c.role = 'unit' and c.unit_id = p_unit then return 'unit'; end if;
  return null;
end $$;
revoke execute on function public.can_write_unit(text, uuid) from public, anon, authenticated;

create or replace function public.submit_report(
  p_token text, p_unit uuid, p_staff_in int, p_staff_out int, p_counts jsonb, p_date date default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_role   text := public.can_write_unit(p_token, p_unit);
  v_date   date := coalesce(p_date, public.il_today());
  v_counts jsonb;
begin
  if v_role is null then raise exception 'not_authorized' using errcode = '42501'; end if;
  if v_role <> 'admin' then v_date := public.il_today(); end if;
  if not exists (select 1 from public.units where id = p_unit and active) then raise exception 'unit_not_found'; end if;

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

create or replace function public.add_course(
  p_token text, p_unit uuid, p_name text, p_start date, p_end date, p_org int, p_ext int)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_role text := public.can_write_unit(p_token, p_unit); v_id uuid;
begin
  if v_role is null then raise exception 'not_authorized' using errcode = '42501'; end if;
  if v_role <> 'admin' and (p_end < public.il_today() or p_start > public.il_today() + 365) then
    raise exception 'bad_dates';
  end if;
  insert into public.courses (unit_id, name, start_date, end_date, org, ext)
  values (p_unit, trim(p_name), p_start, p_end,
          greatest(0, least(9999, coalesce(p_org, 0))), greatest(0, least(9999, coalesce(p_ext, 0))))
  returning id into v_id;
  return v_id;
end $$;

-- ---------- ניהול הרשאות (מנהלי מערכת בלבד) ----------
create or replace function public.list_members()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not_authorized' using errcode = '42501'; end if;
  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', m.id, 'name', m.name, 'role', m.role, 'email', m.email, 'token', m.token,
      'created_at', m.created_at,
      'has_account', exists (select 1 from auth.users u where lower(u.email) = m.email and u.email_confirmed_at is not null),
      'is_me', m.email is not null and m.email = public.my_email()
    ) order by case m.role when 'admin' then 0 when 'editor' then 1 else 2 end, m.created_at), '[]'::jsonb)
    from public.members m where m.active);
end $$;
grant execute on function public.list_members() to authenticated;

create or replace function public.save_member(p_id uuid, p_name text, p_role text, p_email text, p_link boolean)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_email text := nullif(lower(trim(coalesce(p_email, ''))), '');
  v_row   public.members;
  v_id    uuid;
begin
  if not public.is_admin() then raise exception 'not_authorized' using errcode = '42501'; end if;
  if p_role not in ('admin', 'editor', 'viewer') then raise exception 'bad_role'; end if;

  if p_id is null then
    if coalesce(p_link, false) then
      if p_role = 'admin' then raise exception 'admin_needs_email'; end if;
      insert into public.members (name, role, token)
      values (trim(coalesce(p_name, '')), p_role, replace(gen_random_uuid()::text, '-', ''))
      returning id into v_id;
    else
      if v_email is null or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'bad_email'; end if;
      insert into public.members (name, role, email) values (trim(coalesce(p_name, '')), p_role, v_email)
      on conflict (email) do update set name = excluded.name, role = excluded.role, active = true
      returning id into v_id;
    end if;
    return v_id;
  end if;

  select * into v_row from public.members where id = p_id and active;
  if not found then raise exception 'not_found'; end if;
  if v_row.token is not null and p_role = 'admin' then raise exception 'admin_needs_email'; end if;
  if v_row.role = 'admin' and p_role <> 'admin' then
    if v_row.email = public.my_email() then raise exception 'cannot_demote_self'; end if;
    if (select count(*) from public.members where role = 'admin' and active) <= 1 then raise exception 'last_admin'; end if;
    delete from public.admins a using auth.users u where u.id = a.user_id and lower(u.email) = v_row.email;
  end if;
  update public.members set name = trim(coalesce(p_name, name)), role = p_role where id = p_id;
  return p_id;
end $$;
grant execute on function public.save_member(uuid, text, text, text, boolean) to authenticated;

create or replace function public.rotate_member_link(p_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare v_token text := replace(gen_random_uuid()::text, '-', '');
begin
  if not public.is_admin() then raise exception 'not_authorized' using errcode = '42501'; end if;
  update public.members set token = v_token where id = p_id and token is not null and active;
  if not found then raise exception 'not_found'; end if;
  return v_token;
end $$;
grant execute on function public.rotate_member_link(uuid) to authenticated;

create or replace function public.remove_member(p_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_row public.members;
begin
  if not public.is_admin() then raise exception 'not_authorized' using errcode = '42501'; end if;
  select * into v_row from public.members where id = p_id and active;
  if not found then return false; end if;
  if v_row.role = 'admin' then
    if v_row.email = public.my_email() then raise exception 'cannot_remove_self'; end if;
    if (select count(*) from public.members where role = 'admin' and active) <= 1 then raise exception 'last_admin'; end if;
    delete from public.admins a using auth.users u where u.id = a.user_id and lower(u.email) = v_row.email;
  end if;
  if v_row.token is not null then
    delete from public.members where id = p_id;           -- קישור שהוסר: נמחק לגמרי
  else
    update public.members set active = false where id = p_id;
  end if;
  return true;
end $$;
grant execute on function public.remove_member(uuid) to authenticated;

drop trigger if exists members_pulse on public.members;
create trigger members_pulse after insert or update or delete on public.members for each statement execute function public.touch_pulse();
