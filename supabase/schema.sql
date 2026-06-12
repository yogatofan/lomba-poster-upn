-- ============================================================
-- SCHEMA LOMBA POSTER UPN "VETERAN" JAWA TIMUR
-- Jalankan script ini di Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: profiles
-- Extends Supabase Auth users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('peserta', 'juri', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: participants
-- Data diri peserta lomba
-- ============================================================
CREATE TABLE IF NOT EXISTS public.participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  npm TEXT NOT NULL,
  program_studi TEXT NOT NULL,
  fakultas TEXT NOT NULL,
  no_hp TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id)
);

-- ============================================================
-- TABLE: submissions
-- Karya yang dikirimkan peserta
-- ============================================================
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  sub_tema TEXT NOT NULL CHECK (sub_tema IN (
    'Kenali, Cegah, dan Lawan Kekerasan Seksual',
    'Berani Bicara, Berani Melapor',
    'Stop Normalisasi Pelecehan Seksual',
    'Bijak Bermedia Sosial, Cegah Kekerasan Seksual Digital',
    'Teman Peduli, Kampus Terlindungi'
  )),
  judul_karya TEXT NOT NULL,
  file_url TEXT,
  file_public_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'revisi')),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_id)
);

-- ============================================================
-- TABLE: scores
-- Penilaian juri per karya
-- ============================================================
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  juri_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skor_tema NUMERIC(5,2) NOT NULL CHECK (skor_tema BETWEEN 1 AND 100),
  skor_orisinalitas NUMERIC(5,2) NOT NULL CHECK (skor_orisinalitas BETWEEN 1 AND 100),
  skor_desain NUMERIC(5,2) NOT NULL CHECK (skor_desain BETWEEN 1 AND 100),
  skor_pesan NUMERIC(5,2) NOT NULL CHECK (skor_pesan BETWEEN 1 AND 100),
  total_skor NUMERIC(5,2) GENERATED ALWAYS AS (
    (0.25 * skor_tema) + (0.25 * skor_orisinalitas) + (0.30 * skor_desain) + (0.20 * skor_pesan)
  ) STORED,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(submission_id, juri_id)
);

-- ============================================================
-- TABLE: settings
-- Konfigurasi periode lomba
-- ============================================================
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pendaftaran_dibuka BOOLEAN DEFAULT TRUE,
  penilaian_dibuka BOOLEAN DEFAULT FALSE,
  tanggal_mulai TIMESTAMPTZ,
  tanggal_selesai TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings row
INSERT INTO public.settings (pendaftaran_dibuka, penilaian_dibuka)
VALUES (true, false)
ON CONFLICT DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- profiles: user bisa baca profil sendiri; admin service role bisa semua
CREATE POLICY "Profiles: user lihat milik sendiri"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Profiles: user update milik sendiri"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Profiles: insert saat registrasi"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- participants: peserta CRUD milik sendiri
CREATE POLICY "Participants: peserta lihat milik sendiri"
  ON public.participants FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Participants: peserta insert milik sendiri"
  ON public.participants FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Participants: peserta update milik sendiri"
  ON public.participants FOR UPDATE
  USING (profile_id = auth.uid());

-- Admin baca semua participants
CREATE POLICY "Participants: admin lihat semua"
  ON public.participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- submissions: peserta lihat milik sendiri; juri lihat semua (anonim); admin lihat semua
CREATE POLICY "Submissions: peserta lihat milik sendiri"
  ON public.submissions FOR SELECT
  USING (
    participant_id IN (
      SELECT id FROM public.participants WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Submissions: peserta insert milik sendiri"
  ON public.submissions FOR INSERT
  WITH CHECK (
    participant_id IN (
      SELECT id FROM public.participants WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Submissions: peserta update milik sendiri"
  ON public.submissions FOR UPDATE
  USING (
    participant_id IN (
      SELECT id FROM public.participants WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Submissions: juri lihat semua"
  ON public.submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('juri', 'admin')
    )
  );

-- scores: juri CRUD milik sendiri; admin lihat semua
CREATE POLICY "Scores: juri lihat milik sendiri"
  ON public.scores FOR SELECT
  USING (juri_id = auth.uid());

CREATE POLICY "Scores: juri insert milik sendiri"
  ON public.scores FOR INSERT
  WITH CHECK (juri_id = auth.uid());

CREATE POLICY "Scores: juri update milik sendiri"
  ON public.scores FOR UPDATE
  USING (juri_id = auth.uid());

CREATE POLICY "Scores: admin lihat semua"
  ON public.scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- settings: semua user bisa baca; hanya admin yang bisa update
CREATE POLICY "Settings: semua bisa baca"
  ON public.settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Settings: admin bisa update"
  ON public.settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- FUNCTION: auto create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'peserta')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
