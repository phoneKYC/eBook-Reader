<div dir="ltr">

# 📖 IIDZII Reader

[![Static](https://img.shields.io/badge/Static-HTML%2FCSS%2FJS-blue)]()
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-green)]()
[![License](https://img.shields.io/badge/License-MIT-yellow)]()
[![Languages](https://img.shields.io/badge/Languages-AR%20%7C%20EN-orange)]()

A bold, no-nonsense e-book reader built with pure HTML, CSS, and JavaScript. Designed for readers who value function over fluff — brutalist interface meets editorial typography.

---

## ✨ Features

### File Support
- **TXT** — Smart parsing with automatic heading detection (supports `===`, `##`, `###` markers)
- **PDF** — Embedded PDF.js viewer with zoom controls, page navigation, and theme integration
- **DOCX** — Mammoth.js powered conversion preserving structure
- **EPUB** — Full EPUB parsing with JSZip, spine-ordered chapter rendering

### Reading Experience
- 📄 **Paginated** or **Continuous** scroll reading modes
- 🔍 **Search** within books with highlighted results
- 📑 **Auto-generated Table of Contents** from headings
- ⭐ **Bookmarks** — save and manage page references
- 🎯 **Focus Mode** — highlights current paragraph, dims the rest
- 📏 **Adjustable** font size (12–32px) and line height
- 📊 **Progress bar** at the top of the screen
- 🔔 **Page & chapter toasts** — brief overlay showing position on navigation

### Design
- **3 Themes**: Light ☀️ · Dark 🌙 · AMOLED ⚫
- **Brutalist-Editorial Hybrid** — bold borders, solid colors, clipped corners, no shadows, no gradients
- **RTL/LTR** — full Arabic and English support with automatic direction switching
- **Auto-hiding toolbar** — UI recedes while you read, returns on interaction
- **Responsive** — works on mobile, tablet, and desktop

### Data & Storage
- **IndexedDB** — saves reading progress, bookmarks, and settings locally
- **Continue Reading** — home screen shows your last opened book
- **Pre-loaded Suggestions** — 4 original short stories (2 Arabic, 2 English)

---

## 🚀 Quick Start

### Option 1: Open Directly
Simply open `index.html` in any modern browser.

### Option 2: GitHub Pages
1. Push the project to a GitHub repository
2. Go to **Settings → Pages**
3. Set source to the `main` branch
4. Your reader is live at `https://yourusername.github.io/repo-name/`

### Option 3: Any Static Host
Upload all files to Netlify, Vercel, Cloudflare Pages, or any static hosting service.

> **No build step required.** No Node.js, no npm, no bundlers.

---

## 📁 Project Structure

```
ebook-reader/
├── index.html              # Main HTML structure
├── style.css               # All styles & themes
├── app.js                  # Application logic
├── suggestions/
│   ├── manifest.json       # Book metadata
│   ├── ar/
│   │   ├── runes_of_silence.txt   # رموز الصمت (fantasy)
│   │   └── digital_oasis.txt      # واحة رقمية (cyberpunk)
│   └── en/
│       ├── neon_prophet.txt       # The Neon Prophet
│       └── last_algorithm.txt     # The Last Algorithm
└── README.md
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` / `→` / `↑` / `↓` | Navigate pages |
| `b` | Toggle bookmark |
| `f` | Toggle focus mode |
| `Esc` | Close panel / Return home |

---

## 📱 Touch Gestures

| Gesture | Action |
|---------|--------|
| Swipe left/right | Turn pages (respects RTL/LTR) |
| Tap content area | Toggle toolbar visibility |

---

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| Vanilla HTML/CSS/JS | Core application (no frameworks) |
| [PDF.js](https://mozilla.github.io/pdf.js/) | PDF rendering |
| [Mammoth.js](https://github.com/mwilliamson/mammoth.js) | DOCX → HTML conversion |
| [JSZip](https://stuk.github.io/jszip/) | EPUB (ZIP) extraction |
| IndexedDB | Client-side persistent storage |
| Readex Pro + Noto Kufi Arabic | Typography |
| Google Fonts CDN | Font delivery |

---

## 📄 License

MIT License — © IIDZII 2025

---

</div>

<div dir="rtl" style="text-align: right;">

---

# 📖 قارئ IIDZII

[![ثابت](https://img.shields.io/badge/ثابت-HTML%2FCSS%2FJS-blue)]()
[![صفحات GitHub](https://img.shields.io/badge/نشر-GitHub%20Pages-green)]()
[![رخصة](https://img.shields.io/badge/رخصة-MIT-yellow)]()
[![لغات](https://img.shields.io/badge/لغات-عربي%20%7C%20EN-orange)]()

قارئ كتب إلكترونية جريء وعملي مبني بـ HTML و CSS و JavaScript خالص. مصمم للقراء الذين يقدّرون الوظيفة على الزخرفة — واجهة بروتالية مع طباعة تحريرية.

---

## ✨ الميزات

### دعم الصيغ
- **TXT** — تحليل ذكي مع كشف تلقائي للعناوين (يدعم علامات `===` و `##` و `###`)
- **PDF** — عارض PDF.js مدمج مع التحكم بالتكبير والتنقل بين الصفحات والتوافق مع الثيمات
- **DOCX** — تحويل عبر Mammoth.js يحافظ على بنية المستند
- **EPUB** — تحليل كامل لملفات EPUB باستخدام JSZip مع عرض الفصول بترتيبها الصحيح

### تجربة القراءة
- 📄 وضع **صفحات** أو **تمرير مستمر**
- 🔍 **بحث** داخل الكتاب مع تمييز النتائج
- 📑 **فهرس تلقائي** من العناوين
- ⭐ **إشارات مرجعية** — حفظ وإدارة مواقع الصفحات
- 🎯 **وضع التركيز** — يبرز الفقرة الحالية ويغمّق البقية
- 📏 **تحكم** بحجم الخط (12–32 بكسل) وارتفاع السطر
- 📊 **شريط التقدم** أعلى الشاشة
- 🔔 **تنبيهات الصفحة والفصل** — تراكب مؤقت يظهر الموضع عند التنقل

### التصميم
- **3 ثيمات**: فاتح ☀️ · داكن 🌙 · AMOLED ⚫
- **هجين بروتالي-تحريري** — حدود جريئة، ألوان صلبة، زوايا مقطوعة، بلا ظلال، بلا تدرجات
- **يمين-يسار / يسار-يمين** — دعم كامل للعربية والإنجليزية مع تبديل تلقائي للاتجاه
- **شريط أدوات مخفي تلقائياً** — تتراجع الواجهة أثناء القراءة وتعود عند التفاعل
- **متجاوب** — يعمل على الجوال والجهاز اللوحي والحاسوب

### البيانات والتخزين
- **IndexedDB** — حفظ تقدم القراءة والإشارات المرجعية والإعدادات محلياً
- **متابعة القراءة** — الشاشة الرئيسية تعرض آخر كتاب مفتوح
- **مقترحات محملة مسبقاً** — 4 قصص قصيرة أصلية (عربيتان + إنجليزيتان)

---

## 🚀 البدء السريع

### الخيار 1: فتح مباشر
افتح `index.html` في أي متصفح حديث.

### الخيار 2: صفحات GitHub
1. ارفع المشروع إلى مستودع GitHub
2. اذهب إلى **الإعدادات → الصفحات**
3. اختر فرع `main` كمصدر
4. القارئ متاح على `https://username.github.io/repo-name/`

### الخيار 3: أي مضيف ثابت
ارفع جميع الملفات إلى Netlify أو Vercel أو Cloudflare Pages أو أي خدمة استضافة ثابتة.

> **لا حاجة لخطوة بناء.** بدون Node.js أو npm أو حزم.

---

## 📁 هيكل المشروع

```
ebook-reader/
├── index.html              # بنية HTML الرئيسية
├── style.css               # جميع الأنماط والثيمات
├── app.js                  # منطق التطبيق
├── suggestions/
│   ├── manifest.json       # بيانات الكتب
│   ├── ar/
│   │   ├── runes_of_silence.txt   # رموز الصمت (خيال)
│   │   └── digital_oasis.txt      # واحة رقمية (سايبربانك)
│   └── en/
│       ├── neon_prophet.txt       # The Neon Prophet
│       └── last_algorithm.txt     # The Last Algorithm
└── README.md
```

---

## ⌨️ اختصارات لوحة المفاتيح

| المفتاح | الإجراء |
|---------|---------|
| `←` / `→` / `↑` / `↓` | التنقل بين الصفحات |
| `b` | تبديل الإشارة المرجعية |
| `f` | تبديل وضع التركيز |
| `Esc` | إغلاق اللوحة / العودة للرئيسية |

---

## 📱 إيماءات اللمس

| الإيماءة | الإجراء |
|----------|---------|
| سحب يسار/يمين | قلب الصفحات (يراعي اتجاه RTL/LTR) |
| النقر على منطقة المحتوى | تبديل ظهور شريط الأدوات |

---

## 🛠 الحزمة التقنية

| التقنية | الغرض |
|---------|-------|
| HTML/CSS/JavaScript خالص | التطبيق الأساسي (بدون أطر عمل) |
| [PDF.js](https://mozilla.github.io/pdf.js/) | عرض PDF |
| [Mammoth.js](https://github.com/mwilliamson/mammoth.js) | تحويل DOCX → HTML |
| [JSZip](https://stuk.github.io/jszip/) | استخراج EPUB (ZIP) |
| IndexedDB | تخزين محلي دائم |
| Readex Pro + Noto Kufi Arabic | الطباعة |
| Google Fonts CDN | توصيل الخطوط |

---

## 📄 الرخصة

رخصة MIT — © IIDZII 2025

</div>
