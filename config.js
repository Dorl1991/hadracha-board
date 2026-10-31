// הגדרות האתר. ממלאים פעם אחת (ראו README, שלב 3).
// מפתח ה-anon של Supabase מיועד להיות ציבורי; ההגנה על הנתונים היא בהרשאות שבמסד הנתונים.
// כל עוד SUPABASE_URL ריק, האתר עובד במצב הדגמה עם נתונים בדויים בדפדפן בלבד.
window.APP_CONFIG = {
  SUPABASE_URL: "https://kbqcdhyxxyyvomabmasf.supabase.co",        // לדוגמה: "https://abcdefghijkl.supabase.co"
  SUPABASE_ANON_KEY: "sb_publishable_UB1RLrW96qmL-yhfDyxMJg_GgdFGfuW",    // Project Settings ← API ← anon public
  DEADLINE: "10:00",         // שעת סגירת הדיווח היומי
  DEFAULT_SITE: "המכללה הארצית",
  ORG_TITLE: "כבאות והצלה",
  BOARD_TITLE: "אגף הדרכה · לוח התייצבות"
};
