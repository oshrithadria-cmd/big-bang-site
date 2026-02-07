# ייצוא פריימים ברזולוציה גבוהה

## אופציה 1: FFmpeg (מומלץ) – חילוץ מהסרטון במלוא הרזולוציה

אם הפריימים נוצרו מגרסה מוקטנת או מ-GIF, חלץ שוב ישירות מ-`scroll-video.mp4` ברזולוציה המקורית של הסרטון.

### התקנת FFmpeg
- הורדי מ: https://ffmpeg.org/download.html (או דרך `winget install ffmpeg`)
- או עם Chocolatey: `choco install ffmpeg`

### הרצה אוטומטית (PowerShell)
מתוך שורש הפרויקט (`big-bang-site`):

```powershell
.\scripts\export-frames-high-res.ps1
```

הסקריפט יוצר את `assets\video-frames-high` וממלא אותה בפריימים באיכות מקסימלית מהסרטון. אחרי שמוודאים שהכל נראה טוב, מחליפים את התיקייה הישנה (ראי למטה).

### חילוץ ידני (מצב פקודה)
מריצים מתוך תיקיית הפרויקט:

```powershell
cd assets
if (!(Test-Path video-frames-high)) { New-Item -ItemType Directory -Path video-frames-high }
ffmpeg -i scroll-video.mp4 -vf "select=between(n,0,50)" -vsync vfr -q:v 1 video-frames-high/ezgif-frame-%03d.png
```

- `between(n,0,50)` – מסגרות 0–50 (51 מסגרות).
- אם בסרטון יש פחות או יותר מסגרות, תצטרכי להתאים את המספרים או להשתמש ב־`fps` (למשל לחלץ פריים כל X שניות).

### אם רוצים להגדיל ל־2x (Retina / מסכים חדים)
```powershell
ffmpeg -i scroll-video.mp4 -vf "select=between(n,0,50),scale=2*iw:2*ih:flags=lanczos" -vsync vfr -q:v 1 video-frames-high/ezgif-frame-%03d.png
```

אחרי הייצוא:
1. גיבוי לתיקייה הישנה: `video-frames` → `video-frames-backup`
2. החלפה: `video-frames-high` → `video-frames`  
   (או לעדכן ב־HTML/JS את הנתיב ל־`assets/video-frames-high/`).

---

## אופציה 2: אם יש רק את ה־PNG הקיימים – האפשנה (Upscale)

בלי גישה ל־FFmpeg או לסרטון מקורי:

- **אונליין:** אתרים כמו Upscale.media, Bigjpg – מעלים פריימים ומאפשנים ל־2x/4x.
- **תוכנה:** Topaz Gigapixel, Real-ESRGAN (חינמי).
- **פוטושופ/GIMP:** Image → Image Size → הגדלה עם "Preserve Details" או "Bicubic sharper".

חשוב: האפשנה מוסיפה "ניחוש" של פרטים – טוב לתמונות חלקות/אמנותיות, פחות מושלם לטקסט חד.
