const CFG = window.APP_CONFIG || {};
const TZ = "Asia/Jerusalem";
const DEADLINE = CFG.DEADLINE || "10:00";
const DEFAULT_SITE = CFG.DEFAULT_SITE || "המכללה הארצית";

/* ---------- dates ---------- */
const isoInTZ = d => new Intl.DateTimeFormat("en-CA",{timeZone:TZ,year:"numeric",month:"2-digit",day:"2-digit"}).format(d);
const hmInTZ = d => new Intl.DateTimeFormat("en-GB",{timeZone:TZ,hour:"2-digit",minute:"2-digit",hour12:false}).format(d);
const TODAY = isoInTZ(new Date());
const nowHM = () => hmInTZ(new Date());
function parts(iso){ const [y,m,d] = iso.split("-").map(Number); return {y,m,d}; }
function addDays(iso,n){ const {y,m,d}=parts(iso); return new Date(Date.UTC(y,m-1,d+n)).toISOString().slice(0,10); }
function dow(iso){ const {y,m,d}=parts(iso); return new Date(Date.UTC(y,m-1,d)).getUTCDay(); }
const isWork = iso => dow(iso) <= 4;
function addWork(iso,n){ let d=iso, k=Math.abs(n); const s=n<0?-1:1; while(k>0){ d=addDays(d,s); if(isWork(d)) k--; } return d; }
function workdaysBetween(a,b){ const out=[]; let d=a; while(d<=b){ if(isWork(d)) out.push(d); d=addDays(d,1);} return out; }
const DAYS = ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];
function heLong(iso){ const {y,m,d}=parts(iso); return `יום ${DAYS.at(dow(iso))}, ${d}.${m}.${y}`; }
function heMid(iso){ const {m,d}=parts(iso); return `${DAYS.at(dow(iso))} ${d}.${m}`; }
function heShort(iso){ const {m,d}=parts(iso); return `${d}.${m}`; }
function timeOf(ts){ if(!ts) return ""; try{ return hmInTZ(new Date(ts)); }catch(e){ return ""; } }
const hmToMin = hm => { const [h,m] = hm.split(":").map(Number); return h*60+m; };

/* ---------- utils ---------- */
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt = n => new Intl.NumberFormat("he-IL").format(n||0);
const clampInt = v => { const n = Math.round(Number(v)); return Number.isFinite(n) && n>0 ? Math.min(n, 9999) : 0; };
function rid(n=8){ const a="abcdefghjkmnpqrstuvwxyz23456789"; let s=""; crypto.getRandomValues(new Uint8Array(n)).forEach(x=>s+=a[x%a.length]); return s; }
let toastT;
function toast(msg){ const t=document.getElementById("toast"); t.firstElementChild.textContent=msg; t.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>t.hidden=true, 3800); }
function linkFor(token){ return location.origin + location.pathname + "?u=" + token; }
const siteOf = m => (m && m.site) || DEFAULT_SITE;
function waLink(m){
  const digits = String(m.phone||"").replace(/\D/g,"");
  const intl = digits.startsWith("0") ? "972" + digits.slice(1) : digits;
  const text = `שלום ${m.name}, זה הקישור האישי שלך לדיווח ההתייצבות היומי של ${m.track} (${siteOf(m)}). הדיווח עד ${DEADLINE}:\n${linkFor(m.token)}`;
  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
}
async function copyText(t, msg){ try{ await navigator.clipboard.writeText(t); toast(msg || "הקישור הועתק"); }catch(e){ toast("לא ניתן להעתיק אוטומטית: " + t); } }

const EMBLEM = `<svg viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="15.5" fill="none" stroke="var(--brand)" stroke-width="1.2"/><path d="M17 8.5c1.6 3.1 5 4.9 5 9.2a5 5 0 0 1-10 0c0-2 1.1-3.4 2.2-4.4.2 1.5 1 2.4 2.1 2.9-.4-2.6-.2-5.4.7-7.7z" fill="none" stroke="var(--brand)" stroke-width="1.2" stroke-linejoin="round"/><path d="M11 25.5h12" stroke="var(--brand)" stroke-width="1.2" stroke-linecap="round"/></svg>`;

/*GEN-START*/
function genDemo(T){
  let seed = 41; const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const ri = (a,b) => a + Math.floor(rnd()*(b-a+1));
  const W = n => n===0 ? T : addWork(T,n);
  const C = "המכללה הארצית";
  const managers = {
    "m-rs": {name:"מיכל לוי", site:C, track:"מגמת כיבוי וחילוץ", phone:"050-0000002", token:"rs4m9q", active:true, example:true, base:11},
    "m-hz": {name:"אבי כהן", site:C, track:"מגמת חומ״ס ומתנדבים", phone:"050-0000001", token:"hz7k2p", active:true, example:true, base:9},
    "m-ft": {name:"דני אברהם", site:C, track:"מגמת הגנה מאש וחקירות", phone:"050-0000005", token:"ft5n8v", active:true, example:true, base:5},
    "m-cm": {name:"יוסי מזרחי", site:C, track:"מגמת פו״מ", phone:"050-0000003", token:"cm8t3w", active:true, example:true, base:6},
    "m-bs": {name:"נועה פרץ", site:C, track:"מגמת יער ושטחים פתוחים", phone:"050-0000004", token:"bs2x6r", active:true, example:true, base:14},
    "m-in": {name:"רונית שמעוני", site:C, track:"מדור גורמי חוץ", phone:"050-0000006", token:"in3p7d", active:true, example:true, base:7},
    "m-n1": {name:"עומר חדד", site:C, track:"מטה", phone:"050-0000007", token:"n1k4ze", active:true, example:true, base:9}
  };
  const courses = {
    "c-hz1": {name:"השתלמות חומ\"ס – תגובה ראשונית", mid:"m-hz", start:W(-9), end:W(-6), org:16, ext:6},
    "c-hz2": {name:"השתלמות חומ\"ס – ניטור וזיהוי", mid:"m-hz", start:W(-3), end:W(1), org:18, ext:4},
    "c-rs1": {name:"קורס חילוץ מהריסות", mid:"m-rs", start:W(-7), end:W(3), org:22, ext:0},
    "c-cm1": {name:"השתלמות קציני משמרת", mid:"m-cm", start:W(-2), end:W(0), org:14, ext:2},
    "c-bs1": {name:"קורס כיבוי שריפות יער ושטח – מחזור 12", mid:"m-bs", start:W(-9), end:W(20), org:28, ext:0},
    "c-ft1": {name:"ריענון בטיחות אש לממוני בטיחות", mid:"m-ft", start:W(0), end:W(0), org:0, ext:35},
    "c-ft2": {name:"יום עיון – מערכות כיבוי אוטומטיות", mid:"m-ft", start:W(-5), end:W(-5), org:4, ext:26},
    "c-in1": {name:"הכשרת צוותי חירום במפעלים", mid:"m-in", start:W(-1), end:W(0), org:0, ext:12}
  };
  for (const c of Object.values(courses)) { c.cancelled = false; c.example = true; }
  const reports = {};
  const todayReported = {"m-hz":"07:52","m-rs":"08:15","m-bs":"08:31","m-in":"09:06","m-n1":"08:05"};
  for(let k=-9;k<=0;k++){
    const D = W(k);
    const off = new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Jerusalem",timeZoneName:"shortOffset"}).formatToParts(new Date(D+"T09:00:00Z")).find(p=>p.type==="timeZoneName").value.replace("GMT","");
    const tz = "+" + String(Math.abs(parseInt(off,10)||2)).padStart(2,"0") + ":00";
    for(const [mid,m] of Object.entries(managers)){
      let at;
      if(k===0){ if(!todayReported[mid]) continue; at = todayReported[mid]; }
      else { if(rnd() < 0.08) continue; const mins = ri(7*60+35, 10*60+25); at = String(Math.floor(mins/60)).padStart(2,"0")+":"+String(mins%60).padStart(2,"0"); }
      const counts = {}; let any = false;
      for(const [cid,c] of Object.entries(courses)){
        if(c.mid!==mid || c.start>D || c.end<D) continue; any = true;
        counts[cid] = {org: Math.max(0, c.org - ri(0,2)), ext: Math.max(0, c.ext - (c.ext ? ri(0,1) : 0))};
      }
      reports[D+"_"+mid] = {date:D, mid, staffIn: m.base + ri(-2,2), staffOut: ri(0,4), noCourse: !any, counts, at: D+"T"+at+":00"+tz, example:true};
    }
  }
  for(const m of Object.values(managers)) delete m.base;
  return {managers, courses, reports};
}
/*GEN-END*/

/* ---------- store: Supabase when configured, local demo otherwise ---------- */
const S = { managers:new Map(), courses:new Map(), reports:new Map(), mode:"loading", got:new Set(), role:"none", me:null, err:"" };
let sb = null, session = null, API = null;
const FROM = addDays(TODAY, -90);
function lsGet(k){ try { return localStorage.getItem(k); } catch(e) { return null; } }
function lsSet(k,v){ try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch(e) {} }
const QS = new URLSearchParams(location.search);
let TOKEN = QS.get("u") || lsGet("unit-token") || "";
if (QS.get("u")) lsSet("unit-token", QS.get("u"));
const randToken = () => [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2,"0")).join("");

function applyBoard(d){
  S.role = d.role; S.me = d.me || null;
  S.managers = new Map((d.units||[]).map(u => [u.id, {name:u.manager_name||"", track:u.name, phone:u.phone||"", site:u.site||DEFAULT_SITE, token:u.token||"", active:u.active!==false}]));
  S.courses = new Map((d.courses||[]).map(c => [c.id, {name:c.name, mid:c.unit_id, start:c.start_date, end:c.end_date, org:c.org, ext:c.ext, cancelled:false}]));
  S.reports = new Map((d.reports||[]).map(r => [r.report_date+"_"+r.unit_id, {date:r.report_date, mid:r.unit_id, staffIn:r.staff_in, staffOut:r.staff_out, noCourse:r.no_course, counts:r.counts||{}, at:r.reported_at}]));
  ["managers","courses","reports"].forEach(c => S.got.add(c));
}
const errMsg = e => {
  const m = (e && (e.message || e.error_description)) || "";
  if (/not_authorized|42501/.test(m) || (e && e.code === "42501")) return "אין הרשאה לפעולה הזו.";
  if (/bad_dates/.test(m)) return "התאריכים לא תקינים.";
  if (/Failed to fetch|NetworkError/i.test(m)) return "אין חיבור לרשת. נסו שוב בעוד רגע.";
  return "הפעולה נכשלה. נסו שוב בעוד רגע.";
};

let refreshing = null, refreshAgain = false, refreshT;
async function refresh(){
  if (refreshing) { refreshAgain = true; return refreshing; }
  refreshing = (async () => {
    const { data, error } = await sb.rpc("board_data", { p_token: TOKEN || null, p_from: FROM, p_to: TODAY });
    if (error) {
      const denied = /not_authorized/.test(error.message || "") || error.code === "42501";
      if (denied) { S.role = "none"; S.err = TOKEN && !session ? "badtoken" : ""; ["managers","courses","reports"].forEach(c => S.got.add(c)); }
      else toast(errMsg(error));
    } else { S.err = ""; applyBoard(data); }
    render();
  })();
  try { await refreshing; } finally { refreshing = null; if (refreshAgain) { refreshAgain = false; refresh(); } }
}
const scheduleRefresh = () => { clearTimeout(refreshT); refreshT = setTimeout(refresh, 350); };

async function boot(){
  const C = window.APP_CONFIG || {};
  if (!C.SUPABASE_URL || !C.SUPABASE_ANON_KEY || !window.supabase) { startLocal(); return; }
  S.mode = "live";
  sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY, { auth: { persistSession: true, detectSessionInUrl: true, flowType: "pkce" } });
  session = (await sb.auth.getSession()).data.session;
  if (session) { try { await sb.rpc("claim_first_admin"); } catch(e) {} }
  sb.auth.onAuthStateChange(async (ev, s) => {
    const was = !!session; session = s;
    if (ev === "SIGNED_IN" && !was) { try { await sb.rpc("claim_first_admin"); } catch(e) {} refresh(); }
    if (ev === "SIGNED_OUT") refresh();
  });
  sb.channel("pulse").on("postgres_changes", { event:"*", schema:"public", table:"pulse" }, scheduleRefresh).subscribe();
  setInterval(() => { if (document.visibilityState === "visible") refresh(); }, 30000);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") refresh(); });
  API = {
    async submitReport(mid, staffIn, staffOut, counts){ const { error } = await sb.rpc("submit_report", { p_token: TOKEN || null, p_unit: mid, p_staff_in: staffIn, p_staff_out: staffOut, p_counts: counts, p_date: null }); if (error) throw error; await refresh(); },
    async addCourse(mid, x){ const { data, error } = await sb.rpc("add_course", { p_token: TOKEN || null, p_unit: mid, p_name: x.name, p_start: x.start, p_end: x.end, p_org: x.org||0, p_ext: x.ext||0 }); if (error) throw error; await refresh(); return data; },
    async saveUnit(id, f){ const row = { name:f.track, manager_name:f.name, phone:f.phone||"", site:f.site||DEFAULT_SITE };
      if (f.newToken) row.token = randToken();
      const q = id ? sb.from("units").update(row).eq("id", id) : sb.from("units").insert({ ...row, sort_order: S.managers.size + 1 });
      const { error } = await q; if (error) throw error; await refresh(); },
    async removeUnit(id){ const { error } = await sb.from("units").update({ active:false }).eq("id", id); if (error) throw error; await refresh(); }
  };
  refresh();
}
function startLocal(){
  S.mode = "local"; S.role = "admin";
  let saved = null;
  try { saved = JSON.parse(lsGet("division-demo-v2") || "null"); } catch(e) {}
  const base = saved || genDemo(TODAY);
  for (const c of ["managers","courses","reports"]) { S[c] = new Map(Object.entries(base[c] || {})); S.got.add(c); }
  const persist = () => lsSet("division-demo-v2", JSON.stringify({managers:Object.fromEntries(S.managers),courses:Object.fromEntries(S.courses),reports:Object.fromEntries(S.reports)}));
  const done = () => { persist(); render(true); };
  API = {
    async submitReport(mid, staffIn, staffOut, counts){ const id = TODAY+"_"+mid, prev = S.reports.get(id); S.reports.set(id, {date:TODAY, mid, staffIn, staffOut, noCourse:!Object.keys(counts).length, counts, at: prev ? prev.at : new Date().toISOString()}); done(); },
    async addCourse(mid, x){ const id = "c-"+rid(6); S.courses.set(id, {name:x.name, mid, start:x.start, end:x.end, org:x.org||0, ext:x.ext||0, cancelled:false}); done(); return id; },
    async saveUnit(id, f){ const old = id ? S.managers.get(id) : {token:rid(6), active:true}; S.managers.set(id || "m-"+rid(6), {...old, name:f.name, track:f.track, phone:f.phone||"", site:f.site||DEFAULT_SITE, ...(f.newToken?{token:rid(6)}:{})}); done(); },
    async removeUnit(id){ const m = S.managers.get(id); if (m) S.managers.set(id, {...m, active:false}); done(); }
  };
  render(true);
}
const ready = () => S.got.size === 3;
const canAdmin = () => S.mode === "local" || S.role === "admin";
const canReport = mid => canAdmin() || (S.role === "unit" && S.me === mid);

/* ---------- computations ---------- */
function activeManagers(site){ return [...S.managers.entries()].filter(([,m]) => m.active !== false && (!site || site === "all" || siteOf(m) === site)).map(([id,m]) => ({id, ...m, site: siteOf(m)})); }
function allSites(){ const s = new Set(); for (const m of S.managers.values()) if (m.active !== false) s.add(siteOf(m)); return [...(s.has(DEFAULT_SITE)?[DEFAULT_SITE]:[]), ...[...s].filter(x=>x!==DEFAULT_SITE).sort((a,b)=>a.localeCompare(b,"he"))]; }
function reportsOn(D){ const by = {}; for (const r of S.reports.values()) if (r.date === D) by[r.mid] = r; return by; }
function dayStats(D, site){
  const mgrs = activeManagers(site), reps = reportsOn(D), mids = new Set(mgrs.map(m=>m.id));
  let staffIn = 0, staffOut = 0, org = 0, ext = 0;
  const units = mgrs.map(m => ({m, rep: reps[m.id], staffIn:0, staffOut:0, org:0, ext:0, planned:0}));
  const byMid = Object.fromEntries(units.map(u => [u.m.id, u]));
  for (const u of units) if (u.rep) { u.staffIn = u.rep.staffIn||0; u.staffOut = u.rep.staffOut||0; staffIn += u.staffIn; staffOut += u.staffOut; }
  const courses = [...S.courses.entries()].filter(([,c]) => !c.cancelled && c.start <= D && c.end >= D && mids.has(c.mid)).map(([id,c]) => {
    const rep = reps[c.mid]; const cnt = rep && rep.counts && rep.counts[id];
    const o = cnt ? cnt.org||0 : c.org||0, e = cnt ? cnt.ext||0 : c.ext||0;
    org += o; ext += e;
    const u = byMid[c.mid]; if (u) { if (cnt) { u.org += o; u.ext += e; } else u.planned += o + e; }
    const all = workdaysBetween(c.start, c.end);
    const m = S.managers.get(c.mid) || {};
    return {id, ...c, o, e, confirmed: !!cnt, dayN: all.indexOf(D) + 1, dayT: all.length, track: m.track || "—", site: siteOf(m)};
  });
  const reported = units.filter(u => u.rep).length;
  return {D, units, staffIn, staffOut, org, ext, trainees: org+ext, onSite: staffIn + org + ext, courses, reported, total: units.length};
}
function repStatus(rep, D){
  if (rep) { const t = timeOf(rep.at); return t && t > DEADLINE ? {cls:"warn", txt:"דווח באיחור", time:t, late:true} : {cls:"good", txt:"דווח", time:t}; }
  if (!isWork(D)) return {cls:"muted", txt:"יום ללא פעילות"};
  if (D > TODAY) return {cls:"muted", txt:"עתידי"};
  if (D === TODAY && nowHM() < DEADLINE) return {cls:"muted", txt:"ממתין", wait:true};
  return {cls:"crit", txt:"חסר דיווח"};
}
const deltaTxt = (a,b) => { const d = a - b; if (!d) return "ללא שינוי מיום העבודה הקודם"; return `${d>0?"+":"−"}${fmt(Math.abs(d))} מיום העבודה הקודם`; };

/* ---------- UI state ---------- */
const UI = { tab:"overview", date: TODAY, site:"all", range: 20, mgrForm:null, editId:null, confirmDel:null, menu:null };
let pendingRender = false;
function render(force){
  const ae = document.activeElement;
  if (!force && ae && ae.closest && ae.closest("#app") && ae.matches("input,select,textarea") && ae.id !== "datepick") { pendingRender = true; return; }
  pendingRender = false;
  const h = location.hash.slice(1);
  const app = document.getElementById("app");
  if (ready() && S.role === "none") app.innerHTML = renderLogin();
  else if (h === "report" || h.startsWith("report-")) app.innerHTML = renderReporter(h === "report" ? "" : h.slice(7));
  else app.innerHTML = renderDash();
  afterRender();
}
document.addEventListener("focusout", () => setTimeout(() => { if (pendingRender) render(); }, 0));
window.addEventListener("hashchange", () => { R.draft = null; R.step = 0; R.adding = null; window.scrollTo(0,0); render(true); });
setInterval(() => { if (!location.hash.startsWith("#report")) render(); }, 60000);

/* ---------- dashboard ---------- */
function renderDash(){
  if (!ready()) return `<div class="loading"><div class="bar"></div><div>מתחבר לנתונים…</div></div>`;
  const sites = allSites();
  if (UI.site !== "all" && !sites.includes(UI.site)) UI.site = "all";
  const st = dayStats(UI.date, UI.site);
  const todaySt = dayStats(TODAY, "all");
  const missToday = todaySt.units.filter(u => !u.rep).length;
  const showDot = isWork(TODAY) && missToday > 0 && nowHM() >= DEADLINE;
  const examples = S.mode === "local";
  return `
  <header class="mast"><div class="wrap">
    <div class="mast-row">
      <div class="mark">${EMBLEM}<div><div class="t1">${esc(CFG.ORG_TITLE||"כבאות והצלה")}</div><div class="t2">${esc(CFG.BOARD_TITLE||"אגף הדרכה · לוח התייצבות")}</div></div></div>
      <div class="mast-tools">
        <span class="live ${S.mode==="live"?"":"local"}"><i></i>${S.mode==="live"?`מתעדכן בזמן אמת · ${nowHM()}`:"הדגמה מקומית"}</span>
        <div class="datectl">
          <button data-act="day" data-n="-1" aria-label="יום עבודה קודם">›</button>
          <label for="datepick">${UI.date===TODAY?"היום, ":""}${heMid(UI.date)}<input type="date" id="datepick" value="${UI.date}" min="${FROM}" max="${TODAY}" aria-label="בחירת תאריך"></label>
          <button data-act="day" data-n="1" aria-label="יום עבודה הבא" ${UI.date>=TODAY?"disabled":""}>‹</button>
        </div>
        ${UI.date!==TODAY?`<button class="today-link" data-act="today">חזרה להיום</button>`:""}
        ${S.mode==="live"&&S.role==="admin"?`<button class="today-link" style="color:var(--muted)" data-act="logout">יציאה</button>`:""}
        ${S.role==="unit"&&S.managers.get(S.me)?`<span class="chip" aria-pressed="false">${esc(S.managers.get(S.me).track)}</span>`:""}
      </div>
    </div>
    <div class="nav-row">
      <nav class="tabs" role="tablist">
        <button class="tab" role="tab" aria-selected="${UI.tab==="overview"}" data-act="tab" data-t="overview"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>תמונת מצב</button>
        <button class="tab" role="tab" aria-selected="${UI.tab==="status"}" data-act="tab" data-t="status"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true"><path d="M6 4h8M6 8h8M6 12h8"/><circle cx="2.8" cy="4" r="1"/><circle cx="2.8" cy="8" r="1"/><circle cx="2.8" cy="12" r="1"/></svg>דיווחי מגמות${showDot?`<span class="dot" aria-label="חסרים דיווחים"></span>`:""}</button>
        <button class="tab" role="tab" aria-selected="${UI.tab==="history"}" data-act="tab" data-t="history"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 13H2V3"/><path d="M14 5l-4 4-2.5-2.5L4 10"/></svg>מגמות לאורך זמן</button>
      </nav>
      ${sites.length>1?`<div class="sites" role="group" aria-label="סינון לפי אתר"><button class="chip" data-act="site" data-s="all" aria-pressed="${UI.site==="all"}">כל האגף</button>${sites.map(s=>`<button class="chip" data-act="site" data-s="${esc(s)}" aria-pressed="${UI.site===s}">${esc(s)}</button>`).join("")}</div>`:""}
    </div>
  </div></header>
  <main class="wrap">
    ${examples?`<div class="note"><span class="tag">מצב הדגמה</span>נתונים בדויים שנשמרים רק בדפדפן הזה. כדי לחבר מסד נתונים אמיתי, מלאו את config.js (ראו README).</div>`:""}
    ${!isWork(UI.date)?`<div class="note"><b>יום ${DAYS.at(dow(UI.date))}.</b> אין דיווחים בימי שישי ושבת.</div>`:""}
    ${UI.tab==="overview"?renderOverview(st):UI.tab==="status"?renderStatus(st):renderHistory()}
  </main>`;
}

const EMBLEM_BIG = `<svg viewBox="0 0 34 34"><circle cx="17" cy="17" r="15.5" fill="none" stroke="currentColor" stroke-width=".5"/><path d="M17 8.5c1.6 3.1 5 4.9 5 9.2a5 5 0 0 1-10 0c0-2 1.1-3.4 2.2-4.4.2 1.5 1 2.4 2.1 2.9-.4-2.6-.2-5.4.7-7.7z" fill="none" stroke="currentColor" stroke-width=".5" stroke-linejoin="round"/><path d="M11 25.5h12" stroke="currentColor" stroke-width=".5" stroke-linecap="round"/></svg>`;

function renderOverview(st){
  const missing = st.units.filter(u => !u.rep);
  const after = UI.date < TODAY || nowHM() >= DEADLINE;
  const scope = UI.site === "all" ? "באתרי ההדרכה" : `ב${UI.site}`;
  const fig = (k, v) => `<div class="fire-fig"><b>${fmt(v)}</b><span>${k}</span></div>`;
  const hero = `<section class="fire">
    <div class="fire-mark" aria-hidden="true">${EMBLEM_BIG}</div>
    <div class="fire-top"><span>${UI.date===TODAY?`היום · ${nowHM()}`:heLong(UI.date)}</span>${st.total?`<button class="fire-rep ${missing.length&&after?"alarm":""}" data-act="tab" data-t="status"><i></i>${st.reported}/${st.total} מגמות דיווחו</button>`:""}</div>
    <div class="fire-num">${fmt(st.onSite)}</div>
    <div class="fire-unit">אנשים ${scope}</div>
    <div class="fire-row">${fig("סגל",st.staffIn)}${fig("חניכי הארגון",st.org)}${fig("מחוץ לארגון",st.ext)}${fig("השתלמויות",st.courses.length)}</div>
  </section>`;

  const miss = !isWork(UI.date) ? "" : missing.length ? `<section class="quiet-row"><span class="ql">${after?"חסר דיווח":"ממתינים לדיווח"}</span><div class="units">${missing.map(u=>`<span class="unit ${after?"miss":"wait"}"><i></i>${esc(u.m.track)}${allSites().length>1?`<time>${esc(u.m.site)}</time>`:""}</span>`).join("")}</div></section>` : (st.total ? `<section class="quiet-row"><span class="status good"><i></i>כל המגמות דיווחו</span></section>` : "");

  const bySite = {}; st.units.forEach(u => (bySite[u.m.site] ||= []).push(u));
  let places;
  if (UI.site === "all" && Object.keys(bySite).length > 1) {
    places = Object.entries(bySite).map(([s,us]) => {
      const n = us.reduce((a,u)=>a+u.staffIn+u.org+u.ext,0), r = us.filter(u=>u.rep).length;
      return `<button class="place" data-act="site" data-s="${esc(s)}"><span class="pn">${esc(s)}</span><b>${fmt(n)}</b><span class="ps ${r<us.length&&after?"alarm":""}">${r}/${us.length} דיווחו</span></button>`;
    }).join("");
  } else {
    const order = u => u.rep ? 2 : (repStatus(null, UI.date).cls === "crit" ? 0 : 1);
    places = st.units.slice().sort((a,b) => order(a) - order(b) || a.m.track.localeCompare(b.m.track, "he")).map(u => unitCard(u, UI.date, false, false)).join("");
  }
  const placesSec = `<section class="sec"><div class="sec-h"><h2>סטטוס דיווחי מגמות</h2></div><div class="${UI.site==="all" && Object.keys(bySite).length > 1 ? "places" : "ugrid"}">${places || `<div class="empty">אין נתונים.</div>`}</div></section>`;

  const courses = st.courses.slice().sort((a,b)=>(b.o+b.e)-(a.o+a.e)).map(c => `<div class="crow"><div class="cn"><span>${esc(c.name)}</span><small>${allSites().length>1?esc(c.site):esc(c.track)}</small></div><span class="cd">${c.dayT>1?`יום ${c.dayN}/${c.dayT}`:"יום אחד"}</span><b>${fmt(c.o+c.e)}</b></div>`).join("");
  const coursesSec = `<section class="sec"><div class="sec-h"><h2>השתלמויות היום</h2></div><div class="card clist">${courses || `<div class="empty">אין השתלמויות פעילות.</div>`}</div></section>`;

  return hero + miss + placesSec + coursesSec;
}

const ICONS = {
  flame:'<path d="M12 3c1.8 3.4 5.5 5.3 5.5 10a5.5 5.5 0 0 1-11 0c0-2.2 1.2-3.8 2.4-4.8.2 1.6 1.1 2.7 2.3 3.2-.4-2.9-.2-6 .8-8.4z"/><path d="M10.2 17.2a2 2 0 0 0 3.6 0"/>',
  hazmat:'<path d="M12 2.8 21.2 12 12 21.2 2.8 12z"/><path d="M12 8.2v4.6"/><path d="M12 15.8h.01"/>',
  investigate:'<circle cx="10.5" cy="10.5" r="6.2"/><path d="m15.2 15.2 5.3 5.3"/><path d="M10.5 7.4c.9 1.5 2.4 2.3 2.4 4.2a2.4 2.4 0 0 1-4.8 0c0-.9.5-1.5 1-2"/>',
  command:'<path d="M5.5 21V3.5"/><path d="M5.5 4h12l-2.8 4 2.8 4h-12"/>',
  forest:'<path d="M12 2.8 6.4 10.6h2.8L5 16.8h14l-4.2-6.2h2.8z"/><path d="M12 16.8V21"/>',
  external:'<path d="M3 21V10.5l5 3v-3l5 3V6.5h3.5L18 21"/><path d="M2.5 21h19"/><path d="M7 17.5h2M12 17.5h2"/>',
  hq:'<path d="M3.5 21V9.5L12 4l8.5 5.5V21"/><path d="M9.5 21v-5.5h5V21"/><path d="M2.5 21h19"/><path d="M12 11h.01"/>',
  people:'<circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.2A4.5 4.5 0 0 1 21 18.5"/>'
};
function iconKey(t){ t = t || ""; if (/חומ/.test(t)) return "hazmat"; if (/חקיר|הגנה מאש/.test(t)) return "investigate"; if (/יער|שטחים/.test(t)) return "forest"; if (/כיבוי|חילוץ/.test(t)) return "flame"; if (/פו.?מ|פיקוד/.test(t)) return "command"; if (/חוץ/.test(t)) return "external"; if (/מטה/.test(t)) return "hq"; return "people"; }
const uIcon = t => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[iconKey(t)]}</svg>`;
const mi = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const MI = {
  link: mi('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
  chat: mi('<path d="M4 20l1.4-4A8 8 0 1 1 8 18.6z"/>'),
  open: mi('<rect x="6" y="3" width="12" height="18" rx="2.5"/><path d="M10.5 18h3"/>'),
  edit: mi('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>'),
  trash: mi('<path d="M4 7h16"/><path d="M9 7V4.5h6V7"/><path d="M6.5 7l1 13h9l1-13"/>'),
  dots: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5.5" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="18.5" r="1.6" fill="currentColor"/></svg>',
  plus: mi('<path d="M12 5v14M5 12h14"/>'),
  send: mi('<path d="M20.5 3.5 3.5 10.6l6.8 2.6 2.6 6.8z"/><path d="m10.3 13.2 4.2-4.2"/>'),
  bell: mi('<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>')
};

function mgrFormHTML(f, isEdit){
  const multi = allSites().length > 1;
  return `<div style="display:grid;gap:14px">
    <div class="formgrid">
      <div class="field"><label for="f-track">מגמה / יחידה</label><input id="f-track" data-bind="track" list="tracklist" value="${esc(f.track)}" placeholder="לדוגמה: מגמת פו״מ"></div>
      <div class="field"><label for="f-name">שם המנהל</label><input id="f-name" data-bind="name" value="${esc(f.name)}" placeholder="שם מלא"></div>
      <div class="field"><label for="f-phone">טלפון נייד</label><input id="f-phone" data-bind="phone" inputmode="tel" dir="ltr" style="text-align:right" value="${esc(f.phone)}" placeholder="050-0000000"></div>
      ${multi?`<div class="field"><label for="f-site">אתר</label><input id="f-site" data-bind="site" list="sitelist" value="${esc(f.site)}" placeholder="${esc(DEFAULT_SITE)}"></div>`:""}
    </div>
    <datalist id="sitelist">${allSites().map(t=>`<option value="${esc(t)}">`).join("")}</datalist>
    <datalist id="tracklist">${[...new Set([...S.managers.values()].map(m=>m.track))].map(t=>`<option value="${esc(t)}">`).join("")}</datalist>
    <div class="toolbar">
      <button class="btn primary" data-act="mgr-save">${isEdit?"שמירת שינויים":"הוספה ויצירת קישור"}</button>
      ${isEdit?`<button class="btn" data-act="mgr-newtoken">${f.newToken?"ייווצר קישור חדש בשמירה":"קישור חדש (הישן יבוטל)"}</button>`:""}
      <button class="btn link" data-act="mgr-cancel">ביטול</button>
    </div></div>`;
}

function unitCard(u, D, admin, withMenu = true){
  const m = u.m, rep = u.rep, s = repStatus(rep, D);
  if (withMenu && UI.editId === m.id) return `<article class="ucard editing"><div class="uc-top"><span class="uicon">${uIcon(m.track)}</span><h3 style="margin:0">עריכת ${esc(m.track)}</h3></div>${mgrFormHTML(UI.mgrForm, true)}</article>`;
  const n = rep ? u.staffIn + u.org + u.ext : null;
  const state = rep ? (s.late ? "late" : "ok") : (s.wait ? "wait" : (s.cls === "crit" ? "miss" : "idle"));
  const open = withMenu && UI.menu === m.id;
  const chip = rep ? s.time : (s.cls === "crit" ? "חסר" : s.txt);
  return `<article class="ucard ${state} ${S.role==="unit"&&S.me===m.id?"mine":""}">
    <div class="uc-top">
      <span class="uicon">${uIcon(m.track)}</span>
      <span class="ustate ${s.cls}" title="${rep?(s.late?"דווח באיחור":"דווח"):s.txt}"><i></i>${chip}</span>
      ${withMenu && admin?`<button class="kebab" data-act="menu" data-id="${m.id}" aria-label="פעולות: ${esc(m.track)}" aria-expanded="${open}">${MI.dots}</button>`:""}
    </div>
    <h3>${esc(m.track)}</h3>
    <div class="umgr">${esc(m.name||"טרם הוגדר מנהל")}${allSites().length>1?` · ${esc(siteOf(m))}`:""}</div>
    <div class="ubottom">
      <div class="unrow"><b class="unum">${n===null?"—":fmt(n)}</b>${withMenu && D===TODAY && canReport(m.id)?`<a class="rbtn ${rep?"":"due"}" href="#report-${esc(m.id)}">${rep?MI.edit+"עדכון":MI.send+"דיווח"}</a>`:""}</div>
      <span class="usub">${rep?`סגל ${fmt(u.staffIn)} · חניכים ${fmt(u.org+u.ext)}`:(s.cls==="crit"?"לא התקבל דיווח":"טרם דווח")}</span>
    </div>
    ${open?`<div class="umenu" role="menu">
      <button role="menuitem" data-act="copy" data-token="${esc(m.token)}">${MI.link}העתקת קישור אישי</button>
      <a role="menuitem" href="${esc(waLink(m))}" target="_blank" rel="noopener">${MI.chat}${rep?"שליחה בוואטסאפ":"תזכורת בוואטסאפ"}</a>
      ${admin?`<div class="sep"></div><button role="menuitem" data-act="mgr-edit" data-id="${m.id}">${MI.edit}עריכה</button><button role="menuitem" class="danger" data-act="mgr-del" data-id="${m.id}">${MI.trash}הסרה</button>`:""}
    </div>`:""}
    ${withMenu && UI.confirmDel===m.id?`<div class="uconfirm"><div>להסיר את <b>${esc(m.track)}</b>?</div><div style="font-size:12px;color:var(--muted)">הדיווחים הקודמים יישמרו.</div><div class="toolbar" style="justify-content:center"><button class="btn sm danger-solid" data-act="mgr-del-yes" data-id="${m.id}">הסרה</button><button class="btn sm" data-act="mgr-del-no">ביטול</button></div></div>`:""}
  </article>`;
}

function renderStatus(st){
  const admin = canAdmin();
  const order = u => u.rep ? 2 : (repStatus(null, UI.date).cls === "crit" ? 0 : 1);
  const units = st.units.slice().sort((a,b) => order(a) - order(b) || a.m.track.localeCompare(b.m.track, "he"));
  const missing = st.total - st.reported;
  const after = UI.date < TODAY || nowHM() >= DEADLINE;
  const cards = units.map(u => unitCard(u, UI.date, admin)).join("");
  return `
  <section class="st-head">
    <div><div class="eyebrow">${heLong(UI.date)}</div>
      <div class="st-big">${st.reported}<span>/${st.total}</span></div>
      <div class="st-sub ${missing&&after&&isWork(UI.date)?"alarm":""}">${!isWork(UI.date)?"אין חובת דיווח בסוף השבוע":missing?(after?`חסרים ${missing} דיווחים`:`ממתינים ל-${missing} דיווחים · נסגר ב-${DEADLINE}`):"כל המגמות דיווחו"}</div></div>
    <div class="toolbar">
            ${admin?`<button class="btn add-btn" data-act="mgr-add">${MI.plus}הוספת מגמה ומנהל</button>`:""}
    </div>
  </section>
  ${UI.mgrForm && !UI.editId?`<section class="card addform"><div class="sec-h"><h2>מגמה חדשה</h2><span class="meta">אחרי השמירה ייווצר למנהל קישור אישי לדיווח</span></div>${mgrFormHTML(UI.mgrForm,false)}</section>`:""}
  <section class="ugrid">${cards}${admin && !UI.mgrForm?`<button class="ucard addtile" data-act="mgr-add"><span class="plus">${MI.plus}</span><span>הוספת מגמה</span></button>`:""}</section>`;
}

let HIST = null;
function renderHistory(){
  const days = []; let d = isWork(TODAY) ? TODAY : addWork(TODAY,-1);
  for (let i=0;i<UI.range;i++){ days.unshift(d); d = addWork(d,-1); }
  const data = days.map(x => dayStats(x, UI.site));
  const W = 760, H = 280, L = 40, Rr = 14, T = 16, B = 46;
  const max = Math.max(10, ...data.map(x => x.onSite));
  const step = max > 400 ? 100 : max > 200 ? 50 : max > 100 ? 25 : 10;
  const top = Math.ceil(max/step)*step;
  const X = i => days.length===1 ? (L+W-Rr)/2 : W - Rr - i*(W-Rr-L)/(days.length-1);
  const Y = v => T + (1 - v/top)*(H-T-B);
  const ticks = []; for (let v=0; v<=top; v+=step) ticks.push(v);
  const series = [
    {k:"onSite", name:"סה\"כ באתרים", col:"var(--ink)"},
    {k:"trainees", name:"חניכים", col:"var(--s-org)"},
    {k:"staffIn", name:"סגל באתרים", col:"var(--s-staff)"}
  ];
  const path = k => data.map((x,i)=>`${i?"L":"M"}${X(i).toFixed(1)} ${Y(x[k]).toFixed(1)}`).join("");
  const every = Math.ceil(days.length/8);
  const last = days.length-1;
  HIST = {days, data, X, series, W};
  const pend = x => x.D===TODAY && nowHM()<DEADLINE;
  const svg = `<svg id="histsvg" viewBox="0 0 ${W} ${H}" role="img" aria-label="נוכחות לאורך ${days.length} ימי עבודה">
    ${ticks.map(v=>`<line x1="${L}" x2="${W-Rr}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)"/><text class="axis" x="${L-8}" y="${Y(v)+4}" text-anchor="end" font-size="11" fill="var(--muted)">${v}</text>`).join("")}
    ${days.map((dd,i)=> i%every===0 || i===last ? `<text class="axis" x="${X(i)}" y="${H-B+18}" text-anchor="middle" font-size="11" fill="var(--muted)">${heShort(dd)}</text>`:"").join("")}
    <path d="${path("onSite")} L${X(last)} ${Y(0)} L${X(0)} ${Y(0)} Z" fill="var(--ink)" opacity=".05"/>
    ${series.map(s=>`<path d="${path(s.k)}" fill="none" stroke="${s.col}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`).join("")}
    ${series.map(s=>`<circle cx="${X(last)}" cy="${Y(data[last][s.k])}" r="4" fill="${s.col}" stroke="var(--surface)" stroke-width="2"/>`).join("")}
    <text x="${X(last)-10}" y="${Y(data[last].onSite)-10}" text-anchor="start" font-size="12" font-weight="600" fill="var(--ink)">${fmt(data[last].onSite)}</text>
    ${data.map((x,i)=>{ const w = Math.max(4, Math.min(14, (W-L-Rr)/days.length - 3)); const c = x.total&&x.reported===x.total?"var(--good)":pend(x)?"var(--line-2)":"var(--crit)"; return `<rect x="${X(i)-w/2}" y="${H-14}" width="${w}" height="6" rx="1.5" fill="${c}"/>`; }).join("")}
    <line id="hx" x1="0" x2="0" y1="${T}" y2="${H-B}" stroke="var(--ink-2)" stroke-width="1" opacity="0"/>
    <rect id="hhit" x="0" y="0" width="${W}" height="${H}" fill="transparent"/>
  </svg>`;
  const rows = data.slice().reverse().map(x => `<tr class="click" data-act="goday" data-d="${x.D}">
    <td><div class="t1">${heLong(x.D)}</div></td>
    <td class="n">${fmt(x.onSite)}</td><td class="n">${fmt(x.staffIn)}</td><td class="n">${fmt(x.staffOut)}</td><td class="n">${fmt(x.org)}</td><td class="n">${fmt(x.ext)}</td><td class="n">${x.courses.length}</td>
    <td><span class="status ${x.total&&x.reported===x.total?"good":pend(x)?"muted":"crit"}"><i></i>${x.reported}/${x.total}</span></td></tr>`).join("");
  const avg = Math.round(data.reduce((a,x)=>a+x.onSite,0)/data.length);
  const full = data.filter(x=>x.total&&x.reported===x.total).length;
  return `
  <section class="hero">
    <div><div class="eyebrow">${UI.site==="all"?"כל האגף":esc(UI.site)} · ${days.length} ימי עבודה אחרונים</div>
      <div class="fig"><span class="big">${fmt(avg)}</span><span class="unit">אנשים באתרים בממוצע ליום</span></div>
</div>
    <div class="toolbar" style="justify-content:flex-end"><div class="seg" role="group" aria-label="טווח">${[10,20,40].map(n=>`<button data-act="range" data-n="${n}" aria-pressed="${UI.range===n}">${n} ימים</button>`).join("")}</div></div>
  </section>
  <section class="sec"><div class="sec-h"><h2>נוכחות לאורך זמן</h2>
    <div class="legend">${series.map(s=>`<span><i style="background:${s.col}"></i>${s.name}</span>`).join("")}<span><i style="background:var(--good)"></i>דיווח מלא</span><span><i style="background:var(--crit)"></i>דיווח חסר</span></div></div>
    <div class="card chart"><div class="tscroll">${svg}</div><div class="tip" id="htip" hidden></div></div></section>
  <section class="sec"><div class="sec-h"><h2>כל הימים</h2><div class="toolbar"><span style="font-size:13px;color:var(--muted)">לחיצה על שורה פותחת את תמונת המצב של אותו יום</span><button class="btn" data-act="export">הורדה לאקסל</button></div></div>
    <div class="card"><div class="tscroll"><table><thead><tr><th>תאריך</th><th class="n">סה"כ באתרים</th><th class="n">סגל באתרים</th><th class="n">סגל בחוץ</th><th class="n">חניכי ארגון</th><th class="n">חיצוניים</th><th class="n">השתלמויות</th><th>דיווחו</th></tr></thead><tbody>${rows}</tbody></table></div></div></section>`;
}
function wireHistory(){
  const svg = document.getElementById("histsvg"), hit = document.getElementById("hhit"), tip = document.getElementById("htip"), hx = document.getElementById("hx");
  if (!svg || !hit || !HIST) return;
  const move = ev => {
    const r = svg.getBoundingClientRect(); const sx = (ev.clientX - r.left) / r.width * HIST.W;
    let best = 0, bd = 1e9; HIST.days.forEach((_,i)=>{ const dd = Math.abs(HIST.X(i)-sx); if (dd<bd){bd=dd;best=i;} });
    const x = HIST.data[best]; hx.setAttribute("x1", HIST.X(best)); hx.setAttribute("x2", HIST.X(best)); hx.setAttribute("opacity", ".45");
    tip.innerHTML = `<b>${heLong(x.D)}</b>${HIST.series.map(s=>`<div class="r"><span><i style="background:${s.col==="var(--ink)"?"var(--surface)":s.col}"></i>${s.name}</span><span>${fmt(x[s.k])}</span></div>`).join("")}<div class="r" style="opacity:.75"><span>מגמות שדיווחו</span><span>${x.reported}/${x.total}</span></div>`;
    tip.hidden = false;
    const card = svg.closest(".chart").getBoundingClientRect();
    const px = HIST.X(best)/HIST.W*r.width + r.left - card.left;
    const wTip = tip.offsetWidth;
    tip.style.left = (px + 14 + wTip > card.width - 8 ? Math.max(8, px - wTip - 14) : px + 14) + "px";
    tip.style.top = "18px";
  };
  hit.addEventListener("pointermove", move);
  hit.addEventListener("pointerleave", () => { tip.hidden = true; hx.setAttribute("opacity","0"); });
}

/* ---------- reporter ---------- */
const R = { step:0, draft:null, adding:null, sentAt:null };
function reporterManager(id){ const m = S.managers.get(id); return m && m.active !== false && canReport(id) ? {id, ...m} : null; }
const myCourses = mid => [...S.courses.entries()].filter(([,c]) => c.mid === mid && !c.cancelled && c.start <= TODAY && c.end >= TODAY).map(([id,c]) => ({id, ...c}));
function initDraft(m){
  const rep = S.reports.get(TODAY + "_" + m.id);
  const cs = myCourses(m.id);
  let prev = null; for (const r of S.reports.values()) if (r.mid === m.id && r.date < TODAY && (!prev || r.date > prev.date)) prev = r;
  const counts = {};
  for (const c of cs) { const k = rep && rep.counts && rep.counts[c.id]; counts[c.id] = k ? {org:k.org, ext:k.ext} : {org:c.org||0, ext:c.ext||0}; }
  R.draft = { mid:m.id, staffIn: rep ? rep.staffIn : (prev ? prev.staffIn : 0), staffOut: rep ? rep.staffOut : (prev ? prev.staffOut : 0),
    fromPrev: !rep && !!prev, noCourse: rep ? !!rep.noCourse && cs.length===0 : false, counts, existing: !!rep, existingAt: rep ? timeOf(rep.at) : "" };
}
function stepper(id, val, label, small){
  return `<div class="stepper ${small?"small":""}"><button type="button" data-act="inc" data-k="${id}" data-n="1" aria-label="הוספה: ${label}">+</button>
    <input id="st-${id.replace(/[^a-z0-9-]/gi,"_")}" data-step="${id}" inputmode="numeric" pattern="[0-9]*" value="${val}" aria-label="${label}">
    <button type="button" data-act="inc" data-k="${id}" data-n="-1" aria-label="הפחתה: ${label}">−</button></div>`;
}
function renderReporter(token){
  if (!ready()) return `<div class="loading"><div class="bar"></div><div>טוען…</div></div>`;
  const m = token ? reporterManager(token) : null;
  if (!m) {
    const list = activeManagers("all");
    return `<div class="rep"><div class="rep-top"><div class="rep-in row">${EMBLEM}<div class="t"><b>דיווח התייצבות</b><span>אגף הדרכה</span></div></div></div><div class="rep-body rep-in">
      <h2>${token?"אין הרשאה לדווח על המגמה הזו":"בחירת מגמה"}</h2>
      <p class="lead">${token?"אפשר לדווח רק על המגמה שלך, דרך הכרטיס שלה בלוח.":"בחרו את המגמה שעליה מדווחים."}</p>
      ${!token?`<div class="picker">${list.filter(x=>canReport(x.id)).map(x=>`<button data-act="pick" data-token="${esc(x.id)}"><span><b style="font-weight:500">${esc(x.track)}</b><br><small style="color:var(--muted)">${esc(x.name||"")}</small></span><span aria-hidden="true">‹</span></button>`).join("")}</div>`:""}
      <a class="btn" href="#">חזרה ללוח</a></div></div>`;
  }
  if (!R.draft || R.draft.mid !== m.id) { initDraft(m); R.step = 0; }
  const d = R.draft, cs = myCourses(m.id);
  const hour = Number(nowHM().slice(0,2));
  const greet = hour < 12 ? "בוקר טוב" : hour < 17 ? "צהריים טובים" : "ערב טוב";
  let body = "", foot = "";
  if (R.step === 0) {
    body = `<div class="eyebrow">${heLong(TODAY)}</div><h2>${greet}, ${esc(m.name.split(" ")[0])}</h2>
      <p class="lead">דיווח ההתייצבות של <b style="color:var(--ink);font-weight:600">${esc(m.track)}</b>, ${esc(siteOf(m))}. שלושה צעדים קצרים.</p>
      <div class="statusline">${d.existing?`<span class="status good"><i></i>דיווחת היום ב-${d.existingAt}</span><span>אפשר לעדכן עד חצות.</span>`:`<span class="status ${nowHM()<DEADLINE?"muted":"crit"}"><i></i>${nowHM()<DEADLINE?"טרם דיווחת היום":"עבר מועד הדיווח"}</span><span>הדיווח נסגר ב-${DEADLINE}.</span>`}</div>
      ${!isWork(TODAY)?`<div class="note">היום יום ${DAYS.at(dow(TODAY))}. בדרך כלל אין צורך בדיווח.</div>`:""}`;
    foot = `<button class="btn primary" data-act="rstep" data-n="1">${d.existing?"עדכון הדיווח":"התחלה"}</button>`;
  } else if (R.step === 1) {
    body = `<div class="eyebrow">שלב 1 מתוך 3</div><h2>סגל ומדריכים</h2><p class="lead">כמה אנשי סגל של המגמה נמצאים היום באתר, וכמה לא.</p>
      ${d.fromPrev?`<div class="note"><span class="tag">מולא מהדיווח הקודם</span>עדכנו אם משהו השתנה.</div>`:""}
      <div class="rcard"><div class="srow"><label for="st-staffIn">באתר היום</label>${stepper("staffIn", d.staffIn, "סגל באתר")}</div>
      <div class="srow"><label for="st-staffOut">מחוץ לאתר</label><span class="hint">עבודה מהבית, תפקיד בחוץ, חופש. בלי לפרט.</span>${stepper("staffOut", d.staffOut, "סגל מחוץ לאתר")}</div></div>`;
    foot = `<button class="btn back" data-act="rstep" data-n="-1">חזרה</button><button class="btn primary" data-act="rstep" data-n="1">המשך</button>`;
  } else if (R.step === 2) {
    const cards = cs.map(c => { const all = workdaysBetween(c.start,c.end), n = all.indexOf(TODAY)+1; const k = d.counts[c.id] || {org:0,ext:0};
      return `<div class="ccard"><div class="ch"><b>${esc(c.name)}</b><small>${all.length>1?`יום ${n} מתוך ${all.length} · ${heShort(c.start)}–${heShort(c.end)}`:"השתלמות של יום אחד"}${all.length>1&&c.start<TODAY?" · ממשיכה מאתמול":""}</small></div>
        <div class="two"><div class="srow"><label>חניכי הארגון</label>${stepper(`c:${c.id}:org`, k.org, "חניכי הארגון", true)}</div>
        <div class="srow"><label>מחוץ לארגון</label>${stepper(`c:${c.id}:ext`, k.ext, "חניכים מחוץ לארגון", true)}</div></div></div>`; }).join("");
    const a = R.adding;
    const addForm = a ? `<div class="rcard"><h3>השתלמות חדשה</h3>
      <div class="field"><label for="a-name">שם ההשתלמות</label><input id="a-name" data-abind="name" value="${esc(a.name)}" placeholder="לדוגמה: השתלמות חומ&quot;ס – שטח"></div>
      <div class="two"><div class="field"><label for="a-start">מתאריך</label><input id="a-start" type="date" data-abind="start" value="${a.start}"></div>
      <div class="field"><label for="a-end">עד תאריך</label><input id="a-end" type="date" data-abind="end" value="${a.end}" min="${a.start}"></div></div>
      <span style="font-size:12.5px;color:var(--muted);margin-top:-8px">השתלמות של כמה ימים תופיע אוטומטית בכל הימים האלה.</span>
      <div class="two"><div class="srow"><label>חניכי הארגון</label>${stepper("a:org", a.org, "חניכי הארגון", true)}</div><div class="srow"><label>מחוץ לארגון</label>${stepper("a:ext", a.ext, "חניכים מחוץ לארגון", true)}</div></div>
      <div class="toolbar"><button class="btn primary" data-act="add-save">הוספת ההשתלמות</button><button class="btn link" data-act="add-cancel">ביטול</button></div></div>` : "";
    body = `<div class="eyebrow">שלב 2 מתוך 3</div><h2>השתלמויות היום</h2><p class="lead">${cs.length?"השתלמויות פעילות מופיעות כאן מראש. עדכנו את מספר החניכים אם צריך.":"אין למגמה השתלמות פעילה היום."}</p>
      ${cards}${addForm}
      ${!a?`<button class="btn" data-act="add-open" style="height:48px;border-style:dashed;border-radius:14px">הוספת השתלמות</button>`:""}
      ${!cs.length && !a?`<label class="check"><input type="checkbox" id="nocourse" ${d.noCourse?"checked":""}> אין השתלמות היום</label>`:""}`;
    const canNext = cs.length > 0 || d.noCourse;
    foot = `<button class="btn back" data-act="rstep" data-n="-1">חזרה</button><button class="btn primary" data-act="rstep" data-n="1" ${canNext&&!a?"":"disabled"}>${!canNext&&!a?"הוסיפו השתלמות או סמנו \"אין\"":"המשך"}</button>`;
  } else if (R.step === 3) {
    const o = cs.reduce((s,c)=>s+(d.counts[c.id]?.org||0),0), e = cs.reduce((s,c)=>s+(d.counts[c.id]?.ext||0),0);
    body = `<div class="eyebrow">שלב 3 מתוך 3</div><h2>אישור ושליחה</h2><p class="lead">${esc(m.track)} · ${heLong(TODAY)}</p>
      <div class="rcard"><div class="sumgrid"><div><span>סגל באתר</span><b>${d.staffIn}</b></div><div><span>סגל מחוץ לאתר</span><b>${d.staffOut}</b></div>
      <div><span>חניכי הארגון</span><b>${o}</b></div><div><span>מחוץ לארגון</span><b>${e}</b></div></div>
      ${cs.length?`<div style="display:grid;gap:6px;font-size:14px">${cs.map(c=>`<div style="display:flex;justify-content:space-between;gap:8px"><span>${esc(c.name)}</span><span>${(d.counts[c.id]?.org||0)+(d.counts[c.id]?.ext||0)}</span></div>`).join("")}</div>`:`<div style="color:var(--muted);font-size:14px">אין השתלמות היום.</div>`}</div>`;
    foot = `<button class="btn back" data-act="rstep" data-n="-1">חזרה</button><button class="btn primary" data-act="send">${d.existing?"עדכון הדיווח":"שליחת הדיווח"}</button>`;
  } else {
    body = `<div class="done"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="cc" cx="50" cy="50" r="45" fill="none" stroke="var(--good)" stroke-width="3"/><path class="ck" d="M31 52 L44 65 L70 38" fill="none" stroke="var(--good)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <h2>הדיווח התקבל</h2><p class="lead">נשלח ב-${R.sentAt}. הוא כבר מופיע בלוח של אגף ההדרכה.</p></div>`;
    foot = `<button class="btn back" data-act="rstep" data-n="-3">עריכה</button><a class="btn primary" href="#">חזרה ללוח</a>`;
  }
  return `<div class="rep">
    <div class="rep-top"><div class="rep-in row">${EMBLEM}<div class="t"><b>דיווח התייצבות</b><span>${esc(m.track)} · ${esc(siteOf(m))}</span></div><a class="btn link" href="#">ללוח</a></div>
      ${R.step>0&&R.step<4?`<div class="rep-in"><div class="prog" aria-hidden="true">${[1,2,3].map(i=>`<span class="${i<=R.step?"on":""}"></span>`).join("")}</div></div>`:""}</div>
    <div class="rep-body rep-in">${body}</div>
    <div class="rep-foot"><div class="rep-in">${foot}</div></div></div>`;
}

/* ---------- events ---------- */
function afterRender(){
  const dp = document.getElementById("datepick");
  if (dp) dp.onchange = () => { if (dp.value) { UI.date = dp.value > TODAY ? TODAY : dp.value < FROM ? FROM : dp.value; render(true); } };
  if (UI.tab === "history" && !location.hash.startsWith("#report")) wireHistory();
}
document.addEventListener("input", e => {
  const t = e.target;
  if (t.dataset.bind && UI.mgrForm) UI.mgrForm[t.dataset.bind] = t.value;
  if (t.dataset.abind && R.adding) { R.adding[t.dataset.abind] = t.value; if (t.dataset.abind === "start" && R.adding.end < t.value) { R.adding.end = t.value; render(true); } }
  if (t.dataset.step) setVal(t.dataset.step, clampInt(t.value), false);
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && (UI.menu || UI.confirmDel)) { UI.menu = null; UI.confirmDel = null; render(true); } });
document.addEventListener("change", e => { if (e.target.id === "nocourse" && R.draft) { R.draft.noCourse = e.target.checked; render(true); } });
function getVal(k){
  const d = R.draft;
  if (k === "staffIn" || k === "staffOut") return d[k];
  if (k.startsWith("c:")) { const [,id,f] = k.split(":"); return (d.counts[id]||{})[f] || 0; }
  if (k.startsWith("a:")) return R.adding[k.slice(2)] || 0;
  return 0;
}
function setVal(k, v, rerender){
  const d = R.draft; if (!d) return;
  if (k === "staffIn" || k === "staffOut") d[k] = v;
  else if (k.startsWith("c:")) { const [,id,f] = k.split(":"); d.counts[id] = {...(d.counts[id]||{org:0,ext:0}), [f]: v}; }
  else if (k.startsWith("a:") && R.adding) R.adding[k.slice(2)] = v;
  if (rerender) { const inp = document.querySelector(`[data-step="${CSS.escape(k)}"]`); if (inp) inp.value = v; }
}
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-act]");
  if (!b) { if (UI.menu && !e.target.closest(".umenu")) { UI.menu = null; render(true); } return; }
  const a = b.dataset.act;
  if (a === "menu") { UI.menu = UI.menu === b.dataset.id ? null : b.dataset.id; UI.confirmDel = null; render(true); return; }
  if (UI.menu) UI.menu = null;
  if (a === "tab") { UI.tab = b.dataset.t; UI.mgrForm = null; UI.editId = null; UI.confirmDel = null; render(true); window.scrollTo({top:0}); }
  else if (a === "site") { UI.site = b.dataset.s; render(true); }
  else if (a === "day") { let d = addWork(UI.date, +b.dataset.n); if (d > TODAY) d = TODAY; if (d < FROM) d = FROM; UI.date = d; render(true); }
  else if (a === "today") { UI.date = TODAY; render(true); }
  else if (a === "goday") { UI.date = b.dataset.d; UI.tab = "overview"; render(true); window.scrollTo({top:0}); }
  else if (a === "range") { UI.range = +b.dataset.n; render(true); }
  else if (a === "copy") copyText(linkFor(b.dataset.token));
  else if (a === "export") {
    const q = v => `"${String(v).replace(/"/g,'""')}"`;
    const rows = [["תאריך","סה\"כ באתרים","סגל באתרים","סגל בחוץ","חניכי ארגון","חניכים מחוץ לארגון","השתלמויות","מגמות שדיווחו","סה\"כ מגמות"]];
    (HIST ? HIST.data.slice().reverse() : []).forEach(x => rows.push([x.D,x.onSite,x.staffIn,x.staffOut,x.org,x.ext,x.courses.length,x.reported,x.total]));
    const blob = new Blob(["\ufeff" + rows.map(r => r.map(q).join(",")).join("\r\n")], {type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob), link = document.createElement("a");
    link.href = url; link.download = `התייצבות-${TODAY}.csv`; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  else if (a === "mgr-add") { UI.mgrForm = {name:"", site: UI.site !== "all" ? UI.site : "", track:"", phone:""}; UI.editId = null; render(true); document.getElementById("f-track")?.focus(); document.querySelector(".addform")?.scrollIntoView({block:"nearest"}); }
  else if (a === "mgr-edit") { const m = S.managers.get(b.dataset.id); UI.editId = b.dataset.id; UI.mgrForm = {name:m.name, site:siteOf(m), track:m.track, phone:m.phone||"", newToken:false}; render(true); }
  else if (a === "mgr-cancel") { UI.mgrForm = null; UI.editId = null; render(true); }
  else if (a === "mgr-newtoken") { UI.mgrForm.newToken = true; render(true); }
  else if (a === "mgr-save") {
    const f = UI.mgrForm; const name = (f.name||"").trim(), track = (f.track||"").trim(), site = (f.site||"").trim() || DEFAULT_SITE;
    if (!track) { toast("צריך למלא את שם המגמה."); return; }
    b.disabled = true;
    try {
      await API.saveUnit(UI.editId, {name, track, site, phone:(f.phone||"").trim(), newToken: !!f.newToken});
      toast(UI.editId ? (f.newToken ? "נשמר. הקישור הישן בוטל." : "השינויים נשמרו.") : `${track} נוספה. אפשר לשלוח למנהל את הקישור מתפריט ⋮.`);
      UI.mgrForm = null; UI.editId = null;
    } catch(e) { toast(errMsg(e)); }
    b.disabled = false; render(true);
  }
  else if (a === "mgr-del") { UI.confirmDel = b.dataset.id; render(true); }
  else if (a === "mgr-del-no") { UI.confirmDel = null; render(true); }
  else if (a === "mgr-del-yes") { const id = b.dataset.id; UI.confirmDel = null; try { await API.removeUnit(id); toast("המגמה הוסרה. הדיווחים הקודמים נשמרו."); } catch(e) { toast(errMsg(e)); } render(true); }
  else if (a === "pick") { location.hash = "report-" + b.dataset.token; }
  else if (a === "logout") { await sb.auth.signOut(); lsSet("unit-token", null); TOKEN = ""; location.href = location.pathname; }
  else if (a === "login") { await doLogin(b); }
  else if (a === "login-pass") { await doPassLogin(b); }
  else if (a === "forget-token") { lsSet("unit-token", null); TOKEN = ""; history.replaceState(null, "", location.pathname); S.err = ""; render(true); }
  else if (a === "inc") { const k = b.dataset.k; setVal(k, Math.max(0, getVal(k) + (+b.dataset.n)), true); }
  else if (a === "rstep") { R.step = Math.max(0, Math.min(3, R.step + (+b.dataset.n))); render(true); window.scrollTo({top:0}); }
  else if (a === "add-open") { R.adding = {name:"", start:TODAY, end:TODAY, org:0, ext:0}; render(true); document.getElementById("a-name")?.focus(); }
  else if (a === "add-cancel") { R.adding = null; render(true); }
  else if (a === "add-save") {
    const x = R.adding, name = (x.name||"").trim();
    if (!name) { toast("צריך לתת שם להשתלמות."); return; }
    if (!x.start || !x.end || x.end < x.start) { toast("תאריך הסיום צריך להיות אחרי תאריך ההתחלה."); return; }
    b.disabled = true;
    try {
      const id = await API.addCourse(R.draft.mid, {name, start:x.start, end:x.end, org:x.org||0, ext:x.ext||0});
      if (id && x.start <= TODAY && x.end >= TODAY) R.draft.counts[id] = {org:x.org||0, ext:x.ext||0};
      R.draft.noCourse = false; R.adding = null; toast(x.end > x.start ? "ההשתלמות נוספה לכל התאריכים שלה." : "ההשתלמות נוספה.");
    } catch(e) { toast(errMsg(e)); b.disabled = false; }
    render(true);
  }
  else if (a === "send") {
    const d = R.draft; const cs = myCourses(d.mid);
    const counts = {}; cs.forEach(c => counts[c.id] = {org: d.counts[c.id]?.org||0, ext: d.counts[c.id]?.ext||0});
    const prev = S.reports.get(TODAY + "_" + d.mid);
    b.disabled = true; b.textContent = "שולח…";
    try {
      await API.submitReport(d.mid, d.staffIn, d.staffOut, counts);
      R.sentAt = nowHM(); d.existing = true; d.existingAt = prev ? timeOf(prev.at) : R.sentAt; R.step = 4;
    } catch(e) { toast(errMsg(e)); }
    render(true); window.scrollTo({top:0});
  }
});

/* ---------- login ---------- */
function renderLogin(){
  const bad = S.err === "badtoken";
  return `<div class="login"><div class="login-card">
    <div class="login-mark">${EMBLEM}</div>
    <div class="eyebrow">${esc(CFG.ORG_TITLE||"כבאות והצלה")}</div>
    <h1>${esc(CFG.BOARD_TITLE||"אגף הדרכה · לוח התייצבות")}</h1>
    ${bad?`<div class="note" style="color:var(--crit)">הקישור האישי הזה אינו פעיל. ייתכן שנוצר קישור חדש. בקשו קישור עדכני מאגף ההדרכה.</div><button class="btn" data-act="forget-token">ניקוי הקישור הישן</button>`
      :`<p class="lead">מנהלי מגמות נכנסים דרך הקישור האישי שקיבלו.</p>`}
    <form class="login-form" onsubmit="return false">
      <label for="login-email">כניסת מנהל מערכת</label>
      <input id="login-email" type="email" dir="ltr" autocomplete="username" placeholder="name@example.com">
      <input id="login-pass" type="password" dir="ltr" autocomplete="current-password" placeholder="סיסמה">
      <button class="btn primary" data-act="login-pass">כניסה</button>
      <button class="btn link" data-act="login">אין לי סיסמה: שליחת קישור כניסה למייל</button>
    </form>
  </div></div>`;
}
async function doLogin(b){
  const el = document.getElementById("login-email"); const email = (el && el.value || "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { toast("כתובת המייל לא תקינה."); return; }
  b.disabled = true;
  const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname } });
  b.disabled = false;
  if (!error) { toast("נשלח קישור כניסה למייל. פתחו אותו במכשיר הזה."); return; }
  const m = (error.message || "") + " " + (error.status || "");
  toast(/rate|429|seconds/i.test(m) ? "נשלחו יותר מדי מיילים בזמן קצר. היכנסו עם סיסמה, או נסו שוב בעוד שעה." : "השליחה נכשלה: " + (error.message || "שגיאה לא ידועה"));
}
async function doPassLogin(b){
  const email = (document.getElementById("login-email")?.value || "").trim(), pass = document.getElementById("login-pass")?.value || "";
  if (!email || !pass) { toast("צריך למלא מייל וסיסמה."); return; }
  b.disabled = true;
  const { error } = await sb.auth.signInWithPassword({ email, password: pass });
  b.disabled = false;
  if (error) toast(/invalid/i.test(error.message || "") ? "המייל או הסיסמה שגויים." : "הכניסה נכשלה: " + error.message);
}
if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => {});
if (S.role === "unit" || TOKEN) UI.tab = "status";

render(true);
boot();
