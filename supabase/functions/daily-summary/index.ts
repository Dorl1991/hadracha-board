// סיכום בוקר במייל למי שסומן בלשונית "ניהול".
// רץ אוטומטית ב-10:15 בימי עבודה (sql/05_daily_summary_cron.sql), או ידנית מהכפתור "שליחת סיכום לבדיקה".
// שליחה דרך Gmail (סיסמת אפליקציה). אפשר גם Resend אם מגדירים RESEND_API_KEY ודומיין מאומת.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import nodemailer from "npm:nodemailer@6.9.16";

const env = (k: string, d = "") => Deno.env.get(k) ?? d;
const SUPABASE_URL = env("SUPABASE_URL");
const SERVICE_KEY = env("SUPABASE_SERVICE_ROLE_KEY");
const CRON_SECRET = env("CRON_SECRET");
const SITE_URL = env("SITE_URL").replace(/\/?$/, "/");
const DEADLINE = env("DEADLINE", "10:00");
const TITLE = env("BOARD_TITLE", "אגף הדרכה · לוח התייצבות");

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

function israelNow() {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  const date = `${g("year")}-${g("month")}-${g("day")}`;
  return { date, hour: Number(g("hour")), hm: `${g("hour")}:${g("minute")}`, dow: new Date(date + "T12:00:00Z").getUTCDay() };
}
const timeIL = (ts: string) => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jerusalem", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(ts));

async function sendMail(to: string[], subject: string, html: string, text: string) {
  const fromName = env("MAIL_FROM_NAME", TITLE);
  if (env("RESEND_API_KEY")) {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env("RESEND_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: `${fromName} <${env("MAIL_FROM")}>`, to, subject, html, text }),
    });
    if (!r.ok) throw new Error("resend_failed: " + (await r.text()));
    return;
  }
  const user = env("SMTP_USER"), pass = env("SMTP_PASS");
  if (!user || !pass) throw new Error("mail_not_configured");
  const t = nodemailer.createTransport({ host: env("SMTP_HOST", "smtp.gmail.com"), port: Number(env("SMTP_PORT", "465")), secure: true, auth: { user, pass } });
  await t.sendMail({ from: `"${fromName}" <${env("MAIL_FROM", user)}>`, bcc: to, subject, html, text });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  let body: { test?: boolean } = {};
  try { body = await req.json(); } catch (_) { /* empty */ }

  // מי קורא: התזמון האוטומטי (סיסמה) או מנהל מערכת מחובר (בדיקה)
  let testTo: string | null = null;
  if (!(CRON_SECRET && req.headers.get("x-cron-secret") === CRON_SECRET)) {
    const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data } = await db.auth.getUser(jwt);
    const email = data?.user?.email?.toLowerCase();
    if (!email) return json({ error: "unauthorized" }, 401);
    const { data: adm } = await db.from("members").select("id").eq("email", email).eq("role", "admin").eq("active", true).maybeSingle();
    const { data: legacy } = await db.from("admins").select("user_id").eq("user_id", data!.user!.id).maybeSingle();
    if (!adm && !legacy) return json({ error: "forbidden" }, 403);
    testTo = email;
  }

  const now = israelNow();
  const { data: special } = await db.from("special_days").select("kind,deadline,label").eq("day", now.date).maybeSingle();
  if (!testTo) {
    if (now.hour !== 10 || now.dow >= 5) return json({ skipped: "not_10am_workday", now });
    if (special?.kind === "off") return json({ skipped: "special_day_off", label: special.label });
  }
  const deadline = special?.kind === "short" && special.deadline ? String(special.deadline).slice(0, 5) : DEADLINE;

  const [{ data: units }, { data: reps }, { data: courses }, { data: recips }] = await Promise.all([
    db.from("units").select("id,name,sort_order").eq("active", true).order("sort_order"),
    db.from("reports").select("unit_id,staff_in,staff_out,counts,reported_at").eq("report_date", now.date),
    db.from("courses").select("id,unit_id,name,org,ext").eq("cancelled", false).lte("start_date", now.date).gte("end_date", now.date),
    db.from("members").select("email").eq("digest", true).eq("active", true).not("email", "is", null),
  ]);
  const to = testTo ? [testTo] : (recips ?? []).map((r) => r.email as string);
  if (!to.length) return json({ skipped: "no_recipients" });

  const unitIds = new Set((units ?? []).map((u) => u.id));
  const repBy = new Map((reps ?? []).filter((r) => unitIds.has(r.unit_id)).map((r) => [r.unit_id, r]));
  let staffIn = 0, staffOut = 0, org = 0, ext = 0;
  for (const r of repBy.values()) { staffIn += r.staff_in || 0; staffOut += r.staff_out || 0; }
  const activeCourses = (courses ?? []).filter((c) => unitIds.has(c.unit_id));
  for (const c of activeCourses) {
    const k = repBy.get(c.unit_id)?.counts?.[c.id];
    org += k ? k.org || 0 : c.org || 0; ext += k ? k.ext || 0 : c.ext || 0;
  }
  const total = staffIn + org + ext;
  const missing = (units ?? []).filter((u) => !repBy.has(u.id));
  const late = (units ?? []).filter((u) => repBy.has(u.id) && timeIL(repBy.get(u.id)!.reported_at) > deadline);
  const dayName = `יום ${DAYS[now.dow]}, ${Number(now.date.slice(8))}.${Number(now.date.slice(5, 7))}`;

  const subject = `${testTo ? "[בדיקה] " : ""}סיכום בוקר · ${dayName} · ${total} באתרים${missing.length ? ` · חסרים ${missing.length}` : ""}`;
  const stat = (k: string, v: number) => `<td style="padding:10px 14px;border-inline-start:1px solid #eadfdb"><div style="font-size:12px;color:#827773">${k}</div><div style="font-size:22px;color:#1A1514">${v}</div></td>`;
  const html = `<!doctype html><html dir="rtl" lang="he"><body style="margin:0;background:#F5F2F0;font-family:Arial,Helvetica,sans-serif;direction:rtl">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F2F0"><tr><td align="center" style="padding:24px 12px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E8E1DD">
    <tr><td style="background:#5A140E;background-image:linear-gradient(135deg,#8A2116,#2A0C0A);padding:24px 26px;color:#FFF4F0">
      <div style="font-size:13px;opacity:.75">${esc(TITLE)} · ${esc(dayName)} · ${now.hm}</div>
      <div style="font-size:52px;font-weight:300;line-height:1.1;margin-top:10px">${total}</div>
      <div style="font-size:16px;opacity:.85">אנשים באתרי ההדרכה</div>
    </td></tr>
    <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid #eadfdb"><tr>
      ${stat("סגל באתרים", staffIn)}${stat("חניכי הארגון", org)}${stat("מחוץ לארגון", ext)}${stat("השתלמויות", activeCourses.length)}
    </tr></table></td></tr>
    <tr><td style="padding:18px 26px">
      <div style="font-size:15px;color:#1A1514;margin-bottom:8px"><b>${repBy.size}</b> מתוך ${(units ?? []).length} מגמות דיווחו${special?.kind === "short" ? ` (הדיווח נסגר היום ב-${deadline})` : ""}</div>
      ${missing.length ? `<div style="background:#F6E5E3;color:#A3221C;border-radius:10px;padding:10px 12px;font-size:14px"><b>לא דיווחו:</b> ${missing.map((u) => esc(u.name)).join(" · ")}</div>`
        : `<div style="background:#E4F0E8;color:#2E7A4F;border-radius:10px;padding:10px 12px;font-size:14px">כל המגמות דיווחו.</div>`}
      ${late.length ? `<div style="font-size:13px;color:#8F5C00;margin-top:8px">דיווחו באיחור: ${late.map((u) => esc(u.name)).join(" · ")}</div>` : ""}
      ${staffOut ? `<div style="font-size:13px;color:#827773;margin-top:8px">${staffOut} אנשי סגל מחוץ לאתרים.</div>` : ""}
    </td></tr>
    ${SITE_URL !== "/" ? `<tr><td style="padding:0 26px 24px"><a href="${esc(SITE_URL)}" style="display:inline-block;background:#1A1514;color:#ffffff;text-decoration:none;border-radius:10px;padding:11px 18px;font-size:14px">פתיחת הלוח</a></td></tr>` : ""}
  </table>
  <div style="font-size:11px;color:#978A85;margin-top:12px">נשלח אוטומטית מלוח ההתייצבות. ההגדרה בלשונית "ניהול".</div>
  </td></tr></table></body></html>`;
  const text = `${TITLE} · ${dayName}\n${total} אנשים באתרים (סגל ${staffIn}, חניכי ארגון ${org}, מחוץ לארגון ${ext}).\n${repBy.size}/${(units ?? []).length} מגמות דיווחו.${missing.length ? `\nלא דיווחו: ${missing.map((u) => u.name).join(", ")}` : ""}\n${SITE_URL}`;

  try { await sendMail(to, subject, html, text); }
  catch (e) { return json({ error: String((e as Error).message || e) }, 500); }
  return json({ sent: to.length, to: testTo ?? `${to.length} נמענים`, total, missing: missing.length });
});
