-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ======================================================================
-- Users
-- ======================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,                 -- nullable if using OAuth
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- ======================================================================
-- Institutions (colleges)
-- ======================================================================
CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_code TEXT,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_institutions_name ON institutions (name);

-- ======================================================================
-- Courses (canonical course metadata)
-- ======================================================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
  code TEXT,                 -- e.g., "BIO 201"
  title TEXT NOT NULL,       -- "Anatomy & Physiology I"
  credits NUMERIC(6,2),
  description TEXT,
  canonical BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_courses_title ON courses (lower(title));
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses (code);

-- ======================================================================
-- Terms (per-user academic terms / semesters)
-- ======================================================================
CREATE TABLE IF NOT EXISTS terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,        -- "Fall 2024"
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_terms_user ON terms (user_id);

-- ======================================================================
-- Taken courses (user course instances / snapshots)
-- ======================================================================
CREATE TABLE IF NOT EXISTS taken_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
  term_id UUID REFERENCES terms(id) ON DELETE SET NULL,
  course_title TEXT NOT NULL,         -- snapshot of title at time of entry
  credits NUMERIC(6,2) NOT NULL DEFAULT 0 CHECK (credits >= 0),
  grade TEXT,                          -- e.g., "A", "B+", "Pass"
  grade_value NUMERIC(4,3),            -- numeric equivalent (e.g., 3.700)
  grade_scale TEXT DEFAULT '4.0',
  is_retaken BOOLEAN NOT NULL DEFAULT FALSE,
  original_taken_course_id UUID REFERENCES taken_courses(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_taken_user ON taken_courses (user_id);
CREATE INDEX IF NOT EXISTS idx_taken_courseid ON taken_courses (course_id);
CREATE INDEX IF NOT EXISTS idx_taken_institution ON taken_courses (institution_id);

-- ======================================================================
-- Program requirements (e.g., nursing school programs)
-- ======================================================================
CREATE TABLE IF NOT EXISTS program_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                -- "City Nursing School - ADN 2025"
  institution TEXT,                  -- the school offering the program (free text)
  min_prereq_gpa NUMERIC(3,2),
  min_overall_gpa NUMERIC(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_programs_name ON program_requirements (lower(name));

-- ======================================================================
-- Prereq groups (one program requirement may have multiple groups)
-- ======================================================================
CREATE TABLE IF NOT EXISTS prereq_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_requirement_id UUID NOT NULL REFERENCES program_requirements(id) ON DELETE CASCADE,
  label TEXT NOT NULL,           -- "Anatomy & Physiology I"
  min_credits NUMERIC(6,2) DEFAULT 0 CHECK (min_credits >= 0),
  required BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_prereqgroups_program ON prereq_groups (program_requirement_id);

-- ======================================================================
-- Mapping between PrereqGroup and Course (which canonical courses satisfy group)
-- ======================================================================
CREATE TABLE IF NOT EXISTS prereq_group_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prereq_group_id UUID NOT NULL REFERENCES prereq_groups(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  equivalent BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_pg_courses_prereq ON prereq_group_courses (prereq_group_id);

-- ======================================================================
-- Scenarios (saved what-if simulations)
-- ======================================================================
CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scenarios_user ON scenarios (user_id);

-- ======================================================================
-- Scenario overrides (simulate retake / new course for a scenario)
-- ======================================================================
CREATE TABLE IF NOT EXISTS scenario_taken_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  taken_course_id UUID REFERENCES taken_courses(id) ON DELETE SET NULL,
  simulated_grade TEXT,
  simulated_grade_value NUMERIC(4,3),
  simulated_credits NUMERIC(6,2) CHECK (simulated_credits >= 0),
  simulated_course_title TEXT
);

CREATE INDEX IF NOT EXISTS idx_scenario_overrides ON scenario_taken_courses (scenario_id);

-- ======================================================================
-- Settings (per-user preferences)
-- ======================================================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  grading_scale JSONB DEFAULT '{}'::jsonb,    -- mapping letter->value, e.g. {"A":4.0, "A-":3.7}
  default_term_id UUID REFERENCES terms(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ======================================================================
-- Audits (optional: store GPA calculation snapshots)
-- ======================================================================
CREATE TABLE IF NOT EXISTS audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  overall_gpa NUMERIC(4,3),
  prereq_gpa NUMERIC(4,3),
  payload JSONB
);

CREATE INDEX IF NOT EXISTS idx_audits_user ON audits (user_id);

-- ======================================================================
-- Helpful views (optional)
--  - You can remove these if you prefer only raw tables.
-- ======================================================================

-- Example view: a quick per-user credits summary (not material to the schema but handy)
CREATE OR REPLACE VIEW user_credits_summary AS
SELECT
  tc.user_id,
  COUNT(*) FILTER (WHERE tc.grade IS NOT NULL) AS course_count_with_grade,
  COALESCE(SUM(tc.credits), 0) AS total_credits
FROM taken_courses tc
GROUP BY tc.user_id;

-- ======================================================================
-- Final housekeeping: grant basic rights to authenticated role (Supabase convention)
-- ======================================================================
-- In Supabase, RLS policies are typical; this section is optional and non-destructive.
-- Grant basic read/write to postgres role 'authenticated' if you want to test with that role.
-- Commented out by default — enable if you are comfortable with row-level policies separately.

-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- End of migration