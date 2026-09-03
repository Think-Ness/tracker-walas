# DATABASE.md
# Class & Student Monitoring System
### Database Schema & Dummy Data Specification

**Database:** PostgreSQL / Supabase  
**Version:** 1.0

---

# 1. Database Principles

Database harus:

- relational;
- normalized;
- mudah dikembangkan;
- aman untuk Row Level Security;
- mendukung multi-workspace;
- mendukung workspace Kelas dan Mahasiswa;
- mendukung monitoring historis;
- mendukung penilaian per mata kuliah;
- mendukung AI analysis;
- tidak menyimpan hasil AI sebagai data final tanpa review.

---

# 2. High-Level Architecture

```text
auth.users
     │
     ▼
profiles
     │
     ▼
workspaces
     │
     ├───────────────┐
     ▼               ▼
CLASS WORKSPACE   STUDENT WORKSPACE
     │               │
     ▼               ▼
class_groups       courses
     │               │
     ▼               ▼
class_members   course_students
     │               │
     ├───────┐       ▼
     │       │   assessments
     ▼       ▼
monitoring  insya'
     │
     ▼
academic_potential
```

AI:

```text
monitoring / assessments / notes
             │
             ▼
        ai_analyses
             │
             ▼
      review / edit / approve
```

---

# 3. Authentication

Authentication menggunakan:

```text
Supabase Auth
```

Jangan membuat sistem password sendiri.

Supabase `auth.users` menjadi sumber utama authentication.

Application profile disimpan pada:

```text
profiles
```

---

# 4. Enum Types

Gunakan PostgreSQL ENUM untuk nilai yang benar-benar terbatas.

## workspace_type

```sql
CREATE TYPE workspace_type AS ENUM (
  'class',
  'student'
);
```

## workspace_role

```sql
CREATE TYPE workspace_role AS ENUM (
  'owner',
  'admin',
  'member'
);
```

## member_status

```sql
CREATE TYPE member_status AS ENUM (
  'active',
  'inactive',
  'graduated',
  'archived'
);
```

## monitoring_category

```sql
CREATE TYPE monitoring_category AS ENUM (
  'discipline',
  'worship',
  'attitude',
  'responsibility',
  'social',
  'independence',
  'leadership',
  'academic',
  'other'
);
```

## monitoring_rating

```sql
CREATE TYPE monitoring_rating AS ENUM (
  '1',
  '2',
  '3',
  '4',
  '5'
);
```

## assessment_type

```sql
CREATE TYPE assessment_type AS ENUM (
  'assignment',
  'presentation',
  'ppt',
  'quiz',
  'uts',
  'uas',
  'attendance',
  'participation',
  'project',
  'other'
);
```

## ai_status

```sql
CREATE TYPE ai_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'reviewed'
);
```

---

# 5. Profiles

Table:

```text
profiles
```

Menyimpan informasi pengguna aplikasi.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  full_name TEXT NOT NULL,

  avatar_url TEXT,

  email TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

# 6. Workspaces

Satu user dapat memiliki beberapa workspace.

Contoh:

```text
Workspace:
Kelas 6 D

Workspace:
Mahasiswa UNIDA
```

Schema:

```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  owner_id UUID NOT NULL
    REFERENCES profiles(id)
    ON DELETE CASCADE,

  name TEXT NOT NULL,

  description TEXT,

  type workspace_type NOT NULL,

  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

# 7. Workspace Members

Digunakan jika nanti satu workspace dikelola lebih dari satu user.

```sql
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  workspace_id UUID NOT NULL
    REFERENCES workspaces(id)
    ON DELETE CASCADE,

  user_id UUID NOT NULL
    REFERENCES profiles(id)
    ON DELETE CASCADE,

  role workspace_role NOT NULL DEFAULT 'member',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(workspace_id, user_id)
);
```

---

# 8. Class Groups

Digunakan untuk workspace tipe:

```text
class
```

Contoh:

```text
Kelas 6 D
```

Schema:

```sql
CREATE TABLE class_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  workspace_id UUID NOT NULL
    REFERENCES workspaces(id)
    ON DELETE CASCADE,

  name TEXT NOT NULL,

  academic_year TEXT,

  description TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

# 9. Class Members

Data anggota kelas.

Fields sesuai kebutuhan:

```text
Stambuk
Nama
Kelas
Daerah
Rayon
```

Schema:

```sql
CREATE TABLE class_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  class_group_id UUID NOT NULL
    REFERENCES class_groups(id)
    ON DELETE CASCADE,

  stambuk TEXT NOT NULL,

  name TEXT NOT NULL,

  class_name TEXT NOT NULL,

  daerah TEXT,

  rayon TEXT,

  status member_status NOT NULL DEFAULT 'active',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(class_group_id, stambuk)
);
```

---

# 10. Member Monitoring

Setiap monitoring disimpan sebagai historical record.

Jangan hanya menyimpan:

```text
current_rating
```

karena aplikasi membutuhkan timeline perkembangan.

Schema:

```sql
CREATE TABLE member_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  member_id UUID NOT NULL
    REFERENCES class_members(id)
    ON DELETE CASCADE,

  observed_by UUID NOT NULL
    REFERENCES profiles(id),

  observed_at DATE NOT NULL DEFAULT CURRENT_DATE,

  category monitoring_category NOT NULL,

  rating monitoring_rating,

  note TEXT NOT NULL,

  is_private BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Contoh:

```text
Ahmad Fauzan
03 September 2026
Kedisiplinan
4/5

"Menunjukkan peningkatan dalam konsistensi
mengikuti kegiatan."
```

---

# 11. Insya' Notes

Catatan khusus untuk kebutuhan insya'.

Schema:

```sql
CREATE TABLE member_insya (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  member_id UUID NOT NULL
    REFERENCES class_members(id)
    ON DELETE CASCADE,

  created_by UUID NOT NULL
    REFERENCES profiles(id),

  note_date DATE NOT NULL DEFAULT CURRENT_DATE,

  title TEXT,

  content TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

# 12. Academic Potential

Data potensi akademik dipisahkan dari monitoring biasa.

```sql
CREATE TABLE academic_potential (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  member_id UUID NOT NULL
    REFERENCES class_members(id)
    ON DELETE CASCADE,

  assessed_by UUID NOT NULL
    REFERENCES profiles(id),

  assessed_at DATE NOT NULL DEFAULT CURRENT_DATE,

  strength TEXT,

  potential TEXT,

  weakness TEXT,

  recommendation TEXT,

  rating INTEGER CHECK (
    rating BETWEEN 1 AND 5
  ),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

# 13. Students

Workspace mahasiswa menggunakan data:

```text
NIM
Nama
Kelas Kampus
Semester
Pondok
```

Namun data mahasiswa sebaiknya menjadi entity tersendiri agar satu mahasiswa dapat mengikuti beberapa mata kuliah.

```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  nim TEXT NOT NULL UNIQUE,

  name TEXT NOT NULL,

  campus_class TEXT,

  semester INTEGER,

  pondok TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

# 14. Courses

Dosen membuat mata kuliah yang diajar.

```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  workspace_id UUID NOT NULL
    REFERENCES workspaces(id)
    ON DELETE CASCADE,

  code TEXT,

  name TEXT NOT NULL,

  semester TEXT,

  academic_year TEXT,

  sks INTEGER,

  description TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

# 15. Course Students

Relasi mahasiswa dengan mata kuliah.

Satu mahasiswa dapat mengikuti banyak mata kuliah.

```sql
CREATE TABLE course_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  course_id UUID NOT NULL
    REFERENCES courses(id)
    ON DELETE CASCADE,

  student_id UUID NOT NULL
    REFERENCES students(id)
    ON DELETE CASCADE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(course_id, student_id)
);
```

---

# 16. Assessments

Assessment menyimpan nilai mahasiswa.

Contoh:

```text
Tugas
Presentasi
PPT
Quiz
UTS
UAS
Project
Keaktifan
```

Schema:

```sql
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  course_id UUID NOT NULL
    REFERENCES courses(id)
    ON DELETE CASCADE,

  name TEXT NOT NULL,

  type assessment_type NOT NULL,

  max_score NUMERIC(5,2) NOT NULL DEFAULT 100,

  weight NUMERIC(5,2),

  assessment_date DATE,

  description TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

# 17. Assessment Scores

Nilai mahasiswa dipisahkan dari assessment.

```sql
CREATE TABLE assessment_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  assessment_id UUID NOT NULL
    REFERENCES assessments(id)
    ON DELETE CASCADE,

  student_id UUID NOT NULL
    REFERENCES students(id)
    ON DELETE CASCADE,

  score NUMERIC(5,2),

  note TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(assessment_id, student_id)
);
```

Dengan struktur ini dosen dapat melakukan bulk input:

```text
Mahasiswa       Nilai
Ahmad           85
Budi            90
Candra          78
Dimas           92
```

---

# 18. AI Analyses

AI hanya menghasilkan draft analisis.

```sql
CREATE TABLE ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  workspace_id UUID NOT NULL
    REFERENCES workspaces(id)
    ON DELETE CASCADE,

  member_id UUID
    REFERENCES class_members(id)
    ON DELETE CASCADE,

  student_id UUID
    REFERENCES students(id)
    ON DELETE CASCADE,

  status ai_status NOT NULL DEFAULT 'pending',

  analysis_type TEXT NOT NULL,

  input_summary TEXT,

  result TEXT,

  edited_result TEXT,

  reviewed_by UUID
    REFERENCES profiles(id),

  reviewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

`edited_result` digunakan apabila guru/dosen melakukan revisi terhadap hasil AI.

---

# 19. Settings

Konfigurasi aplikasi per workspace.

```sql
CREATE TABLE workspace_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  workspace_id UUID NOT NULL
    REFERENCES workspaces(id)
    ON DELETE CASCADE,

  setting_key TEXT NOT NULL,

  setting_value JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(workspace_id, setting_key)
);
```

Contoh:

```text
monitoring_categories
assessment_types
grading_scale
report_preferences
ai_preferences
```

---

# 20. Database Relationship

```text
profiles
   │
   ├──────────────┐
   │              │
   ▼              ▼
workspaces   workspace_members
   │
   ├──────────────────────────┐
   │                          │
   ▼                          ▼
class_groups               courses
   │                          │
   ▼                          ▼
class_members           course_students
   │                          │
   ├──────────┐               ▼
   │          │            students
   ▼          ▼
monitoring  insya'
   │
   ▼
academic_potential


courses
   │
   ▼
assessments
   │
   ▼
assessment_scores
   │
   ▼
students


workspaces
   │
   ▼
ai_analyses
```

---

# 21. Indexes

Karena aplikasi akan banyak melakukan search/filter, gunakan indexes.

```sql
CREATE INDEX idx_class_members_class_group
ON class_members(class_group_id);

CREATE INDEX idx_class_members_stambuk
ON class_members(stambuk);

CREATE INDEX idx_class_members_name
ON class_members(name);

CREATE INDEX idx_monitoring_member
ON member_monitoring(member_id);

CREATE INDEX idx_monitoring_date
ON member_monitoring(observed_at);

CREATE INDEX idx_courses_workspace
ON courses(workspace_id);

CREATE INDEX idx_course_students_course
ON course_students(course_id);

CREATE INDEX idx_course_students_student
ON course_students(student_id);

CREATE INDEX idx_assessments_course
ON assessments(course_id);

CREATE INDEX idx_scores_student
ON assessment_scores(student_id);
```

---

# 22. Dummy User

Untuk development environment:

```text
Name:
Ahmad Fauzan

Email:
demo@classmonitor.test
```

Authentication account sebaiknya dibuat melalui Supabase Auth, bukan insert langsung ke `auth.users`.

---

# 23. Dummy Workspace

Buat dua workspace.

### Workspace 1

```text
Name:
Kelas 6 D

Description:
Monitoring anggota kelas 6 D

Type:
class
```

### Workspace 2

```text
Name:
Perkuliahan UNIDA

Description:
Monitoring dan penilaian mahasiswa

Type:
student
```

---

# 24. Dummy Class

```text
Kelas 6 D

Academic Year:
2026/2027
```

---

# 25. Dummy Class Members

Gunakan minimal 10 data agar table, search, pagination, filter, dan detail page dapat dites.

| Stambuk | Nama | Kelas | Daerah | Rayon |
|---|---|---|---|---|
| 612001 | Ahmad Fauzan | 6 D | Jakarta | Al-Azhar |
| 612002 | Muhammad Fikri | 6 D | Bandung | Darussalam |
| 612003 | Abdul Hakim | 6 D | Surabaya | Aligarh |
| 612004 | Rizky Ramadhan | 6 D | Malang | Al-Madinah |
| 612005 | Farhan Maulana | 6 D | Semarang | Al-Azhar |
| 612006 | Ilham Akbar | 6 D | Yogyakarta | Darussalam |
| 612007 | Fajar Hidayat | 6 D | Bogor | Aligarh |
| 612008 | Reza Kurniawan | 6 D | Depok | Al-Madinah |
| 612009 | Salman Alfarizi | 6 D | Bekasi | Al-Azhar |
| 612010 | Daffa Pratama | 6 D | Makassar | Darussalam |

---

# 26. Dummy Monitoring

Masukkan beberapa historical records.

### Ahmad Fauzan

```text
Date:
2026-09-01

Category:
discipline

Rating:
4

Note:
Menunjukkan peningkatan dalam konsistensi mengikuti kegiatan.
```

```text
Date:
2026-08-20

Category:
academic

Rating:
4

Note:
Aktif dalam diskusi dan menunjukkan kemampuan memahami materi dengan baik.
```

### Muhammad Fikri

```text
Date:
2026-09-02

Category:
responsibility

Rating:
3

Note:
Perlu meningkatkan konsistensi dalam menyelesaikan tanggung jawab harian.
```

### Abdul Hakim

```text
Date:
2026-08-28

Category:
leadership

Rating:
5

Note:
Mampu membantu mengkoordinasikan anggota kelompok dengan baik.
```

### Rizky Ramadhan

```text
Date:
2026-08-25

Category:
social

Rating:
4

Note:
Mampu berinteraksi dengan anggota kelas secara baik.
```

---

# 27. Dummy Insya'

### Ahmad Fauzan

```text
Title:
Perkembangan Kemandirian

Content:
Menunjukkan perkembangan positif dalam mengambil tanggung jawab
dan menyelesaikan tugas tanpa banyak arahan.
```

### Muhammad Fikri

```text
Title:
Kedisiplinan

Content:
Masih memerlukan pendampingan dalam menjaga konsistensi
menyelesaikan tugas sesuai waktu yang ditentukan.
```

---

# 28. Dummy Academic Potential

### Ahmad Fauzan

```text
Strength:
Pemahaman materi dan kemampuan komunikasi.

Potential:
Berpotensi berkembang dalam bidang akademik dan kepemimpinan.

Weakness:
Perlu meningkatkan konsistensi.

Recommendation:
Berikan tanggung jawab yang membutuhkan komunikasi dan analisis.

Rating:
4
```

### Abdul Hakim

```text
Strength:
Leadership dan komunikasi.

Potential:
Berpotensi menjadi koordinator kelompok.

Weakness:
Perlu memperdalam beberapa materi akademik.

Recommendation:
Berikan tugas yang menggabungkan kepemimpinan dan akademik.

Rating:
4
```

---

# 29. Dummy Students

Gunakan 12 mahasiswa.

| NIM | Nama | Kelas Kampus | Semester | Pondok |
|---|---|---|---:|---|
| 410001 | Ahmad Fauzan | AFI 6A | 6 | Gontor |
| 410002 | Muhammad Fikri | AFI 6A | 6 | Gontor |
| 410003 | Abdul Hakim | AFI 6A | 6 | Gontor |
| 410004 | Rizky Ramadhan | AFI 6A | 6 | Gontor |
| 410005 | Farhan Maulana | AFI 6B | 6 | Gontor |
| 410006 | Ilham Akbar | AFI 6B | 6 | Gontor |
| 410007 | Fajar Hidayat | AFI 6B | 6 | Gontor |
| 410008 | Reza Kurniawan | AFI 6B | 6 | Gontor |
| 410009 | Salman Alfarizi | AFI 6C | 6 | Gontor |
| 410010 | Daffa Pratama | AFI 6C | 6 | Gontor |
| 410011 | Zaid Abdullah | AFI 6C | 6 | Gontor |
| 410012 | Hasan Basri | AFI 6C | 6 | Gontor |

---

# 30. Dummy Courses

Buat minimal 3 mata kuliah.

### Course 1

```text
Code:
AFI601

Name:
Metodologi Penelitian

Semester:
6

Academic Year:
2026/2027

SKS:
3
```

### Course 2

```text
Code:
AFI602

Name:
Studi Agama-Agama

Semester:
6

Academic Year:
2026/2027

SKS:
3
```

### Course 3

```text
Code:
AFI603

Name:
Agama dan Masyarakat

Semester:
6

Academic Year:
2026/2027

SKS:
2
```

---

# 31. Dummy Course Enrollment

Setiap course memiliki mahasiswa.

Untuk development:

```text
Metodologi Penelitian:
12 mahasiswa

Studi Agama-Agama:
10 mahasiswa

Agama dan Masyarakat:
8 mahasiswa
```

Beberapa mahasiswa sengaja tidak mengikuti semua mata kuliah agar relationship dan filtering dapat dites.

---

# 32. Dummy Assessments

Untuk:

```text
Metodologi Penelitian
```

Buat:

| Assessment | Type | Weight |
|---|---|---:|
| Tugas 1 | assignment | 10 |
| Presentasi Proposal | presentation | 15 |
| PPT Proposal | ppt | 10 |
| Quiz 1 | quiz | 10 |
| UTS | uts | 25 |
| Project Penelitian | project | 15 |
| UAS | uas | 15 |

Total:

```text
100%
```

---

# 33. Dummy Scores

Contoh nilai:

| Mahasiswa | Tugas 1 | Presentasi | PPT | Quiz | UTS | Project | UAS |
|---|---:|---:|---:|---:|---:|---:|---:|
| Ahmad Fauzan | 85 | 90 | 88 | 84 | 87 | 90 | 89 |
| Muhammad Fikri | 78 | 82 | 80 | 79 | 81 | 84 | 80 |
| Abdul Hakim | 92 | 95 | 94 | 90 | 93 | 95 | 94 |
| Rizky Ramadhan | 80 | 85 | 83 | 82 | 84 | 86 | 85 |
| Farhan Maulana | 88 | 87 | 90 | 85 | 86 | 89 | 88 |
| Ilham Akbar | 75 | 80 | 78 | 76 | 79 | 82 | 80 |
| Fajar Hidayat | 90 | 88 | 91 | 89 | 90 | 92 | 91 |
| Reza Kurniawan | 82 | 84 | 81 | 80 | 83 | 85 | 84 |

---

# 34. Dummy AI Analysis

Buat beberapa record agar UI AI dapat langsung dites.

### Analysis 1

```text
Type:
mental_summary

Member:
Ahmad Fauzan

Status:
completed

Result:
Menunjukkan perkembangan positif terutama dalam aspek kedisiplinan,
tanggung jawab, dan partisipasi akademik.

Areas for Improvement:
Konsistensi perlu terus dipertahankan.

Suggested Report Draft:
Menunjukkan perkembangan yang baik dalam kedisiplinan dan tanggung jawab.
```

### Analysis 2

```text
Type:
academic_summary

Student:
Ahmad Fauzan

Status:
completed

Result:
Performa akademik menunjukkan konsistensi dengan kekuatan pada
presentasi, project, dan pemahaman materi.
```

---

# 35. Dummy Workspace Settings

## Class workspace

```json
{
  "monitoring_categories": [
    "discipline",
    "worship",
    "attitude",
    "responsibility",
    "social",
    "independence",
    "leadership",
    "academic"
  ],
  "rating_scale": 5,
  "ai_enabled": true
}
```

## Student workspace

```json
{
  "assessment_types": [
    "assignment",
    "presentation",
    "ppt",
    "quiz",
    "uts",
    "uas",
    "attendance",
    "participation",
    "project"
  ],
  "grading_scale": 100,
  "ai_enabled": true
}
```

---

# 36. Development Seed Requirements

Seed database harus menghasilkan kondisi berikut:

```text
1 demo user

2 workspaces

1 class group

10 class members

multiple monitoring records

multiple insya' notes

multiple academic potential records

12 students

3 courses

course enrollments

7 assessments

assessment scores

multiple AI analyses

workspace settings
```

---

# 37. Important Development Rule

Dummy data harus dibuat melalui **seed script**, bukan dimasukkan satu per satu secara manual.

Recommended:

```text
supabase/
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_indexes.sql
│   └── 003_rls.sql
│
└── seed/
    └── development_seed.sql
```

Developer harus dapat melakukan reset development database dan menghasilkan dataset yang sama.

---

# 38. UUID

Semua primary key application menggunakan:

```sql
gen_random_uuid()
```

Jangan menggunakan integer auto increment sebagai primary key utama.

Exception hanya diperbolehkan jika ada kebutuhan khusus.

---

# 39. Timestamps

Semua tabel utama harus memiliki:

```text
created_at
updated_at
```

Gunakan:

```sql
TIMESTAMPTZ
```

bukan:

```text
TIMESTAMP
```

---

# 40. Soft Delete

Jangan menambahkan:

```text
deleted_at
```

ke semua tabel secara otomatis.

Gunakan soft delete hanya jika kebutuhan bisnis memang memerlukannya.

Untuk data seperti anggota:

```text
status = archived
```

lebih disukai daripada menghapus data historis.

---

# 41. Data Integrity

Database harus mencegah:

- duplicate NIM;
- duplicate stambuk dalam satu kelas;
- duplicate enrollment;
- duplicate assessment score;
- assessment dari course yang tidak sesuai;
- data monitoring tanpa member;
- data score tanpa student.

Gunakan:

```text
foreign key
unique constraint
check constraint
```

sebisa mungkin daripada hanya mengandalkan validasi frontend.

---

# 42. Row Level Security

Supabase RLS **WAJIB diaktifkan**.

Prinsip:

```text
User hanya dapat melihat workspace
yang memang menjadi miliknya / member-nya.
```

User A:

```text
Workspace A ✓
Workspace B ✗
```

User B:

```text
Workspace A ✗
Workspace B ✓
```

Semua table yang mengandung data user/workspace harus memiliki policy yang sesuai.

---

# 43. Security Principle

Frontend tidak boleh menentukan apakah user memiliki akses.

Jangan mengandalkan:

```text
if (user.role === "admin")
```

sebagai security utama.

Frontend hanya menentukan UI.

Authorization harus ditegakkan pada:

```text
Supabase RLS
+
database constraints
```

---

# 44. AI Data Privacy

AI request harus menggunakan data minimum yang diperlukan.

Jangan mengirim seluruh database ke AI.

Contoh:

```text
Monitoring 5 record
+
Academic potential
+
Relevant notes
```

lebih baik daripada:

```text
Entire student database
```

---

# 45. AI Review Flow

Flow:

```text
Data
 ↓
Generate Analysis
 ↓
AI Result
 ↓
Teacher/Lecturer Review
 ↓
Edit if necessary
 ↓
Approve / Use
```

AI tidak boleh otomatis dianggap sebagai:

```text
final assessment
```

---

# 46. Dashboard Queries

Dashboard sebaiknya tidak mengambil seluruh record.

Gunakan:

```text
COUNT
AVG
GROUP BY
LIMIT
pagination
```

Contoh:

```text
Total Anggota
Anggota Terpantau
Belum Terpantau
Rata-rata Monitoring
```

Jangan melakukan:

```text
SELECT *
```

untuk seluruh tabel hanya untuk menghitung statistik.

---

# 47. Pagination

Data berikut harus menggunakan pagination:

```text
class_members
students
member_monitoring
courses
assessment_scores
ai_analyses
```

Default:

```text
20 records/page
```

Pilihan:

```text
20
50
100
```

---

# 48. Search

Search utama:

```text
Class Members:
nama / stambuk

Students:
nama / NIM

Courses:
kode / nama mata kuliah
```

Search harus dilakukan di database, bukan mengambil seluruh dataset ke browser.

---

# 49. Final Database Goal

Database harus memungkinkan aplikasi berkembang dari:

```text
1 user
↓
2 workspace
↓
10–100 anggota
```

menjadi:

```text
multiple users
multiple classes
multiple courses
hundreds/thousands of students
historical monitoring
academic assessment
AI-assisted reporting
```

tanpa mengubah fundamental database architecture.

---

# 50. Development Definition of Done

Database dianggap siap apabila:

- [ ] Migration berhasil dijalankan pada Supabase
- [ ] Semua foreign key valid
- [ ] Unique constraint aktif
- [ ] Index utama aktif
- [ ] RLS aktif
- [ ] Demo user tersedia
- [ ] Dummy class tersedia
- [ ] Dummy members tersedia
- [ ] Dummy monitoring tersedia
- [ ] Dummy insya' tersedia
- [ ] Dummy academic potential tersedia
- [ ] Dummy students tersedia
- [ ] Dummy courses tersedia
- [ ] Dummy assessments tersedia
- [ ] Dummy scores tersedia
- [ ] Dummy AI analysis tersedia
- [ ] Workspace settings tersedia
- [ ] Dashboard dapat menampilkan data dummy
- [ ] Search dapat digunakan
- [ ] Filter dapat digunakan
- [ ] Pagination dapat digunakan
- [ ] Detail member dapat dibuka
- [ ] Detail student dapat dibuka
- [ ] Assessment bulk entry dapat dites
- [ ] AI analysis UI dapat dites

---

# 51. Final Architecture

```text
                         SUPABASE
                            │
              ┌─────────────┴─────────────┐
              │                           │
         Supabase Auth                PostgreSQL
              │                           │
              ▼                           ▼
          profiles                    workspaces
                                           │
                         ┌─────────────────┴─────────────────┐
                         │                                   │
                     CLASS                              STUDENT
                         │                                   │
                   class_groups                           courses
                         │                                   │
                  class_members                     course_students
                         │                                   │
              ┌──────────┼──────────┐                     students
              │          │          │                         │
         monitoring    insya'   academic                  assessments
                                  potential                    │
                                                               ▼
                                                       assessment_scores

                         └──────────────┬──────────────────────┘
                                        │
                                        ▼
                                  ai_analyses
```

**North Star:**

> Database harus menyimpan data operasional secara terstruktur, sementara AI hanya menjadi lapisan analisis di atas data tersebut.