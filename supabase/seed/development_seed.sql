-- ============================================================
-- Class & Student Monitoring System
-- Seed: development_seed.sql
-- 
-- IMPORTANT: Run this AFTER creating a demo user via Supabase Auth
-- Then replace the USER_ID below with the actual auth.users UUID
-- ============================================================

-- ============================================================
-- STEP 1: Replace this UUID with your actual demo user ID
-- from Supabase Auth > Users
-- ============================================================

DO $$
DECLARE
  v_user_id UUID;
  v_ws_class_id UUID;
  v_ws_student_id UUID;
  v_class_group_id UUID;

  -- Class members
  v_m1 UUID; v_m2 UUID; v_m3 UUID; v_m4 UUID; v_m5 UUID;
  v_m6 UUID; v_m7 UUID; v_m8 UUID; v_m9 UUID; v_m10 UUID;

  -- Students
  v_s1 UUID; v_s2 UUID; v_s3 UUID; v_s4 UUID; v_s5 UUID; v_s6 UUID;
  v_s7 UUID; v_s8 UUID; v_s9 UUID; v_s10 UUID; v_s11 UUID; v_s12 UUID;

  -- Courses
  v_c1 UUID; v_c2 UUID; v_c3 UUID;

  -- Assessments for course 1
  v_a1 UUID; v_a2 UUID; v_a3 UUID; v_a4 UUID; v_a5 UUID; v_a6 UUID; v_a7 UUID;

BEGIN

  -- ============================================================
  -- GET DEMO USER (first user in profiles, or set manually)
  -- ============================================================
  SELECT id INTO v_user_id FROM profiles LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found in profiles. Please create a user via Supabase Auth first.';
  END IF;

  RAISE NOTICE 'Seeding with user: %', v_user_id;

  -- ============================================================
  -- WORKSPACES
  -- ============================================================
  INSERT INTO workspaces (id, owner_id, name, description, type)
  VALUES (gen_random_uuid(), v_user_id, 'Kelas 6 D', 'Monitoring anggota kelas 6 D tahun ajaran 2026/2027', 'class')
  RETURNING id INTO v_ws_class_id;

  INSERT INTO workspaces (id, owner_id, name, description, type)
  VALUES (gen_random_uuid(), v_user_id, 'Perkuliahan UNIDA', 'Monitoring dan penilaian mahasiswa program AFI', 'student')
  RETURNING id INTO v_ws_student_id;

  -- ============================================================
  -- WORKSPACE SETTINGS
  -- ============================================================
  INSERT INTO workspace_settings (workspace_id, setting_key, setting_value) VALUES
  (v_ws_class_id, 'monitoring_categories', '["Akhlak","Kedisiplinan","Tanggung Jawab","Kepemimpinan","Kemandirian","Kepedulian","Kerja Sama","Komunikasi","Keaktifan","Sikap","Ibadah","Lainnya"]'::jsonb),
  (v_ws_class_id, 'rating_scale', '5'::jsonb),
  (v_ws_class_id, 'ai_enabled', 'true'::jsonb),
  (v_ws_student_id, 'assessment_types', '["Tugas","Presentasi","PPT","Quiz","UTS","UAS","Keaktifan","Project","Lainnya"]'::jsonb),
  (v_ws_student_id, 'grading_scale', '100'::jsonb),
  (v_ws_student_id, 'ai_enabled', 'true'::jsonb);

  -- ============================================================
  -- CLASS GROUP
  -- ============================================================
  INSERT INTO class_groups (id, workspace_id, name, academic_year, level, description)
  VALUES (gen_random_uuid(), v_ws_class_id, 'Kelas 6 D', '2026/2027', 'Kelas 6', 'Kelas 6 D tahun ajaran 2026/2027')
  RETURNING id INTO v_class_group_id;

  -- ============================================================
  -- CLASS MEMBERS (10 anggota)
  -- ============================================================
  INSERT INTO class_members (id, class_group_id, stambuk, name, class_name, daerah, rayon, status)
  VALUES (gen_random_uuid(), v_class_group_id, '612001', 'Ahmad Fauzan', '6 D', 'Jakarta', 'Al-Azhar', 'active')
  RETURNING id INTO v_m1;

  INSERT INTO class_members (id, class_group_id, stambuk, name, class_name, daerah, rayon, status)
  VALUES (gen_random_uuid(), v_class_group_id, '612002', 'Muhammad Fikri', '6 D', 'Bandung', 'Darussalam', 'active')
  RETURNING id INTO v_m2;

  INSERT INTO class_members (id, class_group_id, stambuk, name, class_name, daerah, rayon, status)
  VALUES (gen_random_uuid(), v_class_group_id, '612003', 'Abdul Hakim', '6 D', 'Surabaya', 'Aligarh', 'active')
  RETURNING id INTO v_m3;

  INSERT INTO class_members (id, class_group_id, stambuk, name, class_name, daerah, rayon, status)
  VALUES (gen_random_uuid(), v_class_group_id, '612004', 'Rizky Ramadhan', '6 D', 'Malang', 'Al-Madinah', 'active')
  RETURNING id INTO v_m4;

  INSERT INTO class_members (id, class_group_id, stambuk, name, class_name, daerah, rayon, status)
  VALUES (gen_random_uuid(), v_class_group_id, '612005', 'Farhan Maulana', '6 D', 'Semarang', 'Al-Azhar', 'active')
  RETURNING id INTO v_m5;

  INSERT INTO class_members (id, class_group_id, stambuk, name, class_name, daerah, rayon, status)
  VALUES (gen_random_uuid(), v_class_group_id, '612006', 'Ilham Akbar', '6 D', 'Yogyakarta', 'Darussalam', 'active')
  RETURNING id INTO v_m6;

  INSERT INTO class_members (id, class_group_id, stambuk, name, class_name, daerah, rayon, status)
  VALUES (gen_random_uuid(), v_class_group_id, '612007', 'Fajar Hidayat', '6 D', 'Bogor', 'Aligarh', 'active')
  RETURNING id INTO v_m7;

  INSERT INTO class_members (id, class_group_id, stambuk, name, class_name, daerah, rayon, status)
  VALUES (gen_random_uuid(), v_class_group_id, '612008', 'Reza Kurniawan', '6 D', 'Depok', 'Al-Madinah', 'active')
  RETURNING id INTO v_m8;

  INSERT INTO class_members (id, class_group_id, stambuk, name, class_name, daerah, rayon, status)
  VALUES (gen_random_uuid(), v_class_group_id, '612009', 'Salman Alfarizi', '6 D', 'Bekasi', 'Al-Azhar', 'active')
  RETURNING id INTO v_m9;

  INSERT INTO class_members (id, class_group_id, stambuk, name, class_name, daerah, rayon, status)
  VALUES (gen_random_uuid(), v_class_group_id, '612010', 'Daffa Pratama', '6 D', 'Makassar', 'Darussalam', 'active')
  RETURNING id INTO v_m10;

  -- ============================================================
  -- MONITORING RECORDS
  -- ============================================================
  INSERT INTO member_monitoring (member_id, observed_by, observed_at, category, rating, note) VALUES
  (v_m1, v_user_id, '2026-09-01', 'Kedisiplinan', 4, 'Menunjukkan peningkatan dalam konsistensi mengikuti kegiatan harian.'),
  (v_m1, v_user_id, '2026-08-20', 'Keaktifan', 4, 'Aktif dalam diskusi dan menunjukkan kemampuan memahami materi dengan baik.'),
  (v_m1, v_user_id, '2026-08-05', 'Akhlak', 5, 'Sopan dan menghormati sesama anggota kelas dengan baik.'),
  (v_m2, v_user_id, '2026-09-02', 'Tanggung Jawab', 3, 'Perlu meningkatkan konsistensi dalam menyelesaikan tanggung jawab harian.'),
  (v_m2, v_user_id, '2026-08-15', 'Kedisiplinan', 3, 'Masih perlu dorongan untuk datang tepat waktu pada kegiatan pagi.'),
  (v_m3, v_user_id, '2026-08-28', 'Kepemimpinan', 5, 'Mampu membantu mengkoordinasikan anggota kelompok dengan sangat baik.'),
  (v_m3, v_user_id, '2026-08-10', 'Kerja Sama', 5, 'Selalu siap membantu teman yang membutuhkan bantuan akademik.'),
  (v_m4, v_user_id, '2026-08-25', 'Kepedulian', 4, 'Mampu berinteraksi dengan anggota kelas secara baik dan empati.'),
  (v_m5, v_user_id, '2026-09-01', 'Kemandirian', 4, 'Sudah mampu menyelesaikan tugas tanpa banyak arahan.'),
  (v_m6, v_user_id, '2026-08-22', 'Komunikasi', 3, 'Perlu meningkatkan kepercayaan diri dalam menyampaikan pendapat.'),
  (v_m7, v_user_id, '2026-08-18', 'Sikap', 4, 'Menunjukkan sikap positif dan motivasi belajar yang baik.'),
  (v_m8, v_user_id, '2026-08-12', 'Ibadah', 4, 'Konsisten menjalankan ibadah wajib dan sunah yang dianjurkan.');

  -- ============================================================
  -- INSYA' RECORDS
  -- ============================================================
  INSERT INTO member_insya (member_id, created_by, note_date, title, content, score, kategori) VALUES
  (v_m1, v_user_id, '2026-09-01', 'Kemandirian dalam Kehidupan Modern', 'Menunjukkan perkembangan positif dalam mengambil tanggung jawab dan menyelesaikan tugas tanpa banyak arahan. Struktur tulisan mulai mengalami perbaikan yang signifikan.', 85, 'Karangan Bebas'),
  (v_m1, v_user_id, '2026-08-01', 'Perjalanan Mencari Ilmu', 'Mampu mengungkapkan pengalaman pribadi dengan baik. Kosakata cukup beragam namun perlu dikembangkan lebih lanjut.', 80, 'Karangan Pengalaman'),
  (v_m2, v_user_id, '2026-09-01', 'Kedisiplinan sebagai Fondasi Sukses', 'Masih memerlukan pendampingan dalam menjaga konsistensi menyelesaikan tugas sesuai waktu yang ditentukan. Namun ide tulisan cukup menarik.', 75, 'Karangan Bebas'),
  (v_m3, v_user_id, '2026-08-25', 'Kepemimpinan yang Efektif', 'Tulisan sangat terstruktur dan menunjukkan pemahaman mendalam tentang konsep kepemimpinan dalam Islam. Kosakata sangat kaya.', 92, 'Esai Akademik'),
  (v_m4, v_user_id, '2026-08-20', 'Persahabatan dalam Islam', 'Tulisan yang hangat dengan referensi keislaman yang tepat. Perlu sedikit perbaikan pada paragraf penutup.', 83, 'Karangan Bebas'),
  (v_m5, v_user_id, '2026-09-02', 'Teknologi dan Kehidupan Pesantren', 'Ide yang segar dan perspektif yang unik. Perlu penguatan pada argumentasi.', 78, 'Esai Argumentatif');

  -- ============================================================
  -- ACADEMIC POTENTIAL RECORDS
  -- ============================================================
  INSERT INTO academic_potential (member_id, assessed_by, assessed_at, bidang, strength, potential, weakness, recommendation, rating) VALUES
  (v_m1, v_user_id, '2026-09-01', 'Akademik Umum', 'Pemahaman materi dan kemampuan komunikasi verbal yang baik.', 'Berpotensi berkembang dalam bidang akademik dan kepemimpinan intelektual.', 'Perlu meningkatkan konsistensi dan manajemen waktu.', 'Berikan tanggung jawab yang membutuhkan komunikasi dan analisis mendalam.', 4),
  (v_m1, v_user_id, '2026-07-15', 'Public Speaking', 'Kepercayaan diri dalam berbicara di depan umum.', 'Potensi menjadi pembicara yang efektif dalam forum diskusi.', 'Kadang terlalu cepat dalam menyampaikan argumen.', 'Latih dalam forum debat atau diskusi terstruktur.', 4),
  (v_m3, v_user_id, '2026-08-28', 'Kepemimpinan', 'Leadership dan kemampuan koordinasi kelompok yang sangat baik.', 'Berpotensi menjadi koordinator atau pemimpin organisasi.', 'Perlu memperdalam beberapa materi akademik spesifik.', 'Berikan tugas yang menggabungkan kepemimpinan dan tanggung jawab akademik.', 5),
  (v_m4, v_user_id, '2026-08-25', 'Bahasa Arab', 'Penguasaan kosakata bahasa Arab yang di atas rata-rata.', 'Berpotensi menjadi penerjemah atau guru bahasa Arab.', 'Perlu meningkatkan kemampuan gramatika yang lebih kompleks.', 'Tingkatkan dengan membaca teks-teks Arab klasik.', 4),
  (v_m7, v_user_id, '2026-08-18', 'Matematika', 'Kemampuan analisis angka dan logika yang baik.', 'Potensi dalam bidang sains dan penelitian kuantitatif.', 'Perlu meningkatkan penerapan dalam konteks kehidupan nyata.', 'Berikan soal-soal aplikatif dan studi kasus nyata.', 4);

  -- ============================================================
  -- STUDENTS (12 mahasiswa)
  -- ============================================================
  INSERT INTO students (id, workspace_id, nim, name, campus_class, semester, pondok)
  VALUES (gen_random_uuid(), v_ws_student_id, '410001', 'Ahmad Fauzan', 'AFI 6A', 6, 'Gontor')
  RETURNING id INTO v_s1;

  INSERT INTO students (id, workspace_id, nim, name, campus_class, semester, pondok)
  VALUES (gen_random_uuid(), v_ws_student_id, '410002', 'Muhammad Fikri', 'AFI 6A', 6, 'Gontor')
  RETURNING id INTO v_s2;

  INSERT INTO students (id, workspace_id, nim, name, campus_class, semester, pondok)
  VALUES (gen_random_uuid(), v_ws_student_id, '410003', 'Abdul Hakim', 'AFI 6A', 6, 'Gontor')
  RETURNING id INTO v_s3;

  INSERT INTO students (id, workspace_id, nim, name, campus_class, semester, pondok)
  VALUES (gen_random_uuid(), v_ws_student_id, '410004', 'Rizky Ramadhan', 'AFI 6A', 6, 'Gontor')
  RETURNING id INTO v_s4;

  INSERT INTO students (id, workspace_id, nim, name, campus_class, semester, pondok)
  VALUES (gen_random_uuid(), v_ws_student_id, '410005', 'Farhan Maulana', 'AFI 6B', 6, 'Gontor')
  RETURNING id INTO v_s5;

  INSERT INTO students (id, workspace_id, nim, name, campus_class, semester, pondok)
  VALUES (gen_random_uuid(), v_ws_student_id, '410006', 'Ilham Akbar', 'AFI 6B', 6, 'Gontor')
  RETURNING id INTO v_s6;

  INSERT INTO students (id, workspace_id, nim, name, campus_class, semester, pondok)
  VALUES (gen_random_uuid(), v_ws_student_id, '410007', 'Fajar Hidayat', 'AFI 6B', 6, 'Gontor')
  RETURNING id INTO v_s7;

  INSERT INTO students (id, workspace_id, nim, name, campus_class, semester, pondok)
  VALUES (gen_random_uuid(), v_ws_student_id, '410008', 'Reza Kurniawan', 'AFI 6B', 6, 'Gontor')
  RETURNING id INTO v_s8;

  INSERT INTO students (id, workspace_id, nim, name, campus_class, semester, pondok)
  VALUES (gen_random_uuid(), v_ws_student_id, '410009', 'Salman Alfarizi', 'AFI 6C', 6, 'Gontor')
  RETURNING id INTO v_s9;

  INSERT INTO students (id, workspace_id, nim, name, campus_class, semester, pondok)
  VALUES (gen_random_uuid(), v_ws_student_id, '410010', 'Daffa Pratama', 'AFI 6C', 6, 'Gontor')
  RETURNING id INTO v_s10;

  INSERT INTO students (id, workspace_id, nim, name, campus_class, semester, pondok)
  VALUES (gen_random_uuid(), v_ws_student_id, '410011', 'Zaid Abdullah', 'AFI 6C', 6, 'Gontor')
  RETURNING id INTO v_s11;

  INSERT INTO students (id, workspace_id, nim, name, campus_class, semester, pondok)
  VALUES (gen_random_uuid(), v_ws_student_id, '410012', 'Hasan Basri', 'AFI 6C', 6, 'Gontor')
  RETURNING id INTO v_s12;

  -- ============================================================
  -- COURSES
  -- ============================================================
  INSERT INTO courses (id, workspace_id, code, name, semester, academic_year, sks, description)
  VALUES (gen_random_uuid(), v_ws_student_id, 'AFI601', 'Metodologi Penelitian', '6', '2026/2027', 3, 'Mata kuliah metodologi penelitian untuk mahasiswa semester 6')
  RETURNING id INTO v_c1;

  INSERT INTO courses (id, workspace_id, code, name, semester, academic_year, sks, description)
  VALUES (gen_random_uuid(), v_ws_student_id, 'AFI602', 'Studi Agama-Agama', '6', '2026/2027', 3, 'Studi komparatif agama-agama dunia')
  RETURNING id INTO v_c2;

  INSERT INTO courses (id, workspace_id, code, name, semester, academic_year, sks, description)
  VALUES (gen_random_uuid(), v_ws_student_id, 'AFI603', 'Agama dan Masyarakat', '6', '2026/2027', 2, 'Hubungan agama dengan dinamika masyarakat modern')
  RETURNING id INTO v_c3;

  -- ============================================================
  -- COURSE ENROLLMENT
  -- ============================================================
  -- Metodologi Penelitian: semua 12 mahasiswa
  INSERT INTO course_students (course_id, student_id) VALUES
  (v_c1, v_s1), (v_c1, v_s2), (v_c1, v_s3), (v_c1, v_s4),
  (v_c1, v_s5), (v_c1, v_s6), (v_c1, v_s7), (v_c1, v_s8),
  (v_c1, v_s9), (v_c1, v_s10), (v_c1, v_s11), (v_c1, v_s12);

  -- Studi Agama-Agama: 10 mahasiswa
  INSERT INTO course_students (course_id, student_id) VALUES
  (v_c2, v_s1), (v_c2, v_s2), (v_c2, v_s3), (v_c2, v_s4),
  (v_c2, v_s5), (v_c2, v_s6), (v_c2, v_s7), (v_c2, v_s8),
  (v_c2, v_s9), (v_c2, v_s10);

  -- Agama dan Masyarakat: 8 mahasiswa
  INSERT INTO course_students (course_id, student_id) VALUES
  (v_c3, v_s1), (v_c3, v_s3), (v_c3, v_s5), (v_c3, v_s7),
  (v_c3, v_s9), (v_c3, v_s10), (v_c3, v_s11), (v_c3, v_s12);

  -- ============================================================
  -- ASSESSMENTS for Metodologi Penelitian (total weight = 100%)
  -- ============================================================
  INSERT INTO assessments (id, course_id, name, type, max_score, weight, order_index)
  VALUES (gen_random_uuid(), v_c1, 'Tugas 1', 'Tugas', 100, 10, 1)
  RETURNING id INTO v_a1;

  INSERT INTO assessments (id, course_id, name, type, max_score, weight, order_index)
  VALUES (gen_random_uuid(), v_c1, 'Presentasi Proposal', 'Presentasi', 100, 15, 2)
  RETURNING id INTO v_a2;

  INSERT INTO assessments (id, course_id, name, type, max_score, weight, order_index)
  VALUES (gen_random_uuid(), v_c1, 'PPT Proposal', 'PPT', 100, 10, 3)
  RETURNING id INTO v_a3;

  INSERT INTO assessments (id, course_id, name, type, max_score, weight, order_index)
  VALUES (gen_random_uuid(), v_c1, 'Quiz 1', 'Quiz', 100, 10, 4)
  RETURNING id INTO v_a4;

  INSERT INTO assessments (id, course_id, name, type, max_score, weight, order_index)
  VALUES (gen_random_uuid(), v_c1, 'UTS', 'UTS', 100, 25, 5)
  RETURNING id INTO v_a5;

  INSERT INTO assessments (id, course_id, name, type, max_score, weight, order_index)
  VALUES (gen_random_uuid(), v_c1, 'Project Penelitian', 'Project', 100, 15, 6)
  RETURNING id INTO v_a6;

  INSERT INTO assessments (id, course_id, name, type, max_score, weight, order_index)
  VALUES (gen_random_uuid(), v_c1, 'UAS', 'UAS', 100, 15, 7)
  RETURNING id INTO v_a7;

  -- ============================================================
  -- ASSESSMENT SCORES (Metodologi Penelitian)
  -- ============================================================
  -- Ahmad Fauzan
  INSERT INTO assessment_scores (assessment_id, student_id, score) VALUES
  (v_a1, v_s1, 85), (v_a2, v_s1, 90), (v_a3, v_s1, 88),
  (v_a4, v_s1, 84), (v_a5, v_s1, 87), (v_a6, v_s1, 90), (v_a7, v_s1, 89);

  -- Muhammad Fikri
  INSERT INTO assessment_scores (assessment_id, student_id, score) VALUES
  (v_a1, v_s2, 78), (v_a2, v_s2, 82), (v_a3, v_s2, 80),
  (v_a4, v_s2, 79), (v_a5, v_s2, 81), (v_a6, v_s2, 84), (v_a7, v_s2, 80);

  -- Abdul Hakim
  INSERT INTO assessment_scores (assessment_id, student_id, score) VALUES
  (v_a1, v_s3, 92), (v_a2, v_s3, 95), (v_a3, v_s3, 94),
  (v_a4, v_s3, 90), (v_a5, v_s3, 93), (v_a6, v_s3, 95), (v_a7, v_s3, 94);

  -- Rizky Ramadhan
  INSERT INTO assessment_scores (assessment_id, student_id, score) VALUES
  (v_a1, v_s4, 80), (v_a2, v_s4, 85), (v_a3, v_s4, 83),
  (v_a4, v_s4, 82), (v_a5, v_s4, 84), (v_a6, v_s4, 86), (v_a7, v_s4, 85);

  -- Farhan Maulana
  INSERT INTO assessment_scores (assessment_id, student_id, score) VALUES
  (v_a1, v_s5, 88), (v_a2, v_s5, 87), (v_a3, v_s5, 90),
  (v_a4, v_s5, 85), (v_a5, v_s5, 86), (v_a6, v_s5, 89), (v_a7, v_s5, 88);

  -- Ilham Akbar
  INSERT INTO assessment_scores (assessment_id, student_id, score) VALUES
  (v_a1, v_s6, 75), (v_a2, v_s6, 80), (v_a3, v_s6, 78),
  (v_a4, v_s6, 76), (v_a5, v_s6, 79), (v_a6, v_s6, 82), (v_a7, v_s6, 80);

  -- Fajar Hidayat
  INSERT INTO assessment_scores (assessment_id, student_id, score) VALUES
  (v_a1, v_s7, 90), (v_a2, v_s7, 88), (v_a3, v_s7, 91),
  (v_a4, v_s7, 89), (v_a5, v_s7, 90), (v_a6, v_s7, 92), (v_a7, v_s7, 91);

  -- Reza Kurniawan
  INSERT INTO assessment_scores (assessment_id, student_id, score) VALUES
  (v_a1, v_s8, 82), (v_a2, v_s8, 84), (v_a3, v_s8, 81),
  (v_a4, v_s8, 80), (v_a5, v_s8, 83), (v_a6, v_s8, 85), (v_a7, v_s8, 84);

  -- Remaining students: partial scores (some not yet graded)
  INSERT INTO assessment_scores (assessment_id, student_id, score) VALUES
  (v_a1, v_s9, 83), (v_a2, v_s9, 86), (v_a5, v_s9, 85);

  INSERT INTO assessment_scores (assessment_id, student_id, score) VALUES
  (v_a1, v_s10, 77), (v_a2, v_s10, 79), (v_a5, v_s10, 80);

  -- ============================================================
  -- AI ANALYSES (sample records)
  -- ============================================================
  INSERT INTO ai_analyses (workspace_id, member_id, status, analysis_type, input_summary, result) VALUES
  (
    v_ws_class_id,
    v_m1,
    'completed',
    'mental_summary',
    'Monitoring records: 3 records (Kedisiplinan 4/5, Keaktifan 4/5, Akhlak 5/5). Insya: 2 records.',
    E'## Ringkasan Perkembangan\n\nAhmad Fauzan menunjukkan perkembangan yang konsisten dan positif dalam berbagai aspek karakter selama periode monitoring.\n\n## Kekuatan\n\n- Akhlak yang sangat baik dan menghormati sesama (5/5)\n- Keaktifan dalam kegiatan akademik yang meningkat\n- Tulisan insya yang menunjukkan perkembangan kemampuan ekspresi\n\n## Area yang Perlu Perhatian\n\n- Konsistensi dalam kegiatan harian masih perlu dijaga\n- Manajemen waktu dapat ditingkatkan lebih lanjut\n\n## Draft Narasi Raport\n\nAhmad Fauzan adalah anggota kelas yang menunjukkan perkembangan karakter yang menggembirakan. Akhlak dan sikapnya terhadap sesama sangat baik. Keaktifan dan partisipasinya dalam kegiatan akademik terus meningkat. Diharapkan dapat mempertahankan dan meningkatkan konsistensi ini ke depannya.'
  ),
  (
    v_ws_student_id,
    NULL,
    'completed',
    'academic_summary',
    'Student: Ahmad Fauzan. Course: Metodologi Penelitian. Scores: Tugas 85, Presentasi 90, PPT 88, Quiz 84, UTS 87, Project 90, UAS 89.',
    E'## Ringkasan Performa Akademik\n\nAhmad Fauzan menunjukkan performa akademik yang konsisten dan di atas rata-rata dalam mata kuliah Metodologi Penelitian.\n\n## Kekuatan\n\n- Nilai presentasi dan project yang sangat baik (90/100)\n- Konsistensi nilai di semua komponen penilaian\n- UAS yang memuaskan menunjukkan pemahaman materi yang solid\n\n## Area yang Perlu Ditingkatkan\n\n- Quiz 1 sedikit lebih rendah dibanding komponen lain (84)\n- Tugas 1 dapat ditingkatkan untuk mencapai konsistensi optimal\n\n## Rekomendasi\n\nMahasiswa ini menunjukkan kecenderungan kuat dalam presentasi dan penerapan praktis. Disarankan untuk terus mengasah kemampuan analisis dalam penulisan akademik.'
  );

  RAISE NOTICE 'Seeding completed successfully!';
  RAISE NOTICE 'Class Workspace ID: %', v_ws_class_id;
  RAISE NOTICE 'Student Workspace ID: %', v_ws_student_id;

END $$;
