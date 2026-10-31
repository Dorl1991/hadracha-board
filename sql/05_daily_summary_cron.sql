-- =====================================================================
-- תזמון סיכום הבוקר: 10:15 בימים א'–ה'.
-- רץ ב-07:15 וב-08:15 UTC; הפונקציה שולחת רק כשבישראל השעה 10 (נכון בחורף ובקיץ),
-- ומדלגת אוטומטית על ימים שסומנו "אין דיווח".
-- לפני ההרצה: החליפו את CRON_SECRET באותה מחרוזת שהגדרתם ב-Secrets של הפונקציה.
-- =====================================================================
create extension if not exists pg_net;
create extension if not exists pg_cron;

select cron.unschedule('daily-summary') where exists (select 1 from cron.job where jobname = 'daily-summary');

select cron.schedule(
  'daily-summary',
  '15 7,8 * * 0-4',
  $$
  select net.http_post(
    url     := 'https://PROJECT_REF.supabase.co/functions/v1/daily-summary',
    headers := '{"Content-Type": "application/json", "x-cron-secret": "CRON_SECRET"}'::jsonb,
    body    := '{}'::jsonb
  );
  $$
);
