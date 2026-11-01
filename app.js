const CFG = window.APP_CONFIG || {};
const TZ = "Asia/Jerusalem";
const DEADLINE = CFG.DEADLINE || "10:00";
const DEFAULT_SITE = CFG.DEFAULT_SITE || "המכללה הארצית";

/* ---------- תכונות מושבתות זמנית (מחזירים מ-config.js) ----------
   STAFF_OUT     דיווח "סגל מחוץ לאתר". כבוי: השדה לא מופיע בדיווח ובלוח (הנתונים במסד נשמרים).
   HIDDEN_UNITS  מגמות שמוסתרות מהלוח ומהדיווח. כדי להחזיר מגמה, מוציאים את השם שלה מהרשימה. */
const FEATURES = {
  STAFF_OUT: CFG.STAFF_OUT === true,
  HIDDEN_UNITS: Array.isArray(CFG.HIDDEN_UNITS) ? CFG.HIDDEN_UNITS : ["מטה"]
};
const isHiddenUnit = m => FEATURES.HIDDEN_UNITS.includes(String((m && m.track) || "").trim());
const REPORT_AHEAD = 7;   // כמה ימים קדימה אפשר לדווח

/* ---------- dates ---------- */
const isoInTZ = d => new Intl.DateTimeFormat("en-CA",{timeZone:TZ,year:"numeric",month:"2-digit",day:"2-digit"}).format(d);
const hmInTZ = d => new Intl.DateTimeFormat("en-GB",{timeZone:TZ,hour:"2-digit",minute:"2-digit",hour12:false}).format(d);
const TODAY = isoInTZ(new Date());
const MAXD = addDays(TODAY, REPORT_AHEAD);
const nowHM = () => hmInTZ(new Date());
function parts(iso){ const [y,m,d] = iso.split("-").map(Number); return {y,m,d}; }
function addDays(iso,n){ const {y,m,d}=parts(iso); return new Date(Date.UTC(y,m-1,d+n)).toISOString().slice(0,10); }
function dow(iso){ const {y,m,d}=parts(iso); return new Date(Date.UTC(y,m-1,d)).getUTCDay(); }
const SPECIAL = new Map();
const specialOf = iso => SPECIAL.get(iso) || null;
const isWork = iso => dow(iso) <= 4 && !(SPECIAL.get(iso) && SPECIAL.get(iso).kind === "off");
const dlFor = iso => { const s = SPECIAL.get(iso); return s && s.kind === "short" && s.deadline ? s.deadline : DEADLINE; };
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

const EMBLEM = `<img class="logo" src="icons/logo.png" alt="כבאות והצלה לישראל · אגף הדרכה" width="256" height="256">`;

/*GEN-START*/
function genDemo(T){
  let seed = 41; const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const ri = (a,b) => a + Math.floor(rnd()*(b-a+1));
  const W = n => n===0 ? T : addWork(T,n);
  const C = "המכללה הארצית";
  const managers = {
    "m-rs": {name:"ימית אהרון", site:C, track:"מגמת כיבוי וחילוץ", phone:"050-0000002", token:"rs4m9q", active:true, example:true, base:11},
    "m-hz": {name:"סנדרה מוסקוביץ", site:C, track:"מגמת חומ״ס ומתנדבים", phone:"050-0000001", token:"hz7k2p", active:true, example:true, base:9},
    "m-ft": {name:"רמי מזרחי", site:C, track:"מגמת הגנה מאש וחקירות", phone:"050-0000005", token:"ft5n8v", active:true, example:true, base:5},
    "m-cm": {name:"מעיין מלכה", site:C, track:"מגמת פו״מ", phone:"050-0000003", token:"cm8t3w", active:true, example:true, base:6},
    "m-bs": {name:"נצר שמעוני", site:C, track:"מגמת יער ושטחים פתוחים", phone:"050-0000004", token:"bs2x6r", active:true, example:true, base:14},
    "m-in": {name:"עמית לוי", site:C, track:"מדור גורמי חוץ", phone:"050-0000006", token:"in3p7d", active:true, example:true, base:7},
    "m-n1": {name:"עדי לוי", site:C, track:"מטה", phone:"050-0000007", token:"n1k4ze", active:true, example:true, base:9}
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
  S.role = d.role; S.me = d.me || null; S.email = d.email || "";
  SPECIAL.clear(); (d.special||[]).forEach(x => SPECIAL.set(x.day, {kind:x.kind, deadline:x.deadline||null, label:x.label||""}));
  S.managers = new Map((d.units||[]).map(u => [u.id, {name:u.manager_name||"", track:u.name, phone:u.phone||"", site:u.site||DEFAULT_SITE, token:u.token||"", active:u.active!==false}]));
  S.courses = new Map((d.courses||[]).map(c => [c.id, {name:c.name, mid:c.unit_id, start:c.start_date, end:c.end_date, org:c.org, ext:c.ext, cancelled:false}]));
  S.reports = new Map((d.reports||[]).map(r => [r.report_date+"_"+r.unit_id, {date:r.report_date, mid:r.unit_id, staffIn:r.staff_in, staffOut:r.staff_out, noCourse:r.no_course, counts:r.counts||{}, at:r.reported_at, carried:r.carried_from||null}]));
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
    const { data, error } = await sb.rpc("board_data", { p_token: TOKEN || null, p_from: FROM, p_to: MAXD });
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
    async submitReport(mid, date, staffIn, staffOut, counts){ const { error } = await sb.rpc("submit_report", { p_token: TOKEN || null, p_unit: mid, p_staff_in: staffIn, p_staff_out: staffOut, p_counts: counts, p_date: date }); if (error) throw error; await refresh(); },
    async addCourse(mid, x){ const { data, error } = await sb.rpc("add_course", { p_token: TOKEN || null, p_unit: mid, p_name: x.name, p_start: x.start, p_end: x.end, p_org: x.org||0, p_ext: x.ext||0 }); if (error) throw error; await refresh(); return data; },
    async saveUnit(id, f){ const row = { name:f.track, manager_name:f.name, phone:f.phone||"", site:f.site||DEFAULT_SITE };
      if (f.newToken) row.token = randToken();
      const q = id ? sb.from("units").update(row).eq("id", id) : sb.from("units").insert({ ...row, sort_order: S.managers.size + 1 });
      const { error } = await q; if (error) throw error; await refresh(); },
    async removeUnit(id){ const { error } = await sb.from("units").update({ active:false }).eq("id", id); if (error) throw error; await refresh(); },
    async listMembers(){ const { data, error } = await sb.rpc("list_members"); if (error) throw error; return data || []; },
    async saveMember(id, f){ const { error } = await sb.rpc("save_member", { p_id:id, p_name:f.name||"", p_role:f.role, p_email:f.email||null, p_link:!!f.link }); if (error) throw error; },
    async rotateMember(id){ const { error } = await sb.rpc("rotate_member_link", { p_id:id }); if (error) throw error; },
    async removeMember(id){ const { error } = await sb.rpc("remove_member", { p_id:id }); if (error) throw error; },
    async saveSpecial(rows){ const { error } = await sb.from("special_days").upsert(rows); if (error) throw error; await refresh(); },
    async removeSpecial(day){ const { error } = await sb.from("special_days").delete().eq("day", day); if (error) throw error; await refresh(); },
    async signUp(email, password){ const { data, error } = await sb.auth.signUp({ email, password, options:{ emailRedirectTo: location.origin + location.pathname } }); if (error) throw error; return data; }
  };
  refresh();
}
const LM = [{ id:"p-me", name:"", role:"admin", email:"you@example.com", token:null, has_account:true, is_me:true }, { id:"p-v1", name:"סגן מפקד האגף", role:"viewer", email:null, token:"demoviewlink0001", has_account:false }];
function startLocal(){
  S.mode = "local"; S.role = "admin";
  let saved = null;
  try { saved = JSON.parse(lsGet("division-demo-v3") || "null"); } catch(e) {}
  const base = saved || genDemo(TODAY);
  for (const c of ["managers","courses","reports"]) { S[c] = new Map(Object.entries(base[c] || {})); S.got.add(c); }
  const persist = () => lsSet("division-demo-v3", JSON.stringify({managers:Object.fromEntries(S.managers),courses:Object.fromEntries(S.courses),reports:Object.fromEntries(S.reports)}));
  const done = () => { persist(); render(true); };
  API = {
    async submitReport(mid, date, staffIn, staffOut, counts){
      const now = new Date().toISOString();
      const put = (D, from) => { const id = D+"_"+mid, prev = S.reports.get(id), cnt = countsFor(mid, D, counts); S.reports.set(id, {date:D, mid, staffIn, staffOut, noCourse:!Object.keys(cnt).length, counts:cnt, carried:from||null, at: !from && prev && !prev.carried ? prev.at : now}); };
      put(date, null);
      const until = carryUntil(mid, date);
      for (let D = addDays(date, 1); until && D <= until; D = addDays(D, 1)) { if (!isWork(D)) continue; const r = S.reports.get(D+"_"+mid); if (r && !r.carried) break; put(D, date); }
      done(); },
    async addCourse(mid, x){ const id = "c-"+rid(6); S.courses.set(id, {name:x.name, mid, start:x.start, end:x.end, org:x.org||0, ext:x.ext||0, cancelled:false}); done(); return id; },
    async saveUnit(id, f){ const old = id ? S.managers.get(id) : {token:rid(6), active:true}; S.managers.set(id || "m-"+rid(6), {...old, name:f.name, track:f.track, phone:f.phone||"", site:f.site||DEFAULT_SITE, ...(f.newToken?{token:rid(6)}:{})}); done(); },
    async removeUnit(id){ const m = S.managers.get(id); if (m) S.managers.set(id, {...m, active:false}); done(); },
    async listMembers(){ return LM.map(x => ({...x})); },
    async saveMember(id, f){ if (id) { const x = LM.find(m => m.id === id); if (x) { x.role = f.role; x.name = f.name; } } else LM.push({ id:"p-"+rid(6), name:f.name, role:f.role, email:f.link?null:f.email, token:f.link?rid(16):null, has_account:false }); },
    async rotateMember(id){ const x = LM.find(m => m.id === id); if (x) x.token = rid(16); },
    async removeMember(id){ const i = LM.findIndex(m => m.id === id); if (i >= 0) LM.splice(i, 1); },
    async saveSpecial(rows){ rows.forEach(r => SPECIAL.set(r.day, {kind:r.kind, deadline:r.deadline, label:r.label})); render(true); },
    async removeSpecial(day){ SPECIAL.delete(day); render(true); },
    async signUp(){ throw new Error("local"); }
  };
  render(true);
}
const ready = () => S.got.size === 3;
const canAdmin = () => S.mode === "local" || S.role === "admin";
const canReport = mid => canAdmin() || S.role === "editor" || (S.role === "unit" && S.me === mid);

/* ---------- computations ---------- */
function activeManagers(site){ return [...S.managers.entries()].filter(([,m]) => m.active !== false && !isHiddenUnit(m) && (!site || site === "all" || siteOf(m) === site)).map(([id,m]) => ({id, ...m, site: siteOf(m)})); }
function allSites(){ const s = new Set(); for (const m of S.managers.values()) if (m.active !== false && !isHiddenUnit(m)) s.add(siteOf(m)); return [...(s.has(DEFAULT_SITE)?[DEFAULT_SITE]:[]), ...[...s].filter(x=>x!==DEFAULT_SITE).sort((a,b)=>a.localeCompare(b,"he"))]; }
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
  if (rep && rep.carried) return {cls:"good", txt:`המשך אוטומטי מהדיווח של ${heShort(rep.carried)}`, time:"המשך", carried:true};
  if (rep) { const t = timeOf(rep.at); return t && t > dlFor(rep.date || D) ? {cls:"warn", txt:"דווח באיחור", time:t, late:true} : {cls:"good", txt:"דווח", time:t}; }
  if (!isWork(D)) return {cls:"muted", txt:"יום ללא פעילות"};
  if (D > TODAY) return {cls:"muted", txt:"טרם דווח", future:true};
  if (D === TODAY && nowHM() < dlFor(D)) return {cls:"muted", txt:"ממתין", wait:true};
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
window.addEventListener("hashchange", () => { R.draft = null; R.step = 0; R.adding = null; R.date = R.pendingDate || null; R.pendingDate = null; window.scrollTo(0,0); render(true); });
setInterval(() => { if (!location.hash.startsWith("#report")) render(); }, 60000);

/* ---------- dashboard ---------- */
function renderDash(){
  if (!ready()) return `<div class="loading"><div class="bar"></div><div>מתחבר לנתונים…</div></div>`;
  const sites = allSites();
  if (UI.site !== "all" && !sites.includes(UI.site)) UI.site = "all";
  const st = dayStats(UI.date, UI.site);
  const todaySt = dayStats(TODAY, "all");
  const missToday = todaySt.units.filter(u => !u.rep).length;
  const showDot = isWork(TODAY) && missToday > 0 && nowHM() >= dlFor(TODAY);
  const examples = S.mode === "local";
  return `
  <header class="mast"><div class="wrap">
    <div class="mast-row">
      <div class="mark">${EMBLEM}<div><div class="t1">${esc(CFG.ORG_TITLE||"כבאות והצלה")}</div><div class="t2">${esc(CFG.BOARD_TITLE||"אגף הדרכה · לוח התייצבות")}</div></div></div>
      <div class="mast-tools">
        <span class="live ${S.mode==="live"?"":"local"}"><i></i>${S.mode==="live"?`מתעדכן בזמן אמת · ${nowHM()}`:"הדגמה מקומית"}</span>
        <div class="datectl">
          <button data-act="day" data-n="-1" aria-label="יום עבודה קודם">›</button>
          <label for="datepick">${UI.date===TODAY?"היום, ":""}${heMid(UI.date)}<input type="date" id="datepick" value="${UI.date}" min="${FROM}" max="${MAXD}" aria-label="בחירת תאריך"></label>
          <button data-act="day" data-n="1" aria-label="יום עבודה הבא" ${UI.date>=MAXD?"disabled":""}>‹</button>
        </div>
        ${UI.date!==TODAY?`<button class="today-link" data-act="today">חזרה להיום</button>`:""}
        ${S.mode==="live"&&session?`<button class="today-link" style="color:var(--muted)" data-act="logout">יציאה</button>`:""}
        ${S.role==="unit"&&S.managers.get(S.me)?`<span class="chip" aria-pressed="false">${esc(S.managers.get(S.me).track)}</span>`:S.role==="viewer"?`<span class="chip" aria-pressed="false">צפייה בלבד</span>`:S.role==="editor"?`<span class="chip" aria-pressed="false">עורך</span>`:""}
      </div>
    </div>
    <div class="nav-row">
      <nav class="tabs" role="tablist">
        <button class="tab" role="tab" aria-selected="${UI.tab==="overview"}" data-act="tab" data-t="overview"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>תמונת מצב</button>
        <button class="tab" role="tab" aria-selected="${UI.tab==="status"}" data-act="tab" data-t="status"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true"><path d="M6 4h8M6 8h8M6 12h8"/><circle cx="2.8" cy="4" r="1"/><circle cx="2.8" cy="8" r="1"/><circle cx="2.8" cy="12" r="1"/></svg>דיווחי מגמות${showDot?`<span class="dot" aria-label="חסרים דיווחים"></span>`:""}</button>
        <button class="tab" role="tab" aria-selected="${UI.tab==="history"}" data-act="tab" data-t="history"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 13H2V3"/><path d="M14 5l-4 4-2.5-2.5L4 10"/></svg>מגמות לאורך זמן</button>
        ${canAdmin()?`<button class="tab" role="tab" aria-selected="${UI.tab==="perms"}" data-act="tab" data-t="perms"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 1.8 2.8 3.9v3.8c0 3.2 2.2 5.7 5.2 6.5 3-.8 5.2-3.3 5.2-6.5V3.9z"/><path d="m5.8 8 1.5 1.5L10.4 6.4"/></svg>ניהול</button>`:""}
      </nav>
      ${sites.length>1?`<div class="sites" role="group" aria-label="סינון לפי אתר"><button class="chip" data-act="site" data-s="all" aria-pressed="${UI.site==="all"}">כל האגף</button>${sites.map(s=>`<button class="chip" data-act="site" data-s="${esc(s)}" aria-pressed="${UI.site===s}">${esc(s)}</button>`).join("")}</div>`:""}
    </div>
  </div></header>
  <main class="wrap">
    ${UI.date>TODAY?`<div class="note"><span class="tag">תכנון</span>דיווחים שנשלחו מראש והמשכים אוטומטיים של השתלמויות.</div>`:""}
    ${examples?`<div class="note"><span class="tag">מצב הדגמה</span>נתונים בדויים שנשמרים רק בדפדפן הזה. כדי לחבר מסד נתונים אמיתי, מלאו את config.js (ראו README).</div>`:""}
    ${!isWork(UI.date)?(specialOf(UI.date)?`<div class="note"><span class="tag">${esc(specialOf(UI.date).label||"יום מיוחד")}</span>אין חובת דיווח ביום הזה.</div>`:`<div class="note"><b>יום ${DAYS.at(dow(UI.date))}.</b> אין דיווחים בימי שישי ושבת.</div>`):specialOf(UI.date)&&specialOf(UI.date).kind==="short"?`<div class="note"><span class="tag">${esc(specialOf(UI.date).label||"יום מקוצר")}</span>הדיווח נסגר היום ב-${dlFor(UI.date)}.</div>`:""}
    ${UI.tab==="overview"?renderOverview(st):UI.tab==="status"?renderStatus(st):UI.tab==="perms"&&canAdmin()?renderPerms():renderHistory()}
  </main>`;
}

const FLAME_WM = `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width=".9" stroke-linejoin="round"><path d="M50 6c7 14 22 22 22 41a22 22 0 0 1-44 0c0-9 5-16 10-20 1 7 5 11 10 13-2-12-1-24 2-34z"/><path d="M50 52c3 5 8 8 8 15a8 8 0 0 1-16 0c0-4 2-6 4-8 0 3 2 4 4 5-1-4 0-8 0-12z"/></svg>`;
const HEX_OUT = "56,4 106,33 106,91 56,120 6,91 6,33", HEX_IN = "56,12 99,37 99,87 56,112 13,87 13,37";

function hexCell(u, mx, multi){
  const m = u.m, rep = u.rep, s = repStatus(rep, UI.date), n = u.staffIn + u.org + u.ext;
  const name = esc((m.track || "").replace(/^מגמת\s+/, ""));
  const st = rep ? (s.late ? "late" : "on") : (s.cls === "crit" ? "miss" : "off");
  const chip = rep ? (s.time || "דווח") : s.cls === "crit" ? "לא דווח" : s.wait ? "ממתין" : s.future ? "טרם דווח" : "—";
  const shape = rep
    ? `<polygon points="${HEX_OUT}" class="hx-fill"/><polygon points="${HEX_IN}" class="hx-in"/>`
    : `<polygon points="${HEX_OUT}" class="hx-empty"/>`;
  return `<button class="hcell ${st}" data-act="tab" data-t="status" title="${esc(m.track)} · ${rep?(s.carried?s.txt:s.late?"דווח באיחור":"דווח"):s.txt}">
    <span class="hex"><svg viewBox="0 0 112 124" aria-hidden="true">${shape}</svg><span class="hin">${uIcon(m.track)}<strong>${rep ? fmt(n) : (s.wait ? "ממתין" : s.cls === "crit" ? "חסר" : "—")}</strong></span></span>
    <span class="hshare">${rep ? `<i style="width:${mx ? Math.max(4, n / mx * 100) : 0}%"></i>` : ""}</span>
    <b class="hname">${name}</b>
    <small class="hmgr">${esc(m.name || "טרם הוגדר")}${multi ? ` · ${esc(m.site)}` : ""}</small>
    <span class="htm">${chip}</span>
  </button>`;
}

function renderOverview(st){
  const missing = st.units.filter(u => !u.rep);
  const after = UI.date < TODAY || (UI.date === TODAY && nowHM() >= dlFor(UI.date));
  const scope = UI.site === "all" ? "באתרי ההדרכה" : `ב${UI.site}`;
  const multi = allSites().length > 1;
  const kicker = `${heLong(UI.date)}${UI.date===TODAY?` · ${nowHM()}`:""}${isWork(UI.date)?` · נסגר ב-${dlFor(UI.date)}`:""}`;
  const fig = (k, v) => `<div class="fire-fig"><b>${fmt(v)}</b><span>${k}</span></div>`;
  const units = st.units.slice();
  const bal = mx => Math.max(1, Math.ceil(units.length / Math.ceil(units.length / mx)));
  const mx = Math.max(0, ...units.filter(u => u.rep).map(u => u.staffIn + u.org + u.ext));
  const rule = !st.total ? "" : !isWork(UI.date) ? `<div class="fire-rule"><span>אין חובת דיווח ביום הזה</span></div>`
    : `<div class="fire-rule"><button class="fire-rep ${missing.length&&after?"alarm":""}" data-act="tab" data-t="status"><i></i><b>${st.reported} מתוך ${st.total}</b> מגמות דיווחו</button>${missing.length?`<span class="${after?"crit":""}">${UI.date>TODAY?"טרם דווחו":after?"חסר דיווח":"ממתינים"}: ${missing.map(u=>esc(u.m.track.replace(/^מגמת\s+/,""))).join(" · ")}</span>`:`<span>כל המגמות דיווחו</span>`}</div>`;

  const hero = `<section class="fire">
    <div class="fire-mark" aria-hidden="true">${FLAME_WM}</div>
    <div class="fire-head">
      <div class="fire-main"><div class="fire-top">${kicker}</div><div class="fire-num">${fmt(st.onSite)}</div></div>
      <div class="fire-unit">משתתפים ${scope}</div>
      <div class="fire-row">${fig("סגל",st.staffIn)}${fig("חניכי הארגון",st.org)}${fig("מחוץ לארגון",st.ext)}${fig("השתלמויות",st.courses.length)}</div>
    </div>
    ${units.length?`<div class="hrow" style="--c-lg:${bal(8)};--c-md:${bal(5)};--c-sm:${bal(3)};--c-xs:${bal(2)}">${units.map(u => hexCell(u, mx, multi)).join("")}</div>`:`<div class="hempty">לא הוגדרו מגמות.</div>`}
    ${rule}
  </section>`;

  const bySite = {}; st.units.forEach(u => (bySite[u.m.site] ||= []).push(u));
  let placesSec = "";
  if (UI.site === "all" && Object.keys(bySite).length > 1) {
    const places = Object.entries(bySite).map(([s,us]) => {
      const n = us.reduce((a,u)=>a+u.staffIn+u.org+u.ext,0), r = us.filter(u=>u.rep).length;
      return `<button class="place" data-act="site" data-s="${esc(s)}"><span class="pn">${esc(s)}</span><b>${fmt(n)}</b><span class="ps ${r<us.length&&after?"alarm":""}">${r}/${us.length} דיווחו</span></button>`;
    }).join("");
    placesSec = `<section class="sec"><div class="sec-h"><h2>לפי אתר</h2></div><div class="places">${places}</div></section>`;
  }

  const courses = st.courses.slice().sort((a,b)=>(b.o+b.e)-(a.o+a.e)).map(c => `<div class="crow"><div class="cn"><span>${esc(c.name)}</span><small>${multi?esc(c.site):esc(c.track)}</small></div><span class="cd">${c.dayT>1?`יום ${c.dayN}/${c.dayT}`:"יום אחד"}</span><b>${fmt(c.o+c.e)}</b></div>`).join("");
  const coursesSec = `<section class="sec"><div class="sec-h"><h2>השתלמויות היום</h2></div><div class="card clist ${st.courses.length>1?"cols2":""}">${courses || `<div class="empty">אין השתלמויות פעילות.</div>`}</div></section>`;

  return hero + placesSec + coursesSec;
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
      <div class="unrow"><b class="unum">${n===null?"—":fmt(n)}</b>${withMenu && D>=TODAY && D<=MAXD && canReport(m.id)?`<a class="rbtn ${rep?"":"due"}" data-act="go-report" data-d="${D}" href="#report-${esc(m.id)}">${rep?MI.edit+"עדכון":MI.send+"דיווח"}</a>`:""}</div>
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
  const after = UI.date < TODAY || nowHM() >= dlFor(UI.date);
  const cards = units.map(u => unitCard(u, UI.date, admin)).join("");
  return `
  <section class="st-head">
    <div><div class="eyebrow">${heLong(UI.date)}</div>
      <div class="st-big">${st.reported}<span>/${st.total}</span></div>
      <div class="st-sub ${missing&&after&&isWork(UI.date)?"alarm":""}">${!isWork(UI.date)?(specialOf(UI.date)?`${esc(specialOf(UI.date).label||"יום מיוחד")}: אין חובת דיווח`:"אין חובת דיווח בסוף השבוע"):missing?(after?`חסרים ${missing} דיווחים`:`ממתינים ל-${missing} דיווחים · נסגר ב-${DEADLINE}`):"כל המגמות דיווחו"}</div></div>
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
  const pend = x => x.D===TODAY && nowHM()<dlFor(x.D);
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
    <td class="n">${fmt(x.onSite)}</td><td class="n">${fmt(x.staffIn)}</td>${FEATURES.STAFF_OUT?`<td class="n">${fmt(x.staffOut)}</td>`:""}<td class="n">${fmt(x.org)}</td><td class="n">${fmt(x.ext)}</td><td class="n">${x.courses.length}</td>
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
    <div class="card"><div class="tscroll"><table><thead><tr><th>תאריך</th><th class="n">סה"כ באתרים</th><th class="n">סגל באתרים</th>${FEATURES.STAFF_OUT?`<th class="n">סגל בחוץ</th>`:""}<th class="n">חניכי ארגון</th><th class="n">חיצוניים</th><th class="n">השתלמויות</th><th>דיווחו</th></tr></thead><tbody>${rows}</tbody></table></div></div></section>`;
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

/* ---------- permissions (system admins only) ---------- */
const ROLE_INFO = {
  admin:  { name:"מנהל מערכת", plural:"מנהלי מערכת", desc:"הכול: צפייה, דיווח על כל מגמה, ניהול מגמות והרשאות. כניסה עם מייל וסיסמה בלבד." },
  editor: { name:"עורך",       plural:"עורכים",      desc:"צפייה ודיווח על כל המגמות, הוספת השתלמויות. בלי ניהול מגמות והרשאות." },
  viewer: { name:"צופה",       plural:"צופים",       desc:"צפייה בלוח בלבד, בלי אפשרות לדווח או לשנות." }
};
const P = { list:null, loading:false, form:null, confirm:null, editRole:null };
async function loadMembers(){
  if (P.loading) return; P.loading = true;
  try { P.list = await API.listMembers(); } catch(e) { toast(errMsg(e)); P.list = P.list || []; }
  P.loading = false; render(true);
}
const PI = {
  key: mi('<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M15 8l2 2"/>'),
  user: mi('<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>'),
  eye: mi('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  shield: mi('<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.3 7.5 9.5 4.3-1.2 7.5-4.9 7.5-9.5V6z"/>'),
  pen: mi('<path d="M4 20h4L19 9l-4-4L4 16z"/>'),
  refresh: mi('<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>'),
  cal: mi('<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>')
};
const roleIcon = r => r === "admin" ? PI.shield : r === "editor" ? PI.pen : PI.eye;
function memberRow(x){
  const isLink = !!x.token;
  const conf = P.confirm === x.id, editing = P.editRole === x.id;
  const sub = isLink ? "קישור אישי" : esc(x.email);
  const status = isLink ? `<span class="ustate good"><i></i>קישור פעיל</span>`
    : x.has_account ? `<span class="ustate good"><i></i>${x.is_me?"זה אתה":"נרשם"}</span>` : `<span class="ustate"><i></i>טרם נרשם</span>`;
  return `<div class="mem">
    <span class="mem-ic r-${x.role}">${isLink?PI.key:PI.user}</span>
    <div class="mem-main"><b>${esc(x.name || (isLink ? "קישור ללא שם" : x.email))}</b><span>${isLink || x.name ? sub : (x.is_me ? "החשבון שלך" : "מייל וסיסמה")}</span></div>
    <div class="mem-st">${status}</div>
    <div class="mem-acts">
      ${conf ? `<span class="mem-q">להסיר את ההרשאה?</span><button class="btn sm danger-solid" data-act="perm-del-yes" data-id="${x.id}">הסרה</button><button class="btn sm" data-act="perm-cancel">ביטול</button>`
      : editing ? `<div class="seg" role="group" aria-label="שינוי הרשאה">${["admin","editor","viewer"].filter(r => !(isLink && r==="admin")).map(r=>`<button data-act="perm-role" data-id="${x.id}" data-r="${r}" aria-pressed="${x.role===r}">${ROLE_INFO[r].name}</button>`).join("")}</div><button class="btn link" data-act="perm-cancel">סגירה</button>`
      : `${isLink?`<button class="btn link" data-act="perm-copy" data-token="${esc(x.token)}">${MI.link}העתקה</button><a class="btn link" href="https://wa.me/?text=${encodeURIComponent(`קישור ל${CFG.BOARD_TITLE||"לוח ההתייצבות"} (${ROLE_INFO[x.role].name}):\n${linkFor(x.token)}`)}" target="_blank" rel="noopener">${MI.chat}וואטסאפ</a><button class="btn link" data-act="perm-rotate" data-id="${x.id}" title="הקישור הישן יפסיק לעבוד">${PI.refresh}קישור חדש</button>`:""}
        ${x.is_me?"":`<button class="btn link" data-act="perm-edit" data-id="${x.id}">${MI.edit}שינוי הרשאה</button><button class="btn link danger" data-act="perm-del" data-id="${x.id}">${MI.trash}הסרה</button>`}`}
    </div></div>`;
}
function permFormHTML(){
  const f = P.form;
  const link = f.kind === "link" && f.role !== "admin";
  return `<section class="card addform perm-form">
    <div class="sec-h"><h2>הרשאה חדשה</h2></div>
    <div class="pf-row"><span class="pf-l">סוג הרשאה</span>
      <div class="role-pick">${["viewer","editor","admin"].map(r=>`<button class="rp ${f.role===r?"on":""}" data-act="pf-role" data-r="${r}"><span class="rp-ic r-${r}">${roleIcon(r)}</span><b>${ROLE_INFO[r].name}</b><small>${ROLE_INFO[r].desc}</small></button>`).join("")}</div></div>
    ${f.role!=="admin"?`<div class="pf-row"><span class="pf-l">איך ייכנסו</span>
      <div class="seg" role="group"><button data-act="pf-kind" data-k="link" aria-pressed="${link}">קישור אישי</button><button data-act="pf-kind" data-k="account" aria-pressed="${!link}">מייל וסיסמה</button></div></div>`:""}
    <div class="formgrid">
      <div class="field"><label for="pf-name">שם</label><input id="pf-name" data-pbind="name" value="${esc(f.name)}" placeholder="לדוגמה: סגן מפקד האגף"></div>
      ${link?"":`<div class="field"><label for="pf-email">מייל</label><input id="pf-email" type="email" dir="ltr" data-pbind="email" value="${esc(f.email)}" placeholder="name@example.com"></div>`}
    </div>
    <p class="pf-hint">${link
      ? "ייווצר קישור אישי. מי שמקבל אותו נכנס בלי סיסמה. אפשר לבטל אותו או ליצור חדש בכל רגע."
      : "אחרי השמירה, שלחו לאדם את כתובת האתר. בכניסה הראשונה הוא לוחץ \"פעם ראשונה? יצירת סיסמה\" עם המייל הזה, ומאשר את המייל שיקבל."}</p>
    <div class="toolbar"><button class="btn primary" data-act="pf-save">${link?"יצירת קישור":"שמירה"}</button><button class="btn link" data-act="perm-cancel">ביטול</button></div>
  </section>`;
}
function renderPerms(){
  if (!canAdmin()) return `<div class="empty">רק מנהלי מערכת יכולים לנהל הרשאות.</div>`;
  if (P.list === null) { loadMembers(); return `<div class="loading" style="min-height:30vh"><div class="bar"></div><div>טוען הרשאות…</div></div>`; }
  const by = r => P.list.filter(x => x.role === r);
  const unitsN = activeManagers("all").length;
  return `
  <section class="st-head">
    <div><div class="eyebrow">ניהול המערכת</div>
      <div class="st-big">${P.list.length}</div>
      <div class="st-sub">בעלי הרשאה, בנוסף ל-${unitsN} מנהלי מגמות</div></div>
    <div class="toolbar">${P.form?"":`<button class="btn add-btn" data-act="perm-add">${MI.plus}הוספת הרשאה</button>`}</div>
  </section>
  ${P.form ? permFormHTML() : ""}
  ${["admin","editor","viewer"].map(r => `<section class="sec">
    <div class="sec-h"><h2><span class="h-ic r-${r}">${roleIcon(r)}</span>${ROLE_INFO[r].plural}</h2><span class="meta">${ROLE_INFO[r].desc}</span></div>
    <div class="card mem-list">${by(r).map(memberRow).join("") || `<div class="empty">אין ${ROLE_INFO[r].plural} עדיין.</div>`}</div>
  </section>`).join("")}
  ${specialSectionHTML()}
  <section class="sec"><div class="sec-h"><h2><span class="h-ic r-unit">${MI.send}</span>מנהלי מגמות</h2><span class="meta">כל מנהל מגמה מדווח רק על המגמה שלו</span></div>
    <div class="card" style="padding:14px 18px;font-size:13.5px;color:var(--ink-2)">את הקישור האישי של מנהל מגמה שולחים מהכרטיס שלה בלשונית <button class="btn link" style="display:inline;padding:0 2px;color:var(--brand)" data-act="tab" data-t="status">דיווחי מגמות</button> (⋮ ← וואטסאפ).</div></section>`;
}
const PERM_ERR = { cannot_remove_self:"אי אפשר להסיר את עצמך.", cannot_demote_self:"אי אפשר להוריד לעצמך הרשאה.", last_admin:"חייב להישאר לפחות מנהל מערכת אחד.", admin_needs_email:"מנהל מערכת נכנס רק עם מייל וסיסמה.", bad_email:"כתובת המייל לא תקינה." };
const permErr = e => { const m = (e && e.message) || ""; const k = Object.keys(PERM_ERR).find(k => m.includes(k)); return k ? PERM_ERR[k] : errMsg(e); };
async function permAction(a, b){
  if (a === "perm-add") { P.form = { role:"viewer", kind:"link", name:"", email:"" }; render(true); document.getElementById("pf-name")?.focus(); }
  else if (a === "perm-cancel") { P.form = null; P.confirm = null; P.editRole = null; render(true); }
  else if (a === "pf-role") { P.form.role = b.dataset.r; render(true); }
  else if (a === "pf-kind") { P.form.kind = b.dataset.k; render(true); }
  else if (a === "pf-save") {
    const f = P.form, link = f.kind === "link" && f.role !== "admin";
    if (!link && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((f.email||"").trim())) { toast("צריך מייל תקין."); return; }
    b.disabled = true;
    try {
      await API.saveMember(null, { name:(f.name||"").trim(), role:f.role, email:link?null:f.email.trim(), link });
      P.form = null; P.list = await API.listMembers();
      toast(link ? "הקישור נוצר. אפשר להעתיק אותו או לשלוח בוואטסאפ." : "ההרשאה נשמרה. שלחו לאדם את כתובת האתר.");
    } catch(e) { toast(permErr(e)); }
    b.disabled = false; render(true);
  }
  else if (a === "perm-edit") { P.editRole = b.dataset.id; P.confirm = null; render(true); }
  else if (a === "perm-role") {
    const x = P.list.find(m => m.id === b.dataset.id); if (!x || x.role === b.dataset.r) { P.editRole = null; render(true); return; }
    try { await API.saveMember(x.id, { name:x.name, role:b.dataset.r }); P.editRole = null; P.list = await API.listMembers(); toast(`ההרשאה שונתה ל${ROLE_INFO[b.dataset.r].name}.`); } catch(e) { toast(permErr(e)); }
    render(true);
  }
  else if (a === "perm-del") { P.confirm = b.dataset.id; P.editRole = null; render(true); }
  else if (a === "perm-del-yes") { try { await API.removeMember(b.dataset.id); P.confirm = null; P.list = await API.listMembers(); toast("ההרשאה הוסרה."); } catch(e) { toast(permErr(e)); } render(true); }
  else if (a === "perm-rotate") { try { await API.rotateMember(b.dataset.id); P.list = await API.listMembers(); toast("נוצר קישור חדש. הקישור הקודם הפסיק לעבוד."); } catch(e) { toast(permErr(e)); } render(true); }
  else if (a === "perm-copy") copyText(linkFor(b.dataset.token));
  else return false;
  return true;
}

/* ---------- special days (system admins) ---------- */
function israelHolidays(fromIso, days){
  const f = new Intl.DateTimeFormat("en-u-ca-hebrew", { timeZone:"UTC", day:"numeric", month:"long" });
  const heb = iso => { const p = f.formatToParts(new Date(iso + "T12:00:00Z")); return { m: p.find(x => x.type === "month").value, d: Number(p.find(x => x.type === "day").value) }; };
  const FIXED = { "Tishri 1":"ראש השנה", "Tishri 2":"ראש השנה", "Tishri 10":"יום כיפור", "Tishri 15":"סוכות", "Tishri 22":"שמחת תורה",
                  "Nisan 15":"פסח", "Nisan 21":"שביעי של פסח", "Sivan 6":"שבועות" };
  const out = [];
  for (let i = 0; i < days; i++) {
    const iso = addDays(fromIso, i), h = heb(iso), w = dow(iso);
    let label = FIXED[h.m + " " + h.d] || null;
    if (!label && h.m === "Iyar" && h.d >= 3 && h.d <= 6) {
      // יום העצמאות: ה' באייר, מוקדם/נדחה לפי החוק כדי לא לחלל שבת
      if ((h.d === 5 && w >= 2 && w <= 4) || (h.d === 4 && w === 4) || (h.d === 3 && w === 4) || (h.d === 6 && w === 2)) {
        const real5 = h.d === 5 ? iso : addDays(iso, 5 - h.d);
        const w5 = dow(real5);
        const ok = (h.d === 5 && w5 >= 2 && w5 <= 4) || (h.d === 4 && w5 === 5) || (h.d === 3 && w5 === 6) || (h.d === 6 && w5 === 1);
        if (ok) label = "יום העצמאות";
      }
    }
    if (label && w <= 4) out.push({ day: iso, label });
  }
  return out;
}
const SD = { form:null, confirm:null };
function specialSectionHTML(){
  const upcoming = [...SPECIAL.entries()].filter(([d]) => d >= TODAY).sort(([a],[b]) => a < b ? -1 : 1);
  const f = SD.form;
  return `<section class="sec">
    <div class="sec-h"><h2><span class="h-ic r-unit">${PI.cal}</span>ימים מיוחדים</h2><span class="meta">חגים וימים מקוצרים. ביום חג אין חובת דיווח.</span></div>
    <div class="card mem-list">
      <div class="sd-tools">
        <button class="btn" data-act="pf-holidays">${PI.cal}הוספת חגי ישראל לשנה הקרובה</button>
        ${f?"":`<button class="btn link" data-act="pf-sd-add">${MI.plus}יום מיוחד ידני</button>`}
      </div>
      ${f?`<div class="sd-form">
        <div class="field"><label for="sd-day">תאריך</label><input id="sd-day" type="date" data-sbind="day" value="${f.day}" min="${TODAY}"></div>
        <div class="field"><label>סוג</label><div class="seg" role="group"><button data-act="pf-sd-kind" data-k="off" aria-pressed="${f.kind==="off"}">אין דיווח</button><button data-act="pf-sd-kind" data-k="short" aria-pressed="${f.kind==="short"}">שעת סגירה אחרת</button></div></div>
        ${f.kind==="short"?`<div class="field"><label for="sd-dl">נסגר ב-</label><input id="sd-dl" type="time" data-sbind="deadline" value="${f.deadline}"></div>`:""}
        <div class="field" style="flex:1 1 180px"><label for="sd-label">שם</label><input id="sd-label" data-sbind="label" value="${esc(f.label)}" placeholder="לדוגמה: ערב פסח"></div>
        <div class="toolbar"><button class="btn primary" data-act="pf-sd-save">שמירה</button><button class="btn link" data-act="pf-sd-cancel">ביטול</button></div>
      </div>`:""}
      ${upcoming.map(([d, x]) => `<div class="mem">
        <span class="mem-ic ${x.kind==="off"?"r-admin":"r-editor"}">${PI.cal}</span>
        <div class="mem-main"><b>${esc(x.label || (x.kind==="off"?"יום ללא דיווח":"יום מקוצר"))}</b><span>${heLong(d)}</span></div>
        <div class="mem-st"><span class="ustate ${x.kind==="off"?"crit":"warn"}"><i></i>${x.kind==="off"?"אין דיווח":`נסגר ב-${x.deadline}`}</span></div>
        <div class="mem-acts">${SD.confirm===d?`<button class="btn sm danger-solid" data-act="pf-sd-del-yes" data-d="${d}">הסרה</button><button class="btn sm" data-act="pf-sd-cancel">ביטול</button>`:`<button class="btn link danger" data-act="pf-sd-del" data-d="${d}">${MI.trash}הסרה</button>`}</div>
      </div>`).join("") || `<div class="empty">אין ימים מיוחדים קרובים.</div>`}
    </div></section>`;
}
async function specialAction(a, b){
  if (a === "pf-sd-add") { SD.form = { day: addDays(TODAY, 1), kind:"off", deadline:"12:00", label:"" }; render(true); }
  else if (a === "pf-sd-cancel") { SD.form = null; SD.confirm = null; render(true); }
  else if (a === "pf-sd-kind") { SD.form.kind = b.dataset.k; render(true); }
  else if (a === "pf-sd-save") {
    const f = SD.form; if (!f.day) { toast("צריך לבחור תאריך."); return; }
    try { await API.saveSpecial([{ day:f.day, kind:f.kind, deadline: f.kind==="short" ? (f.deadline||"12:00") : null, label:(f.label||"").trim() }]); SD.form = null; toast("היום נשמר."); }
    catch(e) { toast(errMsg(e)); }
    render(true);
  }
  else if (a === "pf-holidays") {
    const list = israelHolidays(TODAY, 366).filter(h => !SPECIAL.has(h.day));
    if (!list.length) { toast("כל החגים של השנה הקרובה כבר מסומנים."); return; }
    b.disabled = true;
    try { await API.saveSpecial(list.map(h => ({ day:h.day, kind:"off", deadline:null, label:h.label }))); toast(`נוספו ${list.length} ימי חג. אפשר להסיר כל יום שאינו מתאים.`); }
    catch(e) { toast(errMsg(e)); }
    b.disabled = false; render(true);
  }
  else if (a === "pf-sd-del") { SD.confirm = b.dataset.d; render(true); }
  else if (a === "pf-sd-del-yes") { try { await API.removeSpecial(b.dataset.d); SD.confirm = null; toast("היום הוסר."); } catch(e) { toast(errMsg(e)); } render(true); }
  else return false;
  return true;
}

/* ---------- reporter ---------- */
const R = { step:0, draft:null, adding:null, sentAt:null, date:null, pendingDate:null };
function reporterManager(id){ const m = S.managers.get(id); return m && m.active !== false && !isHiddenUnit(m) && canReport(id) ? {id, ...m} : null; }
const myCourses = (mid, D = R.date || TODAY) => [...S.courses.entries()].filter(([,c]) => c.mid === mid && !c.cancelled && c.start <= D && c.end >= D).map(([id,c]) => ({id, ...c}));
function reportDays(){ const out = []; for (let d = TODAY; d <= MAXD; d = addDays(d, 1)) if (d === TODAY || isWork(d)) out.push(d); return out; }
const defaultReportDate = () => isWork(TODAY) ? TODAY : (reportDays().find(isWork) || TODAY);
// סוף ההשתלמות הארוכה ביותר שממשיכה אחרי D (עד אליו הדיווח מועבר אוטומטית)
function carryUntil(mid, D){ let u = null; for (const c of S.courses.values()) if (c.mid === mid && !c.cancelled && c.start <= D && c.end > D && (!u || c.end > u)) u = c.end; return u; }
function countsFor(mid, D, counts){ const out = {}; for (const c of myCourses(mid, D)) { const k = counts[c.id]; out[c.id] = {org: k ? k.org||0 : c.org||0, ext: k ? k.ext||0 : c.ext||0}; } return out; }
function initDraft(m){
  const D = R.date, rep = S.reports.get(D + "_" + m.id), cs = myCourses(m.id, D);
  let prev = null; for (const r of S.reports.values()) if (r.mid === m.id && r.date < D && (!prev || r.date > prev.date)) prev = r;
  const counts = {};
  for (const c of cs) { const k = rep && rep.counts && rep.counts[c.id]; counts[c.id] = k ? {org:k.org, ext:k.ext} : {org:c.org||0, ext:c.ext||0}; }
  R.draft = { mid:m.id, date:D, staffIn: rep ? rep.staffIn : (prev ? prev.staffIn : 0), staffOut: rep ? rep.staffOut : (prev ? prev.staffOut : 0),
    fromPrev: !rep && !!prev, carried: rep && rep.carried ? rep.carried : null, noCourse: rep ? !!rep.noCourse && cs.length===0 : false, counts,
    existing: !!rep && !rep.carried, existingAt: rep && !rep.carried ? timeOf(rep.at) : "" };
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
  if (!R.date || R.date < TODAY || R.date > MAXD) R.date = defaultReportDate();
  if (!R.draft || R.draft.mid !== m.id || R.draft.date !== R.date) { initDraft(m); R.step = 0; }
  const D = R.date, d = R.draft, cs = myCourses(m.id, D), isToday = D === TODAY, until = carryUntil(m.id, D);
  const hour = Number(nowHM().slice(0,2));
  const greet = hour < 12 ? "בוקר טוב" : hour < 17 ? "צהריים טובים" : "ערב טוב";
  let body = "", foot = "";
  if (R.step === 0) {
    const chips = reportDays().map(x => { const r = S.reports.get(x + "_" + m.id);
      return `<button class="dchip ${r ? (r.carried ? "is-auto" : "is-done") : ""}" data-act="rdate" data-d="${x}" aria-pressed="${x===D}"><b>${x===TODAY?"היום":DAYS.at(dow(x))}</b><span>${heShort(x)}</span><i></i></button>`; }).join("");
    const stLine = d.existing ? `<span class="status good"><i></i>${isToday?"דיווחת היום":"דיווחת על היום הזה"} ב-${d.existingAt}</span><span>${isToday?"אפשר לעדכן עד סוף היום.":"אפשר לעדכן עד אותו יום."}</span>`
      : d.carried ? `<span class="status good"><i></i>מולא אוטומטית מהדיווח של ${heMid(d.carried)}</span><span>אפשר לעדכן אם משהו השתנה.</span>`
      : isToday ? `<span class="status ${nowHM()<dlFor(TODAY)?"muted":"crit"}"><i></i>${nowHM()<dlFor(TODAY)?"טרם דיווחת היום":"עבר מועד הדיווח"}</span><span>הדיווח נסגר ב-${dlFor(TODAY)}.</span>`
      : `<span class="status muted"><i></i>דיווח מראש</span><span>אפשר לדווח עד שבוע קדימה.</span>`;
    body = `<div class="eyebrow">${heLong(D)}</div><h2>${greet}${m.name?", "+esc(m.name.split(" ")[0]):""}</h2>
      <p class="lead">דיווח ההתייצבות של <b style="color:var(--ink);font-weight:600">${esc(m.track)}</b>, ${esc(siteOf(m))}.</p>
      <div class="dpick-wrap"><div class="dpick-l">על איזה יום מדווחים?</div><div class="dpick" role="group" aria-label="תאריך הדיווח">${chips}</div>
      <div class="dlegend"><span class="is-done"><i></i>דווח</span><span class="is-auto"><i></i>המשך אוטומטי</span></div></div>
      <div class="statusline">${stLine}</div>
      ${isToday && !isWork(TODAY)?`<div class="note">${specialOf(TODAY)?esc(specialOf(TODAY).label||"יום מיוחד")+": אין חובת דיווח היום.":`היום יום ${DAYS.at(dow(TODAY))}. בדרך כלל אין צורך בדיווח.`}</div>`:""}`;
    foot = `<button class="btn primary" data-act="rstep" data-n="1">${d.existing?"עדכון הדיווח":d.carried?"בדיקה ועדכון":"התחלה"}</button>`;
  } else if (R.step === 1) {
    body = `<div class="eyebrow">שלב 1 מתוך 3 · ${heMid(D)}</div><h2>סגל ומדריכים</h2><p class="lead">כמה אנשי סגל של המגמה נמצאים ${isToday?"היום":"ביום הזה"} באתר${FEATURES.STAFF_OUT?", וכמה לא":""}.</p>
      ${d.carried?`<div class="note"><span class="tag">המשך אוטומטי</span>מולא מהדיווח של ${heMid(d.carried)}. עדכנו אם משהו השתנה.</div>`:d.fromPrev?`<div class="note"><span class="tag">מולא מהדיווח הקודם</span>עדכנו אם משהו השתנה.</div>`:""}
      <div class="rcard"><div class="srow"><label for="st-staffIn">${isToday?"באתר היום":"באתר"}</label>${stepper("staffIn", d.staffIn, "סגל באתר")}</div>
      ${FEATURES.STAFF_OUT?`<div class="srow"><label for="st-staffOut">מחוץ לאתר</label><span class="hint">עבודה מהבית, תפקיד בחוץ, חופש. בלי לפרט.</span>${stepper("staffOut", d.staffOut, "סגל מחוץ לאתר")}</div>`:""}</div>`;
    foot = `<button class="btn back" data-act="rstep" data-n="-1">חזרה</button><button class="btn primary" data-act="rstep" data-n="1">המשך</button>`;
  } else if (R.step === 2) {
    const cards = cs.map(c => { const all = workdaysBetween(c.start,c.end), n = all.indexOf(D)+1; const k = d.counts[c.id] || {org:0,ext:0};
      return `<div class="ccard"><div class="ch"><b>${esc(c.name)}</b><small>${all.length>1?`יום ${n} מתוך ${all.length} · ${heShort(c.start)}–${heShort(c.end)}`:"השתלמות של יום אחד"}${all.length>1&&c.start<D?" · ממשיכה מהיום הקודם":""}</small></div>
        <div class="two"><div class="srow"><label>חניכי הארגון</label>${stepper(`c:${c.id}:org`, k.org, "חניכי הארגון", true)}</div>
        <div class="srow"><label>מחוץ לארגון</label>${stepper(`c:${c.id}:ext`, k.ext, "חניכים מחוץ לארגון", true)}</div></div></div>`; }).join("");
    const a = R.adding;
    const addForm = a ? `<div class="rcard"><h3>השתלמות חדשה</h3>
      <div class="field"><label for="a-name">שם ההשתלמות</label><input id="a-name" data-abind="name" value="${esc(a.name)}" placeholder="לדוגמה: השתלמות חומ&quot;ס – שטח"></div>
      <div class="two"><div class="field"><label for="a-start">מתאריך</label><input id="a-start" type="date" data-abind="start" value="${a.start}"></div>
      <div class="field"><label for="a-end">עד תאריך</label><input id="a-end" type="date" data-abind="end" value="${a.end}" min="${a.start}"></div></div>
      <span style="font-size:12.5px;color:var(--muted);margin-top:-8px">השתלמות של כמה ימים תופיע בכל הימים שלה, והדיווח יועבר אליהם אוטומטית.</span>
      <div class="two"><div class="srow"><label>חניכי הארגון</label>${stepper("a:org", a.org, "חניכי הארגון", true)}</div><div class="srow"><label>מחוץ לארגון</label>${stepper("a:ext", a.ext, "חניכים מחוץ לארגון", true)}</div></div>
      <div class="toolbar"><button class="btn primary" data-act="add-save">הוספת ההשתלמות</button><button class="btn link" data-act="add-cancel">ביטול</button></div></div>` : "";
    body = `<div class="eyebrow">שלב 2 מתוך 3 · ${heMid(D)}</div><h2>${isToday?"השתלמויות היום":"השתלמויות ביום הזה"}</h2><p class="lead">${cs.length?"השתלמויות פעילות מופיעות כאן מראש. עדכנו את מספר החניכים אם צריך.":"אין למגמה השתלמות פעילה ביום הזה."}</p>
      ${cards}${until?`<div class="note"><span class="tag">המשך אוטומטי</span>הדיווח יועבר לבד לכל ימי ההשתלמות, עד ${heMid(until)}. אם משהו משתנה, מעדכנים רק את אותו יום.</div>`:""}${addForm}
      ${!a?`<button class="btn" data-act="add-open" style="height:48px;border-style:dashed;border-radius:14px">הוספת השתלמות</button>`:""}
      ${!cs.length && !a?`<label class="check"><input type="checkbox" id="nocourse" ${d.noCourse?"checked":""}> אין השתלמות ביום הזה</label>`:""}`;
    const canNext = cs.length > 0 || d.noCourse;
    foot = `<button class="btn back" data-act="rstep" data-n="-1">חזרה</button>${a
      ? `<button class="btn primary" data-act="add-save" data-next="1">הוספה והמשך</button>`
      : `<button class="btn primary" data-act="rstep" data-n="1" ${canNext?"":"disabled"}>${canNext?"המשך":"הוסיפו השתלמות או סמנו \"אין\""}</button>`}`;
  } else if (R.step === 3) {
    const o = cs.reduce((s,c)=>s+(d.counts[c.id]?.org||0),0), e = cs.reduce((s,c)=>s+(d.counts[c.id]?.ext||0),0);
    const cells = [["סגל באתר", d.staffIn], ...(FEATURES.STAFF_OUT ? [["סגל מחוץ לאתר", d.staffOut]] : []), ["חניכי הארגון", o], ["מחוץ לארגון", e]];
    body = `<div class="eyebrow">שלב 3 מתוך 3</div><h2>אישור ושליחה</h2><p class="lead">${esc(m.track)} · ${heLong(D)}</p>
      <div class="rcard"><div class="sumgrid c${cells.length}">${cells.map(([k,v]) => `<div><span>${k}</span><b>${v}</b></div>`).join("")}</div>
      ${cs.length?`<div style="display:grid;gap:6px;font-size:14px">${cs.map(c=>`<div style="display:flex;justify-content:space-between;gap:8px"><span>${esc(c.name)}</span><span>${(d.counts[c.id]?.org||0)+(d.counts[c.id]?.ext||0)}</span></div>`).join("")}</div>`:`<div style="color:var(--muted);font-size:14px">אין השתלמות ביום הזה.</div>`}
      ${until?`<div class="carry-note">הדיווח יועבר אוטומטית לימי ההשתלמות הבאים, עד ${heMid(until)}.</div>`:""}</div>`;
    foot = `<button class="btn back" data-act="rstep" data-n="-1">חזרה</button><button class="btn primary" data-act="send">${d.existing?"עדכון הדיווח":"שליחת הדיווח"}</button>`;
  } else {
    body = `<div class="done"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="cc" cx="50" cy="50" r="45" fill="none" stroke="var(--good)" stroke-width="3"/><path class="ck" d="M31 52 L44 65 L70 38" fill="none" stroke="var(--good)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <h2>${isToday?"הדיווח התקבל":"הדיווח נשמר"}</h2><p class="lead">${isToday?`נשלח ב-${R.sentAt}. הוא כבר מופיע בלוח של אגף ההדרכה.`:`הדיווח ל${heLong(D)} נשמר ויופיע בלוח.`}${until?` הוא יועבר אוטומטית עד ${heMid(until)}.`:""}</p></div>`;
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
  if (dp) dp.onchange = () => { if (dp.value) { UI.date = dp.value > MAXD ? MAXD : dp.value < FROM ? FROM : dp.value; render(true); } };
  if (UI.tab === "history" && !location.hash.startsWith("#report")) wireHistory();
}
document.addEventListener("input", e => {
  const t = e.target;
  if (t.dataset.bind && UI.mgrForm) UI.mgrForm[t.dataset.bind] = t.value;
  if (t.dataset.pbind && P.form) P.form[t.dataset.pbind] = t.value;
  if (t.dataset.sbind && SD.form) SD.form[t.dataset.sbind] = t.value;
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
  if (a.startsWith("pf-") && await specialAction(a, b)) return;
  if (a.startsWith("perm-") || a.startsWith("pf-")) { await permAction(a, b); return; }
  if (a === "tab") { if (b.dataset.t === "perms") P.list = null; P.form = null; UI.tab = b.dataset.t; UI.mgrForm = null; UI.editId = null; UI.confirmDel = null; render(true); window.scrollTo({top:0}); }
  else if (a === "site") { UI.site = b.dataset.s; render(true); }
  else if (a === "day") { let d = addWork(UI.date, +b.dataset.n); if (d > MAXD) d = MAXD; if (d < FROM) d = FROM; UI.date = d; render(true); }
  else if (a === "today") { UI.date = TODAY; render(true); }
  else if (a === "goday") { UI.date = b.dataset.d; UI.tab = "overview"; render(true); window.scrollTo({top:0}); }
  else if (a === "range") { UI.range = +b.dataset.n; render(true); }
  else if (a === "copy") copyText(linkFor(b.dataset.token));
  else if (a === "export") {
    const q = v => `"${String(v).replace(/"/g,'""')}"`;
    const rows = [["תאריך","סה\"כ באתרים","סגל באתרים","סגל בחוץ","חניכי ארגון","חניכים מחוץ לארגון","השתלמויות","מגמות שדיווחו","סה\"כ מגמות"]];
    (HIST ? HIST.data.slice().reverse() : []).forEach(x => rows.push([x.D,x.onSite,x.staffIn,x.staffOut,x.org,x.ext,x.courses.length,x.reported,x.total]));
    if (!FEATURES.STAFF_OUT) rows.forEach(r => r.splice(3, 1));
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
  else if (a === "signup") { await doSignUp(b); }
  else if (a === "login-mode") { LOGIN_MODE = b.dataset.m; render(true); }
  else if (a === "reload") { location.reload(); }
  else if (a === "forget-token") { lsSet("unit-token", null); TOKEN = ""; history.replaceState(null, "", location.pathname); S.err = ""; render(true); }
  else if (a === "inc") { const k = b.dataset.k; setVal(k, Math.max(0, getVal(k) + (+b.dataset.n)), true); }
  else if (a === "rdate") { R.date = b.dataset.d; R.draft = null; R.adding = null; render(true); }
  else if (a === "go-report") { R.pendingDate = b.dataset.d; }
  else if (a === "rstep") { R.step = Math.max(0, Math.min(3, R.step + (+b.dataset.n))); render(true); window.scrollTo({top:0}); }
  else if (a === "add-open") { R.adding = {name:"", start:R.date||TODAY, end:R.date||TODAY, org:0, ext:0}; render(true); document.getElementById("a-name")?.focus(); }
  else if (a === "add-cancel") { R.adding = null; render(true); }
  else if (a === "add-save") {
    const x = R.adding, name = (x.name||"").trim(), D = R.date || TODAY;
    if (!name) { toast("צריך לתת שם להשתלמות."); document.getElementById("a-name")?.focus(); return; }
    if (!x.start || !x.end || x.end < x.start) { toast("תאריך הסיום צריך להיות אחרי תאריך ההתחלה."); return; }
    b.disabled = true;
    try {
      const id = await API.addCourse(R.draft.mid, {name, start:x.start, end:x.end, org:x.org||0, ext:x.ext||0});
      const covers = x.start <= D && x.end >= D;
      if (id && covers) R.draft.counts[id] = {org:x.org||0, ext:x.ext||0};
      R.adding = null;
      R.draft.noCourse = !myCourses(R.draft.mid, D).length;
      toast(covers ? (x.end > x.start ? "ההשתלמות נוספה לכל התאריכים שלה." : "ההשתלמות נוספה.")
                   : `ההשתלמות נשמרה ל-${heShort(x.start)}${x.end > x.start ? "–" + heShort(x.end) : ""}. היא תופיע בדיווח של הימים האלה.`);
      if (b.dataset.next) { R.step = 3; window.scrollTo({top:0}); }
    } catch(e) { toast(errMsg(e)); b.disabled = false; }
    render(true);
  }
  else if (a === "send") {
    const d = R.draft, D = d.date || TODAY; const cs = myCourses(d.mid, D);
    const counts = {}; cs.forEach(c => counts[c.id] = {org: d.counts[c.id]?.org||0, ext: d.counts[c.id]?.ext||0});
    const prev = S.reports.get(D + "_" + d.mid);
    b.disabled = true; b.textContent = "שולח…";
    try {
      await API.submitReport(d.mid, D, d.staffIn, d.staffOut, counts);
      R.sentAt = nowHM(); d.existing = true; d.carried = null; d.existingAt = prev && !prev.carried ? timeOf(prev.at) : R.sentAt; R.step = 4;
    } catch(e) { toast(errMsg(e)); }
    render(true); window.scrollTo({top:0});
  }
});

/* ---------- login ---------- */
let LOGIN_MODE = "in";
function renderLogin(){
  const bad = S.err === "badtoken";
  const head = `<div class="login-mark">${EMBLEM}</div>
    <div class="eyebrow">${esc(CFG.ORG_TITLE||"כבאות והצלה")}</div>
    <h1>${esc(CFG.BOARD_TITLE||"אגף הדרכה · לוח התייצבות")}</h1>`;
  if (session && S.mode === "live") {
    const em = (session.user && session.user.email) || "";
    return `<div class="login"><div class="login-card">${head}
      <p class="lead">אתה מחובר בתור <b dir="ltr">${esc(em)}</b>, אבל עדיין אין לך הרשאה ללוח.</p>
      <div class="note" style="justify-content:center">בקשו ממנהל מערכת להוסיף את המייל הזה בלשונית "הרשאות", ואז רעננו את הדף.</div>
      <div class="toolbar" style="justify-content:center"><button class="btn" data-act="reload">רענון</button><button class="btn link" data-act="logout">יציאה</button></div>
    </div></div>`;
  }
  const up = LOGIN_MODE === "up";
  return `<div class="login"><div class="login-card">${head}
    ${bad?`<div class="note" style="color:var(--crit)">הקישור האישי הזה אינו פעיל. ייתכן שנוצר קישור חדש. בקשו קישור עדכני.</div><button class="btn" data-act="forget-token">ניקוי הקישור הישן</button>`
      :`<p class="lead">${up?"יצירת סיסמה למייל שקיבל הרשאה מאגף ההדרכה.":"מנהלי מגמות נכנסים דרך הקישור האישי שקיבלו."}</p>`}
    <form class="login-form" onsubmit="return false">
      <label for="login-email">${up?"המייל שקיבל הרשאה":"כניסה עם מייל וסיסמה"}</label>
      <input id="login-email" type="email" dir="ltr" autocomplete="username" placeholder="name@example.com">
      <input id="login-pass" type="password" dir="ltr" autocomplete="${up?"new-password":"current-password"}" placeholder="${up?"סיסמה חדשה (לפחות 8 תווים)":"סיסמה"}">
      ${up?`<button class="btn primary" data-act="signup">יצירת סיסמה</button><button class="btn link" data-act="login-mode" data-m="in">כבר יש לי סיסמה: כניסה</button>`
        :`<button class="btn primary" data-act="login-pass">כניסה</button>
      <button class="btn link" data-act="login-mode" data-m="up">פעם ראשונה? יצירת סיסמה</button>
      <button class="btn link" data-act="login">שכחתי סיסמה: שליחת קישור כניסה למייל</button>`}
    </form>
  </div></div>`;
}
async function doSignUp(b){
  const email = (document.getElementById("login-email")?.value || "").trim(), pass = document.getElementById("login-pass")?.value || "";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { toast("כתובת המייל לא תקינה."); return; }
  if (pass.length < 8) { toast("הסיסמה צריכה להיות לפחות 8 תווים."); return; }
  b.disabled = true;
  try {
    const d = await API.signUp(email, pass);
    if (d && d.session) toast("הסיסמה נוצרה ונכנסת.");
    else { LOGIN_MODE = "in"; render(true); toast("שלחנו מייל אישור. לחצו על הקישור שבו, ואז היכנסו עם המייל והסיסמה."); }
  } catch(e) {
    const m = (e && e.message) || "";
    toast(/registered|exists/i.test(m) ? "למייל הזה כבר יש סיסמה. היכנסו, או השתמשו ב\"שכחתי סיסמה\"." : /rate|429/i.test(m) ? "נשלחו יותר מדי מיילים בזמן קצר. נסו שוב בעוד שעה." : "יצירת הסיסמה נכשלה: " + m);
  }
  b.disabled = false;
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
