# PRD — Class & Student Monitoring System

### Product Requirements Document — Version 1.0

**Status:** Draft for Development
**Platform:** Web Application
**Target User:** Wali Kelas / Guru / Dosen
**Frontend:** Next.js App Router + TypeScript
**UI:** Tailwind CSS + modern component library
**Backend & Database:** Supabase PostgreSQL
**Authentication:** Supabase Auth
**Deployment:** Vercel
**AI:** Pluggable AI Provider with Free-Tier Support

---

# 1. Product Overview

## 1.1 Nama Produk

Working name:

**Class & Student Monitoring System**

Nama final dapat ditentukan kemudian.

## 1.2 Tujuan

Aplikasi digunakan oleh **wali kelas, guru, atau dosen** untuk melakukan:

1. Pendataan anggota kelas.
2. Monitoring perkembangan mental dan karakter anggota kelas.
3. Pencatatan insya' dan perkembangan tulisan.
4. Pencatatan potensi akademik.
5. Pencatatan perkembangan anggota secara periodik.
6. Pengelolaan mahasiswa berdasarkan mata kuliah yang diampu.
7. Penilaian mahasiswa berdasarkan berbagai komponen akademik.
8. Pengelolaan tugas, presentasi, PPT, UTS, UAS, keaktifan, dan komponen lain.
9. Analisis perkembangan menggunakan AI.
10. Pembuatan rekap dan laporan.
11. Export data untuk kebutuhan dokumentasi dan pelaporan.

Aplikasi bukan sekadar pengganti Google Form.

Konsep utama:

> **Input → History → Monitoring → Analysis → Report**

---

# 2. Core Concept

Satu user memiliki satu akun.

Setelah login, user masuk ke **Workspace Selector**.

```text
LOGIN
  ↓
WORKSPACE SELECTOR
  ├── 👥 KELAS
  ├── 🎓 MAHASISWA
  └── ⚙ SETTINGS
```

User tidak perlu login ulang ketika berpindah workspace.

---

# 3. User Role

## 3.1 Wali Kelas / Guru / Dosen

Untuk MVP, sistem hanya memiliki satu role utama:

**Owner / Teacher**

User dapat:

* membuat workspace;
* membuat kelas;
* membuat mata kuliah;
* memasukkan anggota;
* memasukkan mahasiswa;
* melakukan monitoring;
* melakukan penilaian;
* mengatur konfigurasi;
* menggunakan AI;
* membuat laporan;
* melakukan export.

### Catatan

Pada V1 belum diperlukan sistem multi-user kompleks.

Arsitektur database tetap harus dibuat agar **multi-user dapat ditambahkan di masa depan**.

---

# 4. Workspace Architecture

Sistem memiliki dua workspace utama.

## 4.1 Class Workspace

Digunakan untuk:

> Monitoring anggota kelas, terutama untuk kebutuhan wali kelas, raport mental, catatan insya', dan potensi akademik.

Contoh:

```text
Kelas 6 D
Tahun Ajaran 2026/2027
```

## 4.2 Student / Course Workspace

Digunakan untuk:

> Monitoring dan penilaian mahasiswa berdasarkan mata kuliah yang diampu.

Contoh:

```text
Mata Kuliah:
Metodologi Penelitian

Semester:
6
```

---

# 5. Login & Authentication

Menggunakan:

**Supabase Auth**

MVP mendukung:

* Email + Password
* Logout
* Session persistence
* Protected routes

Future:

* Google Login
* Microsoft Login
* SSO institusi

Setelah berhasil login:

```text
/login
   ↓
/workspace
```

Jika user hanya memiliki satu workspace, sistem dapat memberikan opsi:

> "Continue to workspace"

Jika memiliki beberapa workspace:

> tampilkan Workspace Selector.

---

# 6. Workspace Selector

Halaman:

`/workspace`

UI:

```text
Selamat Datang 👋

Pilih workspace

┌───────────────────────┐
│ 👥                    │
│ KELAS                 │
│                       │
│ Monitoring Anggota    │
│ 32 Anggota            │
│                       │
│ [Masuk]               │
└───────────────────────┘

┌───────────────────────┐
│ 🎓                    │
│ MAHASISWA             │
│                       │
│ Mata Kuliah & Nilai   │
│ 8 Mata Kuliah         │
│                       │
│ [Masuk]                │
└───────────────────────┘

⚙ Pengaturan
```

---

# 7. CLASS WORKSPACE

## 7.1 Class Setup

User dapat membuat kelas.

Field:

* Nama kelas
* Tahun ajaran
* Tingkat
* Keterangan
* Status aktif

Contoh:

```text
Nama: 6 D
Tahun Ajaran: 2026/2027
Tingkat: Kelas 6
Status: Active
```

---

# 8. Class Member Data

Data anggota kelas:

| Field   | Required |
| ------- | -------- |
| Stambuk | Yes      |
| Nama    | Yes      |
| Kelas   | Yes      |
| Daerah  | Yes      |
| Rayon   | Yes      |

Struktur:

```text
Member
├── Stambuk
├── Nama
├── Kelas
├── Daerah
└── Rayon
```

Fitur:

* Add member
* Edit member
* Delete/archive member
* Search
* Filter
* Sort
* Import Excel
* Export Excel
* Profile detail

---

# 9. Class Member Profile

Setiap anggota memiliki halaman profil.

Contoh:

```text
AHMAD FAUZAN

Stambuk: 123456
Kelas: 6 D
Daerah: Jakarta
Rayon: ...
```

Tabs:

```text
Overview
Monitoring
Insya'
Potensi Akademik
Timeline
AI Insight
```

---

# 10. Mental Monitoring

Sistem harus mendukung monitoring secara periodik.

User dapat membuat:

**Monitoring Record**

Field dasar:

* Member
* Tanggal
* Kategori
* Indikator
* Rating
* Catatan
* Observer
* Period

Contoh:

```text
Tanggal:
3 September 2026

Kategori:
Kedisiplinan

Rating:
4 / 5

Catatan:
Mulai menunjukkan konsistensi dalam mengikuti kegiatan.
```

---

# 11. Monitoring Categories

Kategori tidak boleh hardcoded.

User dapat mengatur kategori melalui:

`Settings → Monitoring`

Default categories:

* Akhlak
* Kedisiplinan
* Tanggung Jawab
* Kepemimpinan
* Kemandirian
* Kepedulian
* Kerja Sama
* Komunikasi
* Keaktifan
* Sikap
* Lainnya

User dapat:

* tambah kategori;
* edit kategori;
* nonaktifkan kategori;
* menentukan urutan.

---

# 12. Rating System

Default:

**1–5**

```text
1 = Sangat Perlu Perhatian
2 = Perlu Perhatian
3 = Cukup
4 = Baik
5 = Sangat Baik
```

Sistem harus memungkinkan konfigurasi skala di masa depan.

---

# 13. Insya' Monitoring

Modul khusus untuk pencatatan perkembangan insya'.

Tujuan:

* menyimpan hasil insya';
* melihat perkembangan kemampuan menulis;
* mencatat tema;
* memberikan evaluasi;
* melihat histori.

Data:

* Tanggal
* Judul/Tema
* Nilai (optional)
* Kategori
* Catatan
* Status
* File/dokumen jika diperlukan di masa depan

Contoh:

```text
03 September 2026

Tema:
Perjalanan

Nilai:
85

Catatan:
Struktur tulisan semakin baik.
Kosakata perlu dikembangkan.
```

---

# 14. Academic Potential

User dapat mencatat potensi akademik anggota.

Default kategori:

* Bahasa Arab
* Bahasa Inggris
* Matematika
* Sains
* Sosial
* Leadership
* Writing
* Public Speaking
* Lainnya

Setiap potensi dapat memiliki:

* bidang;
* rating;
* catatan;
* tanggal;
* status.

Sistem harus membedakan:

**Actual Academic Score**

dan

**Potential / Observation**

Karena potensi tidak selalu sama dengan nilai akademik.

---

# 15. Timeline

Setiap anggota memiliki timeline terpadu.

Contoh:

```text
03 Sep 2026
🧠 Mental Monitoring
Kedisiplinan — 4/5

01 Sep 2026
✍ Insya'
Tema: Perjalanan
Nilai: 85

28 Aug 2026
⭐ Academic Potential
Public Speaking — 5/5

20 Aug 2026
🧠 Mental Monitoring
Leadership — 4/5
```

Timeline dapat difilter berdasarkan:

* tanggal;
* kategori;
* jenis aktivitas.

---

# 16. Class Dashboard

Dashboard harus memberikan gambaran kondisi kelas.

Metrics:

```text
Total Anggota
Monitoring Terbaru
Anggota Belum Dimonitor
Rata-rata Monitoring
```

Contoh:

```text
32 Anggota

27 Terpantau
5 Belum Terpantau

Mental Average
4.2 / 5

Insya'
85.3

Academic Potential
4.1 / 5
```

Dashboard juga menampilkan:

* anggota yang belum dimonitor;
* anggota yang mengalami peningkatan;
* anggota yang perlu perhatian;
* aktivitas monitoring terbaru.

---

# 17. Student / University Workspace

Workspace mahasiswa digunakan untuk pengelolaan:

> Mahasiswa → Mata Kuliah → Penilaian

User terlebih dahulu membuat mata kuliah yang diampu.

Contoh:

```text
MATA KULIAH

Metodologi Penelitian
```

Kemudian memasukkan mahasiswa yang mengikuti mata kuliah tersebut.

---

# 18. Course Data

Setiap mata kuliah memiliki:

* Nama mata kuliah
* Kode mata kuliah (optional)
* Semester
* Tahun akademik
* SKS (optional)
* Keterangan
* Status

Contoh:

```text
Metodologi Penelitian
Kode: MET-601
Semester: 6
SKS: 3
Tahun: 2026/2027
```

---

# 19. Student Data

Data mahasiswa:

| Field        | Required |
| ------------ | -------- |
| NIM          | Yes      |
| Nama         | Yes      |
| Kelas Kampus | Yes      |
| Semester     | Yes      |
| Pondok       | Yes      |

Contoh:

```text
NIM       : 123456
Nama      : Ahmad Fauzan
Kelas     : 6A
Semester  : 6
Pondok    : PMDG
```

---

# 20. Course → Student Relationship

Mahasiswa dapat terdaftar pada beberapa mata kuliah.

Contoh:

```text
Ahmad
├── Metodologi Penelitian
├── Studi Agama
├── Sosiologi Agama
└── Filsafat Agama
```

Karena itu jangan menyimpan `course_id` langsung di tabel mahasiswa.

Gunakan tabel relasi:

```text
course_students
```

Relationship:

```text
Students
    ↕
course_students
    ↕
Courses
```

---

# 21. Course Assessment

Setiap mata kuliah dapat mempunyai komponen penilaian berbeda.

Contoh:

### Metodologi Penelitian

```text
Tugas          20%
Presentasi     15%
PPT            10%
Keaktifan      10%
UTS            20%
UAS            25%
```

Total:

**100%**

Mata kuliah lain boleh mempunyai konfigurasi berbeda.

---

# 22. Assessment Component

Setiap komponen memiliki:

* Nama
* Bobot
* Nilai maksimum
* Urutan
* Status aktif

Contoh:

```text
Component:
Presentasi

Weight:
15%

Max Score:
100
```

Sistem harus melakukan validasi:

> Total bobot komponen aktif = 100%

User dapat diberi warning jika total belum 100%.

---

# 23. Assessment Entry

Untuk setiap mahasiswa, dosen dapat memasukkan:

```text
Tugas 1       85
Tugas 2       90
Presentasi    88
PPT           90
Keaktifan     85
UTS           82
UAS           87
```

Setiap assessment dapat memiliki:

* Score
* Date
* Notes
* Feedback
* Status

Contoh:

```text
Presentasi
Score: 88

Feedback:
Materi cukup baik dan penyampaian sistematis.
```

---

# 24. Grade Calculation

Sistem menghitung nilai berdasarkan bobot.

Formula:

```text
Weighted Score =
(score / max_score) × weight
```

Final score:

```text
Final Score =
Σ seluruh weighted score
```

Contoh:

```text
Tugas       85 × 20%
Presentasi  90 × 15%
PPT         88 × 10%
UTS         82 × 20%
UAS         87 × 35%
```

Sistem menghitung otomatis.

---

# 25. Course Dashboard

Dashboard mata kuliah:

```text
Metodologi Penelitian

Mahasiswa       32

Average Score   84.7

Highest         96
Lowest          68
```

Kemudian:

```text
Assessment Progress

Tugas       ████████████ 92%
Presentasi  ██████████   80%
UTS         █████████████ 100%
UAS         ─────────     Belum
```

---

# 26. Student Academic Profile

Profil mahasiswa:

```text
AHMAD FAUZAN

NIM
Kelas
Semester
Pondok
```

Tabs:

```text
Overview
Courses
Assessments
Performance
Feedback
AI Insight
Timeline
```

---

# 27. Academic Timeline

Contoh:

```text
03 Sep
Presentasi
Score: 90

27 Aug
Tugas 2
Score: 85

20 Aug
PPT
Score: 88

10 Aug
Tugas 1
Score: 82
```

---

# 28. AI Analysis

AI adalah fitur bantuan analisis.

AI **tidak boleh menjadi pengambil keputusan final**.

AI hanya memberikan:

* summary;
* trend;
* strengths;
* areas for improvement;
* suggested narrative;
* suggested feedback.

---

# 29. AI Mental Report

Untuk anggota kelas, AI dapat menganalisis histori monitoring.

Input:

```text
Monitoring records
Insya' records
Academic potential
Teacher notes
```

Output:

### Development Summary

Ringkasan perkembangan.

### Strengths

Kekuatan yang terlihat dari histori.

### Areas to Improve

Hal yang perlu mendapatkan perhatian.

### Suggested Report Narrative

Draft narasi yang dapat digunakan sebagai bahan raport mental.

User tetap harus:

```text
Review
↓
Edit
↓
Approve
```

AI tidak boleh otomatis menerbitkan laporan.

---

# 30. AI Academic Analysis

Untuk mahasiswa, AI dapat membantu:

* menganalisis perkembangan nilai;
* menemukan trend;
* membuat ringkasan performa;
* menemukan komponen yang paling lemah;
* menemukan konsistensi/ketidakkonsistenan;
* membuat feedback akademik.

Contoh:

```text
AI Insight

Mahasiswa menunjukkan performa baik pada presentasi
dan tugas, namun performa UTS lebih rendah dibandingkan
komponen penilaian lainnya.

Suggested Focus:
- Persiapan ujian
- Pemahaman konsep
```

---

# 31. AI Provider Architecture

AI harus dibuat modular.

Jangan mengikat aplikasi secara permanen kepada satu provider.

Concept:

```text
AI Service
   │
   ├── Provider Adapter
   │      ├── Provider A
   │      ├── Provider B
   │      └── Provider C
   │
   └── Analysis Engine
```

Provider dapat dikonfigurasi di Settings.

Default dapat menggunakan provider yang memiliki free tier.

API key **tidak boleh dikirim ke frontend**.

AI request harus diproses melalui server-side route/API.

---

# 32. AI Prompt Template

Prompt tidak boleh hardcoded sepenuhnya.

Settings dapat memiliki:

```text
AI Prompt Template
```

Tetapi sistem menyediakan default prompt.

Contoh fungsi:

```text
Mental Summary
Mental Report Draft
Academic Summary
Academic Feedback
Performance Analysis
```

User dapat mengatur prompt di masa depan.

---

# 33. Settings Center

Settings merupakan bagian penting dari aplikasi.

Struktur:

```text
⚙ Settings

Workspace
├── General
├── Academic Period
└── Appearance

Class
├── Member Fields
├── Monitoring Categories
├── Rating Scale
├── Insya' Settings
└── Academic Potential

Academic
├── Course Settings
├── Assessment Settings
├── Grade Settings
└── Semester

AI
├── AI Provider
├── Model
├── API Key
├── Prompt Templates
└── AI Features

Data
├── Import
├── Export
└── Backup

Account
├── Profile
└── Security
```

---

# 34. Import Excel

Sistem harus mendukung bulk import.

## Class Member

Template:

```text
Stambuk | Nama | Kelas | Daerah | Rayon
```

## University Student

Template:

```text
NIM | Nama | Kelas Kampus | Semester | Pondok
```

Flow:

```text
Upload
↓
Read File
↓
Preview
↓
Validate
↓
Show Errors
↓
Confirm Import
↓
Insert Database
```

Sistem tidak boleh langsung memasukkan data tanpa preview.

---

# 35. Export

Minimal:

### Excel

* Member list
* Student list
* Monitoring records
* Assessment records
* Course grades

### PDF

* Individual member report
* Mental monitoring summary
* Individual student academic report
* Course grade report

---

# 36. Search & Filter

Semua list utama harus memiliki:

### Search

* Nama
* Stambuk
* NIM

### Filter

Class:

* Kelas
* Daerah
* Rayon
* Status

Academic:

* Mata kuliah
* Semester
* Kelas kampus
* Pondok
* Score range

---

# 37. Data Period

Data harus memiliki periode.

Contoh:

```text
Academic Year
2026/2027

Semester
Semester 1
Semester 2
```

Monitoring juga dapat memiliki:

```text
Monitoring Period
September 2026
October 2026
November 2026
```

Hal ini diperlukan agar AI dapat menganalisis perkembangan berdasarkan waktu.

---

# 38. Database Architecture

Minimal tabel:

```text
profiles

workspaces

workspace_settings

class_groups

class_members

monitoring_categories

monitoring_indicators

monitoring_records

insya_records

academic_potentials

academic_periods

courses

students

course_students

assessment_components

assessments

ai_insights

ai_prompt_templates
```

---

# 39. Database Relationship

Conceptual relationship:

```text
profiles
   │
   └── workspaces
          │
          ├── class_groups
          │      │
          │      └── class_members
          │             ├── monitoring_records
          │             ├── insya_records
          │             └── academic_potentials
          │
          └── courses
                 │
                 ├── course_students
                 │       │
                 │       └── students
                 │
                 └── assessment_components
                          │
                          └── assessments
```

AI:

```text
workspace
   │
   ├── ai_prompt_templates
   │
   └── ai_insights
```

---

# 40. Supabase Security

Semua data harus menggunakan:

**Row Level Security (RLS)**

Prinsip:

> User hanya boleh mengakses data yang menjadi milik workspace-nya.

Contoh:

```text
User A
 └── Workspace A
       └── Data A

User B
 └── Workspace B
       └── Data B
```

User A tidak boleh membaca data User B.

API/service role key tidak boleh berada di client.

---

# 41. URL Structure

Contoh routing:

```text
/login

/workspace

/class
/class/[classId]
/class/[classId]/members
/class/[classId]/members/[memberId]
/class/[classId]/monitoring
/class/[classId]/reports

/academic
/academic/courses
/academic/courses/[courseId]
/academic/courses/[courseId]/students
/academic/students
/academic/students/[studentId]

/settings
/settings/general
/settings/class
/settings/academic
/settings/ai
/settings/data
```

---

# 42. Responsive Design

Aplikasi wajib optimal pada:

### Mobile

Karena wali kelas/dosen dapat melakukan monitoring langsung menggunakan HP.

Prioritas:

* Quick monitoring
* Quick assessment
* Search
* Student/member profile
* Add record

### Desktop

Prioritas:

* Dashboard
* Bulk assessment
* Table
* Analytics
* Settings
* Export
* Data management

Tidak boleh membuat flow berbeda secara fundamental antara mobile dan desktop.

---

# 43. Quick Entry

Fitur penting untuk mengurangi jumlah klik.

Contoh:

```text
+ Quick Monitoring
```

User:

```text
Pilih Anggota
↓
Pilih Kategori
↓
Rating
↓
Catatan
↓
Save
```

Untuk akademik:

```text
Pilih Mata Kuliah
↓
Pilih Assessment
↓
Input nilai mahasiswa
↓
Save
```

---

# 44. Bulk Assessment

Untuk dosen, harus tersedia mode tabel.

Contoh:

```text
Presentasi

Nama              Nilai
────────────────────────
Ahmad              85
Budi               90
Candra             78
Dimas               -
Fulan              88

[Save All]
```

Ini jauh lebih cepat daripada membuka mahasiswa satu per satu.

---

# 45. Dashboard Notifications

Dashboard dapat memberikan reminder internal:

```text
⚠ 5 anggota belum dimonitor bulan ini.

⚠ 3 mahasiswa belum memiliki nilai UTS.

⚠ Total bobot mata kuliah belum mencapai 100%.
```

---

# 46. Audit & History

Data penting tidak boleh kehilangan histori secara sembarangan.

Jika assessment diubah:

```text
Score:
85 → 90
```

sistem idealnya menyimpan:

* updated_at
* updated_by

Future version dapat menambahkan full audit log.

---

# 47. Soft Delete

Jangan langsung menghapus data penting.

Gunakan:

```text
is_active
archived_at
```

Contoh:

Mahasiswa keluar dari kelas:

```text
Active → Archived
```

Riwayat nilainya tetap tersimpan.

---

# 48. UX Principles

Aplikasi harus terasa:

* clean;
* profesional;
* ringan;
* tidak terlalu banyak form;
* mobile friendly;
* mudah dipahami tanpa tutorial panjang.

Prinsip:

> **Fewer clicks, more information.**

Gunakan:

* cards;
* tabs;
* modal/drawer;
* command/search;
* quick actions;
* sticky action bar pada mobile;
* confirmation hanya untuk tindakan berisiko.

---

# 49. Empty States

Jangan menampilkan halaman kosong.

Contoh:

```text
Belum ada mata kuliah.

Buat mata kuliah pertama Anda
untuk mulai melakukan penilaian.

[ + Tambah Mata Kuliah ]
```

---

# 50. Error Handling

Semua form harus memiliki:

* validation;
* inline error;
* loading state;
* success feedback;
* error feedback.

Contoh:

```text
✓ Data berhasil disimpan.

⚠ Total bobot penilaian adalah 90%.
Tambahkan 10% agar dapat mengaktifkan perhitungan final.
```

---

# 51. Performance

Target:

* fast initial load;
* pagination pada data besar;
* server-side querying jika diperlukan;
* debounce search;
* avoid unnecessary Supabase requests;
* gunakan caching untuk data yang jarang berubah;
* jangan mengambil seluruh database jika hanya membutuhkan sebagian data.

---

# 52. AI Cost Control

AI tidak boleh dipanggil setiap kali halaman dibuka.

AI hanya dipanggil ketika user menekan:

```text
🤖 Analyze
```

atau:

```text
Generate Report Draft
```

Hasil analisis dapat disimpan dalam:

```text
ai_insights
```

Sehingga hasil yang sama tidak perlu dibuat ulang tanpa alasan.

---

# 53. AI Privacy

Data yang dikirim ke AI harus seminimal mungkin.

Jangan mengirim seluruh database.

Gunakan:

```text
Database
 ↓
Relevant Records
 ↓
Prepare Context
 ↓
AI
 ↓
Analysis
```

Jika memungkinkan, gunakan identifier internal daripada informasi yang tidak diperlukan AI.

---

# 54. MVP Scope

Versi pertama wajib memiliki:

### Authentication

* Login
* Logout
* Protected routes

### Workspace

* Workspace selector
* Class workspace
* Academic workspace

### Class

* Create class
* Add member
* Edit member
* Member profile
* Monitoring
* Insya'
* Academic potential
* Timeline

### Academic

* Create course
* Add student
* Course-student relationship
* Assessment components
* Weight
* Score
* Automatic calculation
* Bulk score input

### Settings

* Monitoring categories
* Rating
* Academic settings
* AI settings

### AI

* Mental summary
* Mental report draft
* Academic summary

### Data

* Excel import
* Excel export

---

# 55. Future Features

Tidak wajib pada MVP:

* Multi-user workspace
* Admin role
* Teacher collaboration
* Google/Microsoft login
* Attendance
* Parent portal
* Student portal
* WhatsApp notification
* Automated report distribution
* Advanced analytics
* AI chatbot
* AI longitudinal analysis
* OCR document analysis
* File attachments
* Mobile PWA/offline mode

---

# 56. Development Priority

## Phase 1 — Foundation

```text
Next.js
Supabase
Auth
Database
RLS
Layout
Navigation
```

## Phase 2 — Workspace

```text
Workspace Selector
Class Workspace
Academic Workspace
Settings
```

## Phase 3 — Class Monitoring

```text
Class
Members
Monitoring
Insya'
Academic Potential
Timeline
```

## Phase 4 — Academic

```text
Courses
Students
Course Enrollment
Assessment Components
Scores
Grade Calculation
Bulk Assessment
```

## Phase 5 — Analytics

```text
Dashboard
Charts
Trend
Reports
```

## Phase 6 — AI

```text
AI Provider
AI Service
Mental Analysis
Report Draft
Academic Analysis
```

## Phase 7 — Import/Export

```text
Excel Import
Excel Export
PDF Report
```

---

# 57. Important Product Rules

1. **Do not hardcode monitoring categories.**
2. **Do not hardcode assessment components.**
3. **Do not assume every course has the same assessment structure.**
4. **Do not store course_id directly on the student table.**
5. **Do not allow AI to automatically finalize official reports.**
6. **Do not expose AI API keys to the browser.**
7. **All workspace data must be protected with RLS.**
8. **Do not permanently delete important historical records by default.**
9. **All monitoring records must preserve date/time.**
10. **All academic scores must preserve their assessment context.**
11. **The UI must be fully responsive.**
12. **Mobile quick-entry must be treated as a first-class feature.**
13. **The database must support multiple academic years.**
14. **The database must support multiple courses per student.**
15. **AI functionality must be optional and modular.**

---

# 58. Definition of Done — MVP

MVP dianggap selesai apabila user dapat melakukan workflow berikut tanpa bantuan developer:

### Workflow A — Class

```text
Login
↓
Choose KELAS
↓
Create Class 6 D
↓
Import 32 Members
↓
Open Member
↓
Create Monitoring
↓
Add Insya'
↓
Add Academic Potential
↓
View Timeline
↓
Generate AI Summary
↓
Review Report Draft
↓
Export Report
```

### Workflow B — Academic

```text
Login
↓
Choose MAHASISWA
↓
Create Course
↓
Configure Assessment Components
↓
Set Weights
↓
Import/Add Students
↓
Enter Scores
↓
System Calculates Final Score
↓
View Student Performance
↓
Generate AI Analysis
↓
Export Grade Report
```

---

# 59. Non-Functional Requirements

## Security

* Supabase Auth
* RLS
* Server-side AI requests
* Environment variables
* No secret keys in client
* Input validation
* Protected routes

## Performance

* Pagination
* Optimized queries
* Minimal database reads
* Lazy loading where appropriate
* Caching for configuration data

## Maintainability

Code harus:

* TypeScript strict;
* modular;
* reusable components;
* service layer untuk database;
* validation schema;
* reusable form components;
* reusable table components;
* reusable AI adapter.

---

# 60. Final Product Vision

Sistem ini pada akhirnya bukan hanya tempat memasukkan nilai.

Sistem harus menjadi:

> **Digital Academic & Personal Development Record**

Untuk setiap anggota/mahasiswa, sistem menyimpan perjalanan perkembangan mereka secara terstruktur.

```text
                 USER
                  │
          ┌───────┴────────┐
          │                │
       KELAS           MAHASISWA
          │                │
     ┌────┴────┐       ┌───┴────┐
     │         │       │        │
  Mental    Akademik  Course   Score
     │         │       │        │
   Insya'   Potential  Task     UTS
     │         │       │        │
     └────┬────┘       └───┬────┘
          │                │
          └───────┬────────┘
                  │
              TIMELINE
                  │
                  ▼
              🤖 AI
                  │
          ┌───────┴────────┐
          │                │
       ANALYSIS          DRAFT
          │                │
          └───────┬────────┘
                  ▼
              👨‍🏫 REVIEW
                  │
                  ▼
              📊 REPORT
```

**Prinsip akhir:**

> **Data dicatat sekali, histori tersimpan, perkembangan terlihat, analisis dibantu AI, keputusan tetap berada pada guru/dosen.**
