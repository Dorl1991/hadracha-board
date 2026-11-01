-- =====================================================================
-- 05: דיווח מראש (עד שבוע קדימה), המשך אוטומטי של השתלמויות רב-יומיות,
--     ושמות מנהלי המגמות.
-- הריצו פעם אחת אחרי 04_upgrades.sql. בטוח להריץ שוב.
-- =====================================================================

-- דיווח שהועבר אוטומטית מיום קודם מסומן בתאריך המקור
alter table public.reports add column if not exists carried_from date;

-- יום עבודה: ראשון עד חמישי, ולא יום שסומן "אין חובת דיווח"
create or replace function public.is_workday(d date)
returns boolean language sql stable set search_path = public as $$
  select extract(dow from d) between 0 and 4
     and not exists (select 1 from public.special_days s where s.day = d and s.kind = 'off');
$$;
revoke execute on function public.is_workday(date) from public, anon, authenticated;

-- מספרי החניכים לכל השתלמות שפעילה ביום מסוים
create or replace function public.report_counts(p_unit uuid, p_day date, p_counts jsonb)
returns jsonb language sql stable set search_path = public as $$
  select coalesce(jsonb_object_agg(c.id::text, jsonb_build_object(
           'org', greatest(0, least(9999, coalesce((p_counts -> c.id::text ->> 'org')::int, c.org))),
           'ext', greatest(0, least(9999, coalesce((p_counts -> c.id::text ->> 'ext')::int, c.ext))))), '{}'::jsonb)
    from public.courses c
   where c.unit_id = p_unit and not c.cancelled and p_day between c.start_date and c.end_date;
$$;
revoke execute on function public.report_counts(uuid, date, jsonb) from public, anon, authenticated;

-- שליחת דיווח: היום או עד 7 ימים קדימה. אם יש השתלמות שממשיכה אחרי היום המדווח,
-- הדיווח מועתק לימי העבודה הבאים עד סופה. ימים שדווחו ידנית לא נדרסים, וההעתקה נעצרת בהם.
create or replace function public.submit_report(
  p_token text, p_unit uuid, p_staff_in int, p_staff_out int, p_counts jsonb, p_date date default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_role   text := public.can_write_unit(p_token, p_unit);
  v_today  date := public.il_today();
  v_date   date := coalesce(p_date, public.il_today());
  v_in     int  := greatest(0, least(9999, coalesce(p_staff_in, 0)));
  v_out    int  := greatest(0, least(9999, coalesce(p_staff_out, 0)));
  v_counts jsonb;
  v_until  date;
  d        date;
  v_n      int  := 0;
begin
  if v_role is null then raise exception 'not_authorized' using errcode = '42501'; end if;
  if v_role <> 'admin' and (v_date < v_today or v_date > v_today + 7) then raise exception 'bad_dates'; end if;
  if not exists (select 1 from public.units where id = p_unit and active) then raise exception 'unit_not_found'; end if;

  v_counts := public.report_counts(p_unit, v_date, p_counts);
  insert into public.reports (unit_id, report_date, staff_in, staff_out, no_course, counts, carried_from)
  values (p_unit, v_date, v_in, v_out, v_counts = '{}'::jsonb, v_counts, null)
  on conflict (unit_id, report_date) do update
     set staff_in = excluded.staff_in, staff_out = excluded.staff_out,
         no_course = excluded.no_course, counts = excluded.counts,
         reported_at = case when public.reports.carried_from is not null then now() else public.reports.reported_at end,
         carried_from = null, updated_at = now();

  select max(c.end_date) into v_until
    from public.courses c
   where c.unit_id = p_unit and not c.cancelled and v_date between c.start_date and c.end_date and c.end_date > v_date;

  if v_until is not null then
    d := v_date + 1;
    while d <= v_until loop
      if public.is_workday(d) then
        exit when exists (select 1 from public.reports r where r.unit_id = p_unit and r.report_date = d and r.carried_from is null);
        v_counts := public.report_counts(p_unit, d, p_counts);
        insert into public.reports (unit_id, report_date, staff_in, staff_out, no_course, counts, carried_from, reported_at)
        values (p_unit, d, v_in, v_out, v_counts = '{}'::jsonb, v_counts, v_date, now())
        on conflict (unit_id, report_date) do update
           set staff_in = excluded.staff_in, staff_out = excluded.staff_out,
               no_course = excluded.no_course, counts = excluded.counts,
               carried_from = excluded.carried_from, reported_at = excluded.reported_at, updated_at = now();
        v_n := v_n + 1;
      end if;
      d := d + 1;
    end loop;
  end if;
  return jsonb_build_object('ok', true, 'date', v_date, 'carried_days', v_n, 'until', v_until);
end $$;
grant execute on function public.submit_report(text, uuid, int, int, jsonb, date) to anon, authenticated;

-- הלוח מקבל גם את סימון ההמשך האוטומטי
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

-- שמות מנהלי המגמות
update public.units set manager_name = 'רמי מזרחי'       where name like '%הגנה מאש%';
update public.units set manager_name = 'סנדרה מוסקוביץ'  where name like '%חומ_ס%';
update public.units set manager_name = 'נצר שמעוני'      where name like '%יער%';
update public.units set manager_name = 'ימית אהרון'      where name like '%כיבוי%';
update public.units set manager_name = 'מעיין מלכה'      where name like '%פו_מ%';
update public.units set manager_name = 'עמית לוי'        where name like '%גורמי חוץ%';
update public.units set manager_name = 'עדי לוי'         where name = 'מטה';

select name, manager_name from public.units order by sort_order;
