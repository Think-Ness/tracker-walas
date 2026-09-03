# DESIGN.md
# Class & Student Monitoring System
### Design System & UI/UX Specification

**Version:** 1.0  
**Design Direction:** Formal Modern / Administrative / Academic  
**Primary Reference:** Laravel ecosystem / modern institutional web applications

---

# 1. Design Philosophy

Aplikasi harus terlihat seperti **sistem administrasi akademik profesional**, bukan aplikasi AI, social media, atau consumer SaaS.

Visual identity harus memberikan kesan:

- Formal
- Tenang
- Bersih
- Profesional
- Akademik
- Terpercaya
- Efisien
- Modern tetapi tidak trendy berlebihan

### Core Principle

> **Content over decoration.**

Interface harus mengutamakan data, hierarchy, readability, dan efficiency.

---

# 2. Explicitly Avoid — Anti AI-Slop

Developer **WAJIB menghindari** pola visual berikut:

### ❌ No Gradient

Jangan menggunakan:

```text
linear-gradient(...)
radial-gradient(...)
```

kecuali terdapat alasan fungsional yang sangat kuat.

Default UI harus menggunakan warna solid.

---

### ❌ No Excessive Rounded Cards

Jangan membuat setiap section menjadi floating card besar dengan radius tinggi.

Avoid:

```text
┌─────────────────────────────┐
│                             │
│       HUGE CARD             │
│                             │
└─────────────────────────────┘
```

Gunakan layout berbasis:

- section;
- border;
- table;
- tabs;
- panels;
- dividers.

---

### ❌ No Glassmorphism

Hindari:

- backdrop blur;
- translucent cards;
- glass panels;
- frosted glass;
- glowing backgrounds.

---

### ❌ No Neon / Glow

Hindari:

- neon blue;
- neon purple;
- glowing borders;
- glowing buttons;
- excessive shadows.

---

### ❌ No Decorative Blobs

Jangan menggunakan:

- abstract blobs;
- floating shapes;
- decorative circles;
- background waves;
- random geometric decorations.

---

### ❌ No Excessive Emojis

Emoji **bukan bagian dari visual language utama aplikasi**.

Jangan menggunakan emoji sebagai icon navigasi:

```text
👥 Kelas
🎓 Mahasiswa
📊 Dashboard
🤖 AI
```

Gunakan icon library yang konsisten.

---

### ❌ No AI Marketing Aesthetic

Jangan menggunakan:

- "AI magic" effects;
- sparkles;
- holographic effects;
- purple gradient;
- glowing AI buttons;
- animated AI backgrounds.

AI adalah **functional tool**, bukan dekorasi visual.

---

# 3. Visual Reference

Aplikasi dapat mengambil inspirasi dari:

- Laravel ecosystem
- Laravel Nova
- Laravel Pulse
- GitHub
- Linear
- modern administrative systems

Namun jangan menyalin UI secara langsung.

Target:

> **Institutional software with modern UX.**

---

# 4. Layout

Desktop menggunakan struktur:

```text
┌──────────────────────────────────────────────────────┐
│ Header                                               │
├───────────────┬──────────────────────────────────────┤
│               │                                      │
│ Sidebar       │ Main Content                         │
│               │                                      │
│ Navigation    │                                      │
│               │                                      │
│               │                                      │
└───────────────┴──────────────────────────────────────┘
```

Desktop:

- Sidebar: 240–260px
- Main content: flexible
- Maximum content width: 1440px
- Page padding: 24–32px

---

# 5. Sidebar

Sidebar harus sederhana.

Contoh:

```text
MONITORING

Dashboard

Kelas
  └─ Kelas 6 D

Mahasiswa
  └─ Mata Kuliah

Laporan

────────────────

SETTINGS
```

Icon hanya digunakan sebagai visual support.

Icon:

- 16–18px
- consistent stroke
- no colorful icons

Sidebar tidak boleh terlalu ramai.

---

# 6. Mobile Navigation

Pada mobile:

Sidebar berubah menjadi:

- drawer;
- sheet;
- atau mobile navigation.

Top bar:

```text
┌─────────────────────────────┐
│ ☰   Class Monitor      ◯   │
└─────────────────────────────┘
```

Gunakan icon, bukan emoji.

Bottom navigation dapat digunakan jika terbukti meningkatkan usability.

---

# 7. Typography

Gunakan typography yang clean dan highly readable.

Recommended:

### Primary

```text
Inter
```

Alternative:

```text
system-ui
```

Font harus terasa seperti administrative software, bukan landing page marketing.

---

# 8. Type Scale

### Page Title

```text
24–28px
font-weight: 600
line-height: 1.25
```

### Section Heading

```text
18–20px
font-weight: 600
```

### Card / Panel Heading

```text
15–16px
font-weight: 600
```

### Body

```text
14px
line-height: 1.5
```

### Secondary

```text
13px
```

### Caption

```text
12px
```

Jangan menggunakan font size terlalu besar.

---

# 9. Font Weight

Gunakan secara restrained:

```text
400 — body
500 — labels / navigation
600 — headings
700 — rare emphasis
```

Hindari penggunaan bold pada seluruh interface.

---

# 10. Color System

Color palette harus neutral.

### Background

```text
#FFFFFF
```

Primary application background:

```text
#F8FAFC
```

Secondary background:

```text
#F1F5F9
```

---

## Text

Primary:

```text
#0F172A
```

Secondary:

```text
#475569
```

Muted:

```text
#64748B
```

Disabled:

```text
#94A3B8
```

---

# 11. Borders

Border harus subtle.

Default:

```text
#E2E8F0
```

Strong:

```text
#CBD5E1
```

Default:

```css
border: 1px solid #E2E8F0;
```

---

# 12. Primary Color

Gunakan satu primary accent.

Recommended:

```text
Indigo / Blue
```

Contoh:

```text
#2563EB
```

Hover:

```text
#1D4ED8
```

Active:

```text
#1E40AF
```

Primary color hanya untuk:

- primary action;
- active navigation;
- links;
- selected state;
- important indicators.

Jangan mewarnai seluruh dashboard dengan primary color.

---

# 13. Semantic Colors

Gunakan warna hanya ketika mempunyai makna.

### Success

```text
#16A34A
```

### Warning

```text
#D97706
```

### Danger

```text
#DC2626
```

### Info

```text
#2563EB
```

Background semantic harus sangat subtle.

Contoh:

```text
Success background:
#F0FDF4

Warning background:
#FFFBEB

Danger background:
#FEF2F2
```

---

# 14. Border Radius

Gunakan radius kecil sampai medium.

Recommended:

```text
4px  → compact controls
6px  → buttons / inputs
8px  → cards / panels
```

Default:

```text
6px
```

Hindari:

```text
rounded-full
rounded-3xl
rounded-[32px]
```

kecuali untuk avatar atau status pill.

---

# 15. Shadows

Shadow harus minimal.

Default:

```text
none
```

Untuk dropdown/modal:

```text
0 4px 12px rgba(...)
```

Jangan menggunakan large dramatic shadows.

Interface harus terasa **flat dan solid**.

---

# 16. Cards

Card bukan elemen utama untuk setiap informasi.

Gunakan card hanya ketika informasi memang perlu dikelompokkan.

Preferred:

```text
┌───────────────────────────────┐
│ Section title                 │
│───────────────────────────────│
│ Content                       │
└───────────────────────────────┘
```

Bukan:

```text
╭──────────────────────╮
│ ✨ AMAZING            │
│                      │
│ 32                   │
│ Members              │
╰──────────────────────╯
```

---

# 17. Dashboard KPI

Dashboard boleh menggunakan statistic cards.

Contoh:

```text
┌───────────────┐
│ Total Anggota │
│               │
│ 32            │
│ +4 bulan ini  │
└───────────────┘
```

Rules:

- no gradients;
- no illustrations;
- no emojis;
- minimal decoration;
- number is primary;
- label secondary.

---

# 18. Buttons

Buttons harus terlihat seperti administrative controls.

Primary:

```text
[ Simpan ]
```

Secondary:

```text
[ Batal ]
```

Outline:

```text
[ Export ]
```

Danger:

```text
[ Hapus ]
```

Button height:

```text
36–40px
```

Mobile:

```text
44px minimum
```

---

# 19. Button Hierarchy

Dalam satu section:

**maksimal satu primary action.**

Contoh:

```text
Tambah Anggota
```

Primary.

Sedangkan:

```text
Import
Export
Filter
```

secondary/outline.

Jangan membuat:

```text
[Tambah] [Import] [Export] [AI] [Analyze] [Magic]
```

semuanya primary.

---

# 20. Forms

Forms harus terasa seperti sistem administrasi.

Label berada di atas input.

```text
Nama Lengkap

[ Ahmad Fauzan                     ]

Stambuk

[ 123456                           ]
```

Jangan menggunakan placeholder sebagai satu-satunya label.

---

# 21. Input Style

Default:

```text
height: 40px
border: 1px solid #CBD5E1
border-radius: 6px
background: #FFFFFF
```

Focus:

```text
border-color: primary
```

Focus ring harus subtle.

---

# 22. Tables

Tables adalah salah satu komponen utama aplikasi.

Gunakan table untuk:

- daftar anggota;
- daftar mahasiswa;
- daftar mata kuliah;
- assessment;
- monitoring;
- reports.

Contoh:

```text
┌────┬──────────────┬────────┬─────────┐
│    │ Nama         │ Kelas  │ Status  │
├────┼──────────────┼────────┼─────────┤
│ 01 │ Ahmad        │ 6 D    │ Aktif   │
│ 02 │ Budi         │ 6 D    │ Aktif   │
└────┴──────────────┴────────┴─────────┘
```

Header:

- subtle background;
- 12–13px;
- medium weight;
- uppercase optional tetapi jangan berlebihan.

---

# 23. Table Interaction

Desktop:

- row hover;
- sortable columns;
- pagination;
- filter;
- search.

Mobile:

Jangan memaksakan tabel desktop.

Gunakan:

- horizontal scrolling jika data tabular penting;
- responsive list;
- compact cards bila diperlukan.

---

# 24. Status Badge

Gunakan status badge untuk informasi singkat.

Contoh:

```text
Active
Archived
Completed
Pending
Needs Attention
```

Style:

- small;
- subtle;
- no gradient.

---

# 25. Tabs

Gunakan tabs untuk halaman detail.

Contoh:

```text
Overview | Monitoring | Insya' | Potensi | Timeline
```

Active tab:

- primary text;
- subtle bottom border.

Jangan menggunakan large pill tabs.

---

# 26. Modal

Modal hanya untuk action sederhana.

Contoh:

```text
Tambah Anggota

Nama
[________________]

Stambuk
[________________]

[ Batal ] [ Simpan ]
```

Jangan memasukkan form yang sangat panjang ke modal.

Gunakan dedicated page atau drawer.

---

# 27. Drawer

Drawer cocok untuk:

- quick monitoring;
- quick assessment;
- preview detail;
- filter.

Contoh:

```text
┌──────────────────────┐
│ Quick Monitoring     │
│──────────────────────│
│ Member               │
│ [ Ahmad ]             │
│                      │
│ Category             │
│ [ Discipline ]        │
│                      │
│ Rating               │
│ [ 4 ]                │
│                      │
│ [ Save ]             │
└──────────────────────┘
```

---

# 28. Empty State

Empty state harus informatif dan minimal.

Contoh:

```text
Belum ada mata kuliah

Tambahkan mata kuliah pertama untuk
mulai mengelola penilaian mahasiswa.

[ + Tambah Mata Kuliah ]
```

Jangan menggunakan ilustrasi besar.

---

# 29. Loading State

Gunakan:

- skeleton;
- spinner kecil;
- disabled state.

Hindari loading animation yang dekoratif.

---

# 30. Toast

Toast digunakan untuk feedback singkat.

Success:

```text
Data berhasil disimpan.
```

Error:

```text
Data gagal disimpan.
```

Tidak perlu emoji.

---

# 31. Confirmation

Gunakan confirmation untuk:

- delete;
- archive;
- reset;
- destructive actions.

Contoh:

```text
Hapus anggota?

Data monitoring terkait juga dapat
terpengaruh oleh tindakan ini.

[Batal] [Hapus]
```

---

# 32. Dashboard Layout

Dashboard harus fokus pada information hierarchy.

Recommended:

```text
Page Header
↓
KPI
↓
Main Analytics
↓
Actionable Items
↓
Recent Activity
```

Contoh:

```text
Kelas 6 D

32 Anggota | 27 Terpantau | 5 Belum

─────────────────────────────

Perkembangan Kelas

[ chart ]

─────────────────────────────

Perlu Perhatian

[ table ]

─────────────────────────────

Aktivitas Terbaru

[ timeline ]
```

---

# 33. Charts

Charts harus sederhana.

Gunakan:

- line chart;
- bar chart;
- simple progress indicators.

Avoid:

- 3D charts;
- donut chart berlebihan;
- animated charts;
- gradient charts;
- excessive colors.

Satu chart sebaiknya memiliki satu tujuan analisis.

---

# 34. Mental Monitoring UI

Monitoring mental harus terasa seperti **professional observation record**, bukan social media profile.

Contoh:

```text
Monitoring

Tanggal        03 Sep 2026

Kategori       Kedisiplinan

Rating         4 / 5

Catatan
────────────────────────────
Menunjukkan peningkatan dalam
konsistensi mengikuti kegiatan.
```

---

# 35. Academic Assessment UI

Untuk dosen, prioritaskan bulk entry.

Contoh:

```text
Metodologi Penelitian
Presentasi

Nama                 Score
────────────────────────────
Ahmad                  85
Budi                   90
Candra                 78
Dimas                    -
```

Action:

```text
[ Simpan Perubahan ]
```

Jangan membuat dosen membuka modal satu per satu untuk memasukkan 30 nilai.

---

# 36. AI UI

AI harus terlihat sebagai **tool**, bukan pusat desain.

Recommended:

```text
AI Analysis

[ Generate Analysis ]
```

Setelah proses:

```text
Analysis Result

Summary
...

Strengths
...

Areas for Improvement
...

Suggested Report Draft
...

[ Edit ]
[ Regenerate ]
```

Jangan:

```text
✨ AI MAGIC ✨
```

Jangan gunakan purple gradient.

---

# 37. AI Disclosure

Setiap hasil AI harus diberi label:

```text
AI-generated draft
```

atau:

```text
Generated with AI — review before use.
```

Tujuan:

> Memastikan guru/dosen memahami bahwa hasil AI adalah bantuan, bukan penilaian final.

---

# 38. Report UI

Report harus terlihat formal.

Gunakan:

- heading;
- metadata;
- table;
- section divider;
- typography.

Contoh:

```text
PERKEMBANGAN ANGGOTA

Nama       Ahmad Fauzan
Stambuk    123456
Kelas      6 D

──────────────────────────

Mental Development

...

Academic Potential

...

Teacher Notes

...
```

---

# 39. Workspace Selector

Workspace selector harus sederhana.

```text
Pilih Workspace

Kelas
Monitoring anggota kelas

Mahasiswa
Mata kuliah dan penilaian

Pengaturan
Konfigurasi sistem
```

Gunakan icon monochrome kecil jika diperlukan.

---

# 40. Navigation Labels

Gunakan istilah yang jelas.

Preferred:

```text
Dashboard
Kelas
Anggota
Monitoring
Insya'
Potensi Akademik

Mahasiswa
Mata Kuliah
Penilaian

Laporan
Pengaturan
```

Avoid marketing terminology seperti:

```text
Insights
Magic
AI Hub
Smart Center
Performance Lab
```

kecuali benar-benar diperlukan.

---

# 41. Spacing System

Gunakan spacing konsisten.

Base:

```text
4px
```

Scale:

```text
4
8
12
16
20
24
32
40
48
64
```

Default content spacing:

```text
16–24px
```

Section spacing:

```text
24–32px
```

---

# 42. Responsive Breakpoints

Gunakan Tailwind standard breakpoints.

```text
sm  → 640px
md  → 768px
lg  → 1024px
xl  → 1280px
2xl → 1536px
```

Mobile-first development.

---

# 43. Mobile Rules

Mobile bukan versi desktop yang diperkecil.

Prioritas:

```text
Search
Quick Add
Quick Monitoring
Quick Assessment
Profile
Timeline
```

Table kompleks dapat berubah menjadi list/card.

Action utama dapat menjadi sticky bottom action.

---

# 44. Accessibility

Minimum:

- keyboard navigation;
- visible focus;
- sufficient contrast;
- semantic HTML;
- aria-label untuk icon-only buttons;
- form labels;
- error messages;
- touch target minimum 44px pada mobile.

Jangan mengandalkan warna saja untuk menyampaikan status.

---

# 45. Icon System

Gunakan satu icon library.

Recommended:

**Lucide Icons**

Style:

- outline;
- consistent stroke;
- monochrome;
- 16–20px.

Do not mix multiple icon styles.

---

# 46. Animation

Animation sangat minimal.

Allowed:

- modal fade;
- drawer slide;
- dropdown;
- subtle hover;
- skeleton loading.

Duration:

```text
100–200ms
```

Avoid:

- bouncing;
- floating;
- spinning decorative objects;
- excessive page transitions;
- animation on every interaction.

---

# 47. Data Density

Karena aplikasi merupakan administrative system, interface boleh memiliki **moderate-high information density**.

Jangan membuat semua elemen terlalu besar.

Target:

> User dapat melihat banyak informasi tanpa merasa sesak.

---

# 48. Desktop Density

Desktop:

- compact table rows;
- clear columns;
- dense dashboard;
- side-by-side sections.

---

# 49. Mobile Density

Mobile:

- one primary action;
- simplified navigation;
- stacked information;
- collapsible sections;
- readable spacing.

---

# 50. Dark Mode

Dark mode **tidak menjadi prioritas MVP**.

Jika diterapkan:

- jangan menggunakan pure black;
- jangan menggunakan neon;
- pertahankan contrast;
- pertahankan semantic colors.

Light mode adalah default.

---

# 51. Design Token Concept

Gunakan centralized design tokens.

Contoh:

```text
--background
--foreground
--muted
--border
--primary
--primary-foreground
--success
--warning
--danger
--radius
```

Jangan menyebarkan hardcoded colors ke seluruh komponen.

---

# 52. Component Architecture

Komponen UI harus reusable.

Contoh:

```text
components/
├── ui/
│   ├── Button
│   ├── Input
│   ├── Select
│   ├── Dialog
│   ├── Drawer
│   ├── Table
│   ├── Badge
│   ├── Tabs
│   ├── Card
│   └── Toast
│
├── layout/
│   ├── Sidebar
│   ├── Header
│   └── PageHeader
│
├── monitoring/
│   ├── MonitoringForm
│   ├── MonitoringTimeline
│   └── MonitoringSummary
│
└── academic/
    ├── AssessmentTable
    ├── GradeSummary
    └── CourseCard
```

---

# 53. Page Header Pattern

Setiap halaman menggunakan pola konsisten:

```text
Page Title
Short description

                         Primary Action
```

Contoh:

```text
Anggota

Daftar anggota kelas 6 D.

                              [ + Tambah Anggota ]
```

---

# 54. Detail Page Pattern

```text
Breadcrumb

Page Header

Primary Information

Tabs

Content
```

Contoh:

```text
Kelas / Anggota / Ahmad Fauzan

Ahmad Fauzan
Stambuk 123456 · Kelas 6 D

Overview | Monitoring | Insya' | Potensi

────────────────────────────
Content
```

---

# 55. Breadcrumb

Gunakan breadcrumb pada halaman yang memiliki nested hierarchy.

Contoh:

```text
Kelas / Kelas 6 D / Anggota / Ahmad Fauzan
```

Breadcrumb harus:

- kecil;
- muted;
- clickable pada parent;
- tidak terlalu dominan.

---

# 56. Search

Search harus mudah ditemukan pada data-heavy pages.

Contoh:

```text
[ Cari nama, stambuk...              ]
```

Gunakan debounce.

---

# 57. Filter

Filter menggunakan:

- dropdown;
- popover;
- drawer pada mobile.

Contoh:

```text
[ Semua Kelas ] [ Semua Rayon ] [ Status ]
```

Active filter harus terlihat.

---

# 58. Accessibility of Data

Data penting harus dapat dibaca tanpa:

- hover;
- color-only indicators;
- animation.

---

# 59. Overall Visual Example

Target visual:

```text
┌──────────────────────────────────────────────────────┐
│ Class Monitor                              Account   │
├──────────────┬───────────────────────────────────────┤
│              │                                       │
│ Dashboard    │ Kelas 6 D                             │
│ Kelas        │                                       │
│ Mahasiswa    │ 32 Anggota                            │
│ Laporan      │                                       │
│              │ ┌────────┐ ┌────────┐ ┌────────┐    │
│              │ │ 32     │ │ 27     │ │ 5      │    │
│              │ │ Anggota│ │Monitor │ │Belum   │    │
│              │ └────────┘ └────────┘ └────────┘    │
│              │                                       │
│              │ Perkembangan                          │
│              │ ───────────────────────────────       │
│              │                                       │
│              │ Anggota                               │
│              │ ┌─────────────────────────────────┐   │
│              │ │ Nama       Kelas    Status      │   │
│              │ │ Ahmad      6 D      Aktif       │   │
│              │ │ Budi       6 D      Aktif       │   │
│              │ └─────────────────────────────────┘   │
│              │                                       │
└──────────────┴───────────────────────────────────────┘
```

Visual harus terasa seperti **professional internal software**, bukan landing page.

---

# 60. Final Design Rule

Jika developer harus memilih antara:

**A. Visual yang lebih menarik**

dan

**B. Interface yang lebih jelas dan efisien**

pilih:

> **B. Clarity and efficiency.**

Jika sebuah elemen dekoratif tidak membantu user memahami data atau menyelesaikan pekerjaan:

> **Remove it.**

Jika sebuah animation tidak membantu feedback atau navigation:

> **Remove it.**

Jika sebuah color tidak memiliki semantic purpose:

> **Remove it.**

Jika sebuah card hanya digunakan karena "dashboard harus banyak card":

> **Remove it.**

---

# 61. Design North Star

Aplikasi harus memberikan kesan:

> **"Ini adalah software administrasi akademik yang serius dan dibuat untuk digunakan setiap hari."**

Bukan:

> "Ini adalah aplikasi AI yang sedang mencoba terlihat keren."

Final visual characteristics:

**Formal + Modern + Minimal + Dense + Clear + Academic + Functional**

No:

**Gradient + Glassmorphism + Neon + Emoji + Glow + Excessive Rounded Cards + AI Slop**

# 62. Theme Implementation Rules

Bagian ini bersifat **mandatory implementation rules**. Developer tidak boleh mengganti arah visual yang telah ditentukan tanpa alasan UX yang jelas.

---

## 62.1 Theme Architecture

Theme harus menggunakan **design tokens**, bukan hardcoded styling yang tersebar di seluruh aplikasi.

Semua warna, radius, shadow, typography, spacing, dan semantic states harus didefinisikan secara terpusat.

Recommended structure:

```text
styles/
├── globals.css
├── tokens.css
└── theme.css
```

atau menggunakan CSS variables yang didefinisikan pada root.

Contoh:

```css
:root {
  --background: #ffffff;
  --foreground: #0f172a;

  --muted: #64748b;
  --border: #e2e8f0;

  --primary: #2563eb;
  --primary-foreground: #ffffff;

  --success: #16a34a;
  --warning: #d97706;
  --danger: #dc2626;

  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
}
```

Component tidak boleh mendefinisikan warna aplikasi sendiri jika token yang sesuai sudah tersedia.

---

# 62.2 Single Source of Truth

Theme harus memiliki satu sumber kebenaran.

Jangan melakukan:

```css
.button {
  color: #2563eb;
}
```

di banyak file.

Gunakan:

```css
.button {
  color: var(--primary);
}
```

Dengan demikian perubahan tema dapat dilakukan dari satu tempat.

---

# 62.3 Tailwind Theme Integration

Jika menggunakan Tailwind CSS, seluruh design token harus diintegrasikan ke dalam theme Tailwind.

Developer tidak dianjurkan menggunakan arbitrary values secara berlebihan.

Avoid:

```text id="v5o0dg"
rounded-[7px]
text-[#263238]
bg-[#f7f8fa]
```

Prefer semantic tokens:

```text id="t6u5in"
rounded-md
text-foreground
bg-background
border-border
text-muted-foreground
bg-primary
```

Arbitrary value hanya boleh digunakan jika memang tidak dapat direpresentasikan oleh design token.

---

# 62.4 Color Usage Rules

Primary color harus digunakan secara terbatas.

Gunakan primary untuk:

* primary button;
* active navigation;
* selected state;
* links;
* focused controls;
* important interactive elements.

Jangan menggunakan primary sebagai:

* background seluruh halaman;
* background seluruh card;
* warna semua icon;
* warna semua heading;
* dekorasi.

---

# 62.5 Neutral-First Design

Mayoritas interface harus menggunakan neutral colors.

Target visual:

```text
Neutral      = dominant
Primary      = interaction
Semantic     = status
```

Bukan:

```text
Primary      = dominant
Gradient     = decoration
Many colors  = visual interest
```

Interface harus tetap terlihat profesional bahkan jika seluruh decorative colors dihilangkan.

---

# 62.6 Semantic Color Only

Warna merah, hijau, kuning, dan biru harus memiliki makna.

Contoh:

```text
Green  → success / completed
Yellow → warning / needs attention
Red    → error / destructive
Blue   → information / primary interaction
```

Jangan menggunakan warna semantic hanya untuk membuat dashboard lebih "berwarna".

---

# 62.7 No Gradient Rule

Gradient tidak boleh digunakan pada:

* background;
* button;
* card;
* statistic;
* chart;
* badge;
* hero;
* AI component.

Default:

```text
background: solid color
```

Jika library/component pihak ketiga menggunakan gradient secara default, override styling tersebut.

---

# 62.8 No Glass / Blur

Jangan menggunakan:

```css
backdrop-filter: blur(...);
```

untuk UI utama.

Tidak diperbolehkan menggunakan:

* glass card;
* translucent dashboard;
* frosted navigation;
* transparent gradient panel.

Exception hanya jika dibutuhkan untuk modal overlay atau native browser behavior, bukan sebagai visual style.

---

# 62.9 Border-First UI

Gunakan border untuk membedakan section dan grouping sebelum menggunakan shadow.

Preferred:

```text id="d1d9b4"
border + background
```

rather than:

```text id="g6zjj0"
large shadow + floating card
```

Default card:

```css
border: 1px solid var(--border);
box-shadow: none;
```

---

# 62.10 Shadow Rules

Shadow hanya digunakan untuk hierarchy yang benar-benar floating:

* dropdown;
* popover;
* modal;
* command menu;
* floating drawer.

Normal:

* page section → no shadow;
* table → no shadow;
* card → no shadow;
* KPI → no shadow.

---

# 62.11 Radius Rules

Gunakan radius secara konsisten.

```text
sm = 4px
md = 6px
lg = 8px
```

Default component:

```text
6px
```

Avatar/status indicator dapat menggunakan:

```text
rounded-full
```

Jangan menggunakan radius besar untuk seluruh aplikasi.

---

# 62.12 Typography Rules

Typography harus menjadi salah satu alat utama untuk menciptakan hierarchy.

Gunakan:

```text
font-size
font-weight
line-height
color
spacing
```

bukan dekorasi.

Heading harus dibedakan dari body melalui:

* ukuran;
* weight;
* spacing.

Jangan menggunakan:

* giant typography;
* text gradient;
* outlined text;
* decorative fonts.

---

# 62.13 Font Loading

Jika menggunakan Inter atau font eksternal:

* load hanya required weights;
* hindari loading seluruh font variants;
* gunakan `next/font` jika menggunakan Next.js;
* jangan mengandalkan external CSS import jika dapat menggunakan built-in optimization.

Recommended weights:

```text
400
500
600
700
```

Jika 700 tidak diperlukan, jangan load.

---

# 62.14 Dark Mode

Dark mode tidak menjadi prioritas MVP.

Namun architecture harus **dark-mode ready**.

Jangan hardcode:

```css
background: white;
color: black;
```

pada component.

Gunakan semantic tokens:

```text
bg-background
text-foreground
border-border
```

Sehingga dark mode dapat ditambahkan kemudian tanpa refactor besar.

---

# 62.15 Theme Switching

MVP:

```text
Light Theme
```

sebagai default.

Jika theme switcher ditambahkan:

```text
System
Light
Dark
```

Theme preference harus disimpan secara lokal dan tidak boleh mengubah data aplikasi.

Theme switching hanya mengubah presentation layer.

---

# 62.16 Component Theme Contract

Setiap reusable component harus mengikuti semantic theme tokens.

Contoh:

### Button

Button tidak boleh memiliki:

```text
BlueButton
GreenButton
PurpleButton
```

yang dibuat hanya untuk variasi visual.

Gunakan semantic variants:

```text
primary
secondary
outline
ghost
destructive
```

---

# 62.17 Component Variants

Gunakan variant system.

Contoh:

```text id="0h21u6"
Button
├── primary
├── secondary
├── outline
├── ghost
└── destructive
```

Badge:

```text id="1d6n5a"
Badge
├── default
├── success
├── warning
├── danger
└── info
```

Jangan membuat component baru hanya karena perubahan warna kecil.

---

# 62.18 Icon Rules

Semua icon harus berasal dari satu icon system.

Recommended:

**Lucide Icons**

Rules:

* consistent stroke;
* consistent size;
* monochrome by default;
* no colorful icon sets;
* no emoji as UI icon.

Default sizes:

```text
16px → inline / table
18px → navigation
20px → buttons
24px → page-level actions
```

---

# 62.19 Icon + Text

Untuk action penting, gunakan:

```text
[ icon ] Text
```

bukan icon-only jika maknanya tidak obvious.

Contoh:

```text
[+] Tambah Anggota
```

lebih baik daripada:

```text
[+]
```

Icon-only button wajib memiliki accessible label.

---

# 62.20 AI Theme Isolation

AI functionality tidak boleh mengubah visual identity aplikasi.

AI component tetap menggunakan:

* normal border;
* normal typography;
* normal primary color;
* normal spacing.

Tidak boleh menggunakan:

* purple gradient;
* sparkle icon;
* glow;
* animated gradient;
* holographic effect.

AI harus terlihat sebagai **fitur aplikasi**, bukan brand terpisah.

---

# 62.21 AI Button

Preferred:

```text
[ Analisis dengan AI ]
```

Avoid:

```text
[ ✨ Magic AI ✨ ]
```

AI action harus memiliki nama yang menjelaskan fungsi.

Contoh:

```text
Analisis Perkembangan
Buat Draft Raport
Ringkas Performa
Buat Feedback
```

---

# 62.22 Responsive Theme Consistency

Theme tidak boleh berubah menjadi visual style berbeda pada mobile.

Yang berubah hanya:

* layout;
* spacing;
* navigation;
* information density.

Contoh:

Desktop:

```text
Sidebar + Content
```

Mobile:

```text
Header + Drawer
```

Tetapi typography, color system, radius, dan component language tetap konsisten.

---

# 62.23 Mobile Touch Rules

Interactive controls pada mobile harus memiliki target minimal sekitar:

```text
44 × 44px
```

Walaupun visual icon hanya:

```text
18–20px
```

Jangan membuat icon button terlalu kecil hanya karena ingin tampilan compact.

---

# 62.24 Focus State

Semua interactive element harus memiliki visible focus state.

Contoh:

```text
Input
Button
Link
Tab
Dropdown
Checkbox
```

Focus indicator tidak boleh hanya mengandalkan perubahan warna yang sangat kecil.

---

# 62.25 Hover State

Hover harus subtle.

Contoh:

```text
background: slightly darker neutral
```

atau:

```text
border: stronger neutral
```

Jangan menggunakan:

* scale animation;
* glow;
* translate;
* color explosion.

---

# 62.26 Active State

Active navigation harus mudah dikenali.

Recommended:

```text
subtle background
+
primary text/icon
```

Bukan:

```text
large colored pill
```

---

# 62.27 Data-Dense Pages

Untuk halaman:

* Members;
* Students;
* Courses;
* Assessments;
* Monitoring;

prioritaskan data density.

Jangan membuat row/table terlalu tinggi hanya untuk menciptakan whitespace.

Whitespace harus digunakan untuk hierarchy, bukan membuang ruang.

---

# 62.28 Dashboard Rule

Dashboard tidak harus penuh.

Jika hanya ada tiga informasi penting, tampilkan tiga informasi penting.

Jangan membuat:

```text
12 cards
8 charts
4 graphs
```

hanya agar dashboard terlihat "lengkap".

Setiap widget harus menjawab pertanyaan user.

---

# 62.29 Chart Theme

Chart harus mengikuti semantic color system.

Default:

* primary;
* neutral;
* semantic colors bila diperlukan.

Tidak boleh setiap series menggunakan warna random.

Hindari:

* rainbow chart;
* gradient area chart;
* 3D chart;
* decorative chart animation.

Chart harus tetap dapat dipahami dalam grayscale.

---

# 62.30 Print Theme

Halaman report yang dicetak harus memiliki print-specific styling.

Saat print:

* hide sidebar;
* hide navigation;
* hide interactive buttons;
* remove shadows;
* remove decorative backgrounds;
* use white background;
* use black/dark text;
* preserve tables;
* preserve headings.

Output harus terlihat seperti **dokumen administrasi resmi**.

---

# 62.31 Print Typography

Untuk laporan:

```text
Title:
18–22px

Section:
14–16px

Body:
11–12px
```

Gunakan line-height yang nyaman untuk dokumen.

---

# 62.32 No Visual Dependency

Informasi penting tidak boleh hanya disampaikan melalui:

* color;
* icon;
* animation.

Contoh buruk:

```text
●
```

untuk membedakan status tanpa label.

Preferred:

```text
Active
Archived
Needs Attention
```

dengan semantic color sebagai tambahan.

---

# 62.33 Empty State Theme

Empty state harus tetap formal.

Preferred:

```text
Belum ada data

Tambahkan data untuk mulai menggunakan fitur ini.

[ Tambah Data ]
```

Avoid:

```text
✨ Nothing here yet! 🚀
```

---

# 62.34 Error State Theme

Error message harus langsung dan informatif.

Preferred:

```text
Gagal menyimpan data.

Periksa koneksi dan coba kembali.
```

Avoid:

```text
Oops! Something went wrong 😭
```

---

# 62.35 Success State Theme

Success message juga harus sederhana.

Preferred:

```text
Data berhasil disimpan.
```

Tidak perlu:

* emoji;
* confetti;
* animation;
* giant success illustration.

---

# 62.36 Theme Quality Gate

Sebelum sebuah halaman dianggap selesai, developer harus melakukan visual review dengan checklist berikut:

```text
[ ] No unnecessary gradient
[ ] No glassmorphism
[ ] No decorative blobs
[ ] No excessive rounded cards
[ ] No emoji UI
[ ] No AI-slop styling
[ ] Colors use design tokens
[ ] Typography follows scale
[ ] Border/radius consistent
[ ] Shadow used only when necessary
[ ] Primary color used sparingly
[ ] Mobile responsive
[ ] Keyboard accessible
[ ] Focus state visible
[ ] Empty state implemented
[ ] Loading state implemented
[ ] Error state implemented
[ ] Print layout considered where applicable
```

---

# 62.37 Developer Decision Rule

Jika developer menemukan kebutuhan UI yang belum diatur dalam `DESIGN.md`, gunakan urutan prioritas:

```text
1. Usability
2. Accessibility
3. Consistency
4. Readability
5. Visual aesthetics
```

Jangan menambahkan visual decoration hanya karena component terlihat terlalu sederhana.

Kesederhanaan adalah bagian dari design system.

---

# 62.38 Final Theme Statement

Seluruh aplikasi harus terasa seperti:

> **Modern institutional software — clean, restrained, information-dense, professional, and trustworthy.**

Bukan:

> **AI startup landing page.**

Visual language:

```text
Neutral
+ Solid colors
+ Thin borders
+ Clear typography
+ Moderate density
+ Minimal shadows
+ Small radius
+ Functional icons
+ Strong information hierarchy
```

Avoid:

```text
Gradient
+ Glass
+ Glow
+ Neon
+ Emoji
+ Excessive radius
+ Decorative illustration
+ AI gimmicks
```
