# טבלת האתר – טקסטים, פריימים, נקודות לחיצה וזמני גלילה

**הערה:** אחוזי גלילה (scroll %) הם 0.00–1.00 (0%–100%).

---

## 1. ניווט צד (Section Nav) – לחיצה קופצת לגלילה

| פריט | data-section | data-scroll | תיאור |
|------|-------------|-------------|--------|
| The Big Bang | bigbang | **0.10** | מעבר ל־Big Bang |
| Black Hole | blackhole | **0.40** | מעבר לחור שחור |
| Galaxy | galaxy | **0.68** | מעבר לגלקסיה |
| Planets | planets | **0.88** | מעבר למערכת השמש |

---

## 2. ציר זמן אנכי (Timeline Nav Points)

| נקודה | data-scroll | תווית |
|-------|-------------|--------|
| 1 | **0** | -13.7B |
| 2 | **0.15** | Big Bang |
| 3 | **0.31** | -13.2B |
| 4 | **0.48** | Black Holes |
| 5 | **0.58** | -10.8B |
| 6 | **0.68** | Galaxy |
| 7 | **0.88** | Solar System |

---

## 3. רקעים (Backgrounds) – טווחי גלילה

| רקע | טווח גלילה (scroll %) | הערות |
|-----|------------------------|--------|
| Milky Way (רגיל) | **0.00 – 0.29** | מתחיל מההתחלה |
| Purple/Gray Milky Way | **0.29 – 0.58** | אחרי הרקע הירוק |
| Scroll Frames (חור שחור) | **0.37 – 0.48** | מסתיר את שני הרקעים למעלה |
| Purple Galaxy | (מופיע עם גלקסיה) | z-index 1 |
| Planets BG | (במערכת השמש) | רקע פלנטות |
| Star Map Section | (סקשן קבוע) | z-index 16, pointer-events לפי visible |

---

## 4. פריימים (Video Frames)

### 4.1 פריימי חור שחור (Black Hole) – `assets/video-frames/`

| פרמטר | ערך |
|--------|-----|
| טווח גלילה | **0.37 – 0.48** |
| Fade in | 0.37 – 0.39 |
| כמות פריימים | **51** (ezgif-frame-001.png … ezgif-frame-051.png) |
| חישוב פריים | `frameIndex = floor(t * 51) + 1`, כאשר `t = (scrollPercent - 0.37) / 0.11` |

### 4.2 פריימי גלקסיה – `assets/galaxy-frames/`

| פרמטר | ערך |
|--------|-----|
| טווח גלילה | **0.63 – 0.85** |
| כמות פריימים | **51** |
| חישוב פריים | `galaxyFrameProgress = (scrollPercent - 0.63) / 0.22` |

---

## 5. אנימציית Three.js (main.js) – זמני גלילה

| שלב | התחלה | סיום | משתנה |
|-----|--------|------|--------|
| איסוף (Gather) | 0.00 | 0.08 | tGather |
| התנגשות (Collide) | 0.08 | 0.15 | tCollide |
| פלאש לבן (Flash) | 0.15 | 0.20 | tFlash |
| פיצוץ (Explode) | 0.15 | 0.28 | tExplode |
| אחרי פיצוץ (After) | 0.26 | 0.29 | tAfter |
| חור שחור | 0.32 | 0.48 | tHole |
| חזרה לכוכבים | 0.48 | 0.55 | tStarsBack |
| Purple (כוכבים) | 0.58+ | — | tPurple |
| גלקסיה (Form) | 0.68 | 0.78 | tGalaxyForm |
| גלקסיה (תצוגה) | 0.70 | 0.80 | tGalaxy |

---

## 6. טקסטים – טווחי הצגה / תוכן

### 6.1 טקסטים ראשיים (Hero / סקשנים)

| אלמנט | טווח גלילה (אם מוגדר) | תוכן כותרת |
|--------|-------------------------|-------------|
| **Hero** | נמוג 0.06–0.10 | THE BIG BANG |
| **Scroll hint** | נמוג 0.03–0.06 | "Scroll to start" |
| **Logo** | נמוג 0.06–0.10 | Origin + logo-video |
| **Black Holes (blackholes-text)** | — | BLACK HOLES + אופק האירועים |
| **Black hole (blackhole-text)** | — | BLACK HOLES (גרסה נוספת) |
| **Galaxy (galaxy-text)** | — | GALAXY + הגדרת גלקסיה |
| **Energy to Stars** | מוצג עם Explosion Hotspots | "From Energy to Stars" |

### 6.2 Timeline 1 – 13.7B Years Ago

| פרמטר | ערך |
|--------|-----|
| טווח גלילה | **0.07 – 0.16** |
| כותרת | 13.7B YEARS AGO |
| תוכן | סינגולריות, פיצוץ, radiation ו־matter eras |

### 6.3 Timeline 2 – 13.2B Years Ago (חור שחור)

| פרמטר | ערך |
|--------|-----|
| טווח גלילה | **0.53 – 0.62** |
| כותרת | 13.2B YEARS AGO |
| תוכן | חור שחור, event horizon, סינגולריות |

### 6.4 Timeline 3

| פרמטר | ערך |
|--------|-----|
| סטטוס | **מושבת** (display: none) |
| תוכן | זהה ל־Timeline 2 (13.2B, חור שחור) |

### 6.5 Timeline Galaxy – 10.8B Years Ago

| פרמטר | ערך |
|--------|-----|
| כותרת | 10.8B YEARS AGO |
| תוכן | היווצרות גלקסיות ראשונות, מימן, ספירלות |

---

## 7. נקודות לחיצה (Hotspots)

### 7.1 Explosion Hotspots (פיצוץ) – `#explosion-hotspots`

| טווח גלילה להצגה | **0.25 – 0.28** |

| # | מיקום (top / left) | כותרת | וידאו |
|---|--------------------|--------|--------|
| 1 | 20%, 22% | The Planck Epoch | planck-epoch.mp4 |
| 2 | 45%, 78% | The Grand Unification Epoch | grand-unification.mp4 |
| 3 | 75%, 25% | The Inflationary Epoch | inflationary-epoch.mp4 |
| 4 | 30%, 38% | The Quark Epoch | quark-epoch.mp4 |
| 5 | 78%, 72% | The Hadron Epoch | hadron-epoch.mp4 |
| 6 | 18%, 70% | The Radiation Era | radiation-era.mp4 |
| 7 | 48%, 18% | The Lepton & Nuclear Epochs | lepton-nuclear-epochs.mp4 |
| 8 | 65%, 48% | Formation of Atoms & Gas Clouds | atoms-gas-clouds.mp4 |
| 9 | 50%, 62% | The Galactic Epoch & Stellar Epoch | galactic-stellar-epoch.mp4 |

### 7.2 Black Hole Hotspots – `#blackhole-hotspots`

| טווח גלילה להצגה | **0.39 – 0.46** |

| # | מיקום | כותרת |
|---|--------|--------|
| 1 | 20%, 50% (מרכז למעלה) | Event Horizon |
| 2 | 50%, 80% (ימין) | The Singularity |
| 3 | 80%, 50% (מרכז למטה) | Accretion Disk |
| 4 | 50%, 20% (שמאל) | Hawking Radiation |
| 5 | 30%, 72% | Gravitational Lensing |

### 7.3 Galaxy Hotspots – `#galaxy-hotspots`

| טווח גלילה להצגה | **0.78 – 0.88** |

| # | מיקום | כותרת |
|---|--------|--------|
| 1 | 25%, 25% | Spiral Arms |
| 2 | 50%, 50% | Galactic Core |
| 3 | 35%, 75% | Star Clusters |
| 4 | 70%, 30% | Dark Matter Halo |
| 5 | 65%, 70% | Interstellar Medium |

---

## 8. ניווט פלנטות (Solar System) – `data-planet`

| ערך | תווית |
|-----|--------|
| saturn | Saturn |
| uranus | Uranus |
| neptune | Neptune |
| pluto | Pluto |
| moon | Moon |
| sun | The Sun (active ברירת מחדל) |
| mercury | Mercury |
| venus | Venus |
| earth | Earth |
| mars | Mars |
| jupiter | Jupiter |

---

## 9. סיכום טווחים לפי אחוז גלילה

| % גלילה | מה קורה |
|----------|----------|
| 0 | התחלה, -13.7B |
| 0.03–0.06 | Scroll hint נמוג |
| 0.06–0.10 | Hero + Logo נמוגים |
| 0.07–0.16 | Timeline 1 (13.7B) מופיע ועובר |
| 0.08–0.15 | התנגשות שני אשכולות (Collide) |
| 0.15–0.20 | פלאש לבן (Flash) |
| 0.15–0.28 | פיצוץ (Explode) |
| 0.25–0.28 | Explosion Hotspots + "From Energy to Stars" |
| 0.29 | מעבר ל־Purple Milky Way |
| 0.37–0.48 | פריימי חור שחור (51 פריימים) |
| 0.39–0.46 | Black Hole Hotspots |
| 0.48 | סיום חור שחור, Black Holes ב־Timeline |
| 0.53–0.62 | Timeline 2 (13.2B, חור שחור) |
| 0.58+ | Purple phase (כוכבים) |
| 0.63–0.85 | פריימי גלקסיה (51 פריימים) |
| 0.68 | Galaxy ב־Section Nav + Timeline |
| 0.78–0.88 | Galaxy Hotspots |
| 0.88 | Planets / Solar System |

---

*נוצר מתוך index.html ו־main.js – פברואר 2025*
