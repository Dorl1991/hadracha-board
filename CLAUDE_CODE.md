# הוראות ל-Claude Code

פתחו את התיקייה הזו ב-Claude Code והדביקו את הטקסט שבתיבה:

```
זה אתר סטטי (index.html, app.js, style.css) שמתחבר ל-Supabase. ההוראות המלאות ב-README.md.
עשה בבקשה את הדברים הבאים, ועצור לשאול אותי כשצריך ערך שרק אני יכול לתת:

1. בדוק ש-config.js מלא (SUPABASE_URL, SUPABASE_ANON_KEY). אם לא, בקש ממני את הערכים
   מ-Supabase (Project Settings ← API) ומלא אותם. אל תשתמש אף פעם במפתח service_role בקבצי האתר.
2. צור ריפו ציבורי ב-GitHub בשם hadracha-board, עשה commit לכל הקבצים ודחוף ל-main.
3. הפעל GitHub Pages מהענף main ומהתיקייה הראשית, חכה שהאתר יעלה, ותן לי את הכתובת.
4. תזכיר לי להריץ את sql/01_schema.sql ואת sql/02_seed.sql ב-SQL Editor של Supabase,
   ולהגדיר את כתובת האתר ב-Authentication ← URL Configuration (README, שלבים 4 ו-6).
```

## בקשות המשך שימושיות
- "שנה את שעת סגירת הדיווח ל-09:30" (DEADLINE ב-config.js)
- "הוסף מנהל מערכת נוסף עם המייל X" (README שלב 7)
- "תוסיף שדה חדש לדיווח היומי" (נדרש שינוי ב-sql/01_schema.sql בפונקציה submit_report וב-app.js)
