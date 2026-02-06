


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."application_status_enum" AS ENUM (
    'draft',
    'submitted',
    'under_review',
    'accepted',
    'rejected',
    'waitlisted',
    'withdrawn'
);


ALTER TYPE "public"."application_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."institution_status_enum" AS ENUM (
    'pending',
    'verified',
    'suspended'
);


ALTER TYPE "public"."institution_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."program_type_enum" AS ENUM (
    'undergraduate',
    'graduate',
    'certificate',
    'professional'
);


ALTER TYPE "public"."program_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."user_role_enum" AS ENUM (
    'student',
    'institution_admin',
    'institution_staff',
    'super_admin'
);


ALTER TYPE "public"."user_role_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_program_completion"("p_user_id" "uuid", "p_program_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  total_required INTEGER;
  completed_required INTEGER;
  completion_pct INTEGER;
BEGIN
  -- Count total required courses
  SELECT COUNT(*) INTO total_required
  FROM program_required_courses
  WHERE program_requirement_id = p_program_id AND is_required = true;
  
  -- Count completed required courses (via mappings)
  SELECT COUNT(DISTINCT prc.id) INTO completed_required
  FROM program_required_courses prc
  JOIN program_course_mappings pcm ON pcm.program_required_course_id = prc.id
  WHERE prc.program_requirement_id = p_program_id 
    AND prc.is_required = true
    AND pcm.user_id = p_user_id
    AND pcm.is_completed = true;
  
  -- Calculate percentage
  IF total_required = 0 THEN
    completion_pct := 0;
  ELSE
    completion_pct := ROUND((completed_required::DECIMAL / total_required::DECIMAL) * 100);
  END IF;
  
  RETURN completion_pct;
END;
$$;


ALTER FUNCTION "public"."calculate_program_completion"("p_user_id" "uuid", "p_program_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."calculate_program_completion"("p_user_id" "uuid", "p_program_id" "uuid") IS 'Calculate percentage of program requirements completed by a student';



CREATE OR REPLACE FUNCTION "public"."create_user_onboarding"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO user_onboarding (user_id, current_step)
  VALUES (NEW.id, 'dashboard_intro');
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."create_user_onboarding"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_institution_stats"("p_institution_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_programs', (SELECT COUNT(*) FROM program_requirements WHERE institution_id = p_institution_id AND is_official = true),
    'published_programs', (SELECT COUNT(*) FROM program_requirements WHERE institution_id = p_institution_id AND is_official = true AND is_published = true),
    'total_courses', (SELECT COUNT(*) FROM courses WHERE institution_id = p_institution_id AND is_official = true),
    'total_applications', (
      SELECT COUNT(*) FROM program_applications pa
      JOIN program_requirements pr ON pr.id = pa.program_id
      WHERE pr.institution_id = p_institution_id
    ),
    'pending_applications', (
      SELECT COUNT(*) FROM program_applications pa
      JOIN program_requirements pr ON pr.id = pa.program_id
      WHERE pr.institution_id = p_institution_id AND pa.status = 'submitted'
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$;


ALTER FUNCTION "public"."get_institution_stats"("p_institution_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_institution_stats"("p_institution_id" "uuid") IS 'Get statistics for an institution (programs, courses, applications)';



CREATE OR REPLACE FUNCTION "public"."handle_new_user_onboarding"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.user_onboarding (user_id, onboarding_completed, current_step, steps_completed)
  values (new.id, false, 'dashboard_intro', '[]'::jsonb)
  on conflict (user_id) do nothing;
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user_onboarding"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_role"("check_role" character varying, "check_institution_id" "uuid" DEFAULT NULL::"uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  IF check_institution_id IS NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = check_role
    );
  ELSE
    RETURN EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() 
        AND role = check_role 
        AND institution_id = check_institution_id
    );
  END IF;
END;
$$;


ALTER FUNCTION "public"."has_role"("check_role" character varying, "check_institution_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."has_role"("check_role" character varying, "check_institution_id" "uuid") IS 'Check if current user has a specific role, optionally at a specific institution';



CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trigger_set_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_set_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."academic_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "institution_id" "uuid",
    "program_id" "uuid",
    "start_date" "date",
    "target_graduation_date" "date",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."academic_plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "computed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "overall_gpa" numeric(4,3),
    "prereq_gpa" numeric(4,3),
    "payload" "jsonb"
);


ALTER TABLE "public"."audits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."course_equivalencies" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "institution_id" "uuid" NOT NULL,
    "target_course_id" "uuid" NOT NULL,
    "equivalent_course_id" "uuid",
    "equivalent_institution_id" "uuid",
    "equivalent_course_code" character varying(50),
    "equivalent_course_name" character varying(255),
    "approval_status" character varying(20) DEFAULT 'approved'::character varying,
    "min_grade" character varying(5),
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."course_equivalencies" OWNER TO "postgres";


COMMENT ON TABLE "public"."course_equivalencies" IS 'Maps transfer courses from other institutions to target institution courses';



COMMENT ON COLUMN "public"."course_equivalencies"."target_course_id" IS 'The course at the receiving institution';



COMMENT ON COLUMN "public"."course_equivalencies"."equivalent_course_id" IS 'The equivalent course (if in our database)';



COMMENT ON COLUMN "public"."course_equivalencies"."equivalent_institution_id" IS 'The institution offering the equivalent course';



COMMENT ON COLUMN "public"."course_equivalencies"."equivalent_course_code" IS 'Course code if not in database (e.g., BIO 101)';



COMMENT ON COLUMN "public"."course_equivalencies"."equivalent_course_name" IS 'Course name if not in database';



COMMENT ON COLUMN "public"."course_equivalencies"."approval_status" IS 'Status: approved, pending, rejected';



CREATE TABLE IF NOT EXISTS "public"."courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "institution_id" "uuid",
    "code" "text",
    "title" "text" NOT NULL,
    "credits" numeric(6,2),
    "description" "text",
    "canonical" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_official" boolean DEFAULT false,
    "course_number" character varying(50),
    "department" character varying(100),
    "prerequisites" "jsonb" DEFAULT '[]'::"jsonb",
    "syllabus_url" "text",
    "credits_min" numeric(4,2),
    "credits_max" numeric(4,2),
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."courses" OWNER TO "postgres";


COMMENT ON COLUMN "public"."courses"."description" IS 'Detailed course description';



COMMENT ON COLUMN "public"."courses"."is_official" IS 'True if created by institution, false if canonical/system course';



COMMENT ON COLUMN "public"."courses"."course_number" IS 'Course code/number (e.g., BIO 101, CHEM 201)';



COMMENT ON COLUMN "public"."courses"."department" IS 'Academic department offering the course';



COMMENT ON COLUMN "public"."courses"."prerequisites" IS 'Array of prerequisite courses: [{course_id, min_grade}]';



COMMENT ON COLUMN "public"."courses"."credits_min" IS 'Minimum credits for variable credit courses';



COMMENT ON COLUMN "public"."courses"."credits_max" IS 'Maximum credits for variable credit courses';



CREATE TABLE IF NOT EXISTS "public"."error_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text",
    "error_desc" "text",
    "severity" integer,
    "payload_sent" json,
    "payload_received" json,
    "page" json,
    "route" json,
    "function" json,
    "user" "uuid" DEFAULT "auth"."uid"(),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."error_logs" OWNER TO "postgres";


COMMENT ON TABLE "public"."error_logs" IS 'Error logs only to be seen in the admin panel';



CREATE TABLE IF NOT EXISTS "public"."institutions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "short_code" "text",
    "country" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "website" "text",
    "user_id" "uuid",
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "is_official" boolean DEFAULT false,
    "institution_admin_id" "uuid",
    "verification_code" character varying(100),
    "domain" character varying(255),
    "website_url" "text",
    "logo_url" "text",
    "description" "text",
    "contact_email" character varying(255),
    "address" "jsonb",
    "accreditation" "jsonb"[],
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."institutions" OWNER TO "postgres";


COMMENT ON COLUMN "public"."institutions"."status" IS 'Verification status: pending, verified, suspended';



COMMENT ON COLUMN "public"."institutions"."is_official" IS 'True if managed by institution admin, false if user-created';



COMMENT ON COLUMN "public"."institutions"."domain" IS 'Official email domain for verification (e.g., harvard.edu)';



COMMENT ON COLUMN "public"."institutions"."address" IS 'JSON object: {street, city, state, zip, country}';



COMMENT ON COLUMN "public"."institutions"."accreditation" IS 'Array of accreditation info: [{type, agency, date}]';



COMMENT ON COLUMN "public"."institutions"."metadata" IS 'Additional data: {student_count, program_count, etc}';



CREATE TABLE IF NOT EXISTS "public"."plan_terms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "plan_id" "uuid" NOT NULL,
    "name" character varying(100) NOT NULL,
    "term_type" character varying(20),
    "year" integer,
    "start_date" "date",
    "end_date" "date",
    "credits_target" numeric(4,1),
    "display_order" integer DEFAULT 0 NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "plan_terms_term_type_check" CHECK ((("term_type")::"text" = ANY ((ARRAY['Fall'::character varying, 'Spring'::character varying, 'Summer'::character varying, 'Winter'::character varying, 'Session'::character varying])::"text"[])))
);


ALTER TABLE "public"."plan_terms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."planned_course_prerequisites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "planned_course_id" "uuid" NOT NULL,
    "prerequisite_course_id" "uuid",
    "prerequisite_title" character varying(255) NOT NULL,
    "prerequisite_code" character varying(50),
    "is_satisfied" boolean DEFAULT false,
    "satisfied_by_taken_course_id" "uuid",
    "satisfied_by_planned_course_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."planned_course_prerequisites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."planned_courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "plan_term_id" "uuid" NOT NULL,
    "course_id" "uuid",
    "course_title" character varying(255) NOT NULL,
    "course_code" character varying(50),
    "credits" numeric(4,1) NOT NULL,
    "notes" "text",
    "is_completed" boolean DEFAULT false,
    "taken_course_id" "uuid",
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."planned_courses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prereq_group_courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "prereq_group_id" "uuid" NOT NULL,
    "course_id" "uuid" NOT NULL,
    "equivalent" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."prereq_group_courses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prereq_groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "program_requirement_id" "uuid" NOT NULL,
    "label" "text" NOT NULL,
    "min_credits" numeric(6,2) DEFAULT 0,
    "required" boolean DEFAULT true NOT NULL,
    CONSTRAINT "prereq_groups_min_credits_check" CHECK (("min_credits" >= (0)::numeric))
);


ALTER TABLE "public"."prereq_groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."program_applications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "program_id" "uuid" NOT NULL,
    "status" character varying(50) DEFAULT 'draft'::character varying,
    "submitted_at" timestamp with time zone,
    "completion_percentage" integer DEFAULT 0,
    "notes" "text",
    "application_data" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."program_applications" OWNER TO "postgres";


COMMENT ON COLUMN "public"."program_applications"."status" IS 'Application status: draft, submitted, under_review, accepted, rejected, waitlisted, withdrawn';



COMMENT ON COLUMN "public"."program_applications"."completion_percentage" IS 'Percentage of requirements met (0-100)';



COMMENT ON COLUMN "public"."program_applications"."application_data" IS 'Additional application info: {essays, documents, etc}';



CREATE TABLE IF NOT EXISTS "public"."program_course_mappings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "program_requirement_id" "uuid" NOT NULL,
    "program_required_course_id" "uuid" NOT NULL,
    "taken_course_id" "uuid",
    "is_completed" boolean DEFAULT false NOT NULL,
    "mapped_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."program_course_mappings" OWNER TO "postgres";


COMMENT ON TABLE "public"."program_course_mappings" IS 'Maps user taken courses to program required courses to track completion';



CREATE TABLE IF NOT EXISTS "public"."program_required_courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "program_requirement_id" "uuid" NOT NULL,
    "course_title" "text" NOT NULL,
    "course_code" "text",
    "credits" numeric(6,2) DEFAULT 0 NOT NULL,
    "min_grade" "text",
    "description" "text",
    "category" "text",
    "is_required" boolean DEFAULT true NOT NULL,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "course_id" "uuid",
    CONSTRAINT "program_required_courses_credits_check" CHECK (("credits" >= (0)::numeric))
);


ALTER TABLE "public"."program_required_courses" OWNER TO "postgres";


COMMENT ON TABLE "public"."program_required_courses" IS 'Specific courses required for a program (prerequisites)';



CREATE TABLE IF NOT EXISTS "public"."program_requirements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "min_prereq_gpa" numeric(3,2),
    "min_overall_gpa" numeric(3,2),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "gen_random_uuid"(),
    "institution_id" "uuid",
    "is_official" boolean DEFAULT false,
    "program_type" character varying(50),
    "degree_type" character varying(100),
    "field_of_study" character varying(100),
    "application_deadline" "jsonb",
    "seats_available" integer,
    "acceptance_rate" numeric(5,2),
    "avg_completion_time" integer,
    "tuition_info" "jsonb",
    "is_published" boolean DEFAULT false,
    "description" "text",
    "requirements_text" "text"
);


ALTER TABLE "public"."program_requirements" OWNER TO "postgres";


COMMENT ON COLUMN "public"."program_requirements"."user_id" IS 'NULL for global programs, set for user-created programs';



COMMENT ON COLUMN "public"."program_requirements"."is_official" IS 'True if managed by institution, false if user-created';



COMMENT ON COLUMN "public"."program_requirements"."program_type" IS 'Type: undergraduate, graduate, certificate, professional';



COMMENT ON COLUMN "public"."program_requirements"."degree_type" IS 'Degree awarded: Associate, Bachelor, Master, Doctorate, etc.';



COMMENT ON COLUMN "public"."program_requirements"."application_deadline" IS 'Deadlines by term: {fall: "MM-DD", spring: "MM-DD", summer: "MM-DD"}';



COMMENT ON COLUMN "public"."program_requirements"."avg_completion_time" IS 'Average time to complete in months';



COMMENT ON COLUMN "public"."program_requirements"."tuition_info" IS 'Tuition details: {in_state, out_state, per_credit, fees}';



COMMENT ON COLUMN "public"."program_requirements"."is_published" IS 'True if visible to students searching for programs';



CREATE TABLE IF NOT EXISTS "public"."scenario_taken_courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "scenario_id" "uuid" NOT NULL,
    "taken_course_id" "uuid",
    "simulated_grade" "text",
    "simulated_grade_value" numeric(4,3),
    "simulated_credits" numeric(6,2),
    "simulated_course_title" "text",
    "user_id" "uuid" NOT NULL,
    CONSTRAINT "scenario_taken_courses_simulated_credits_check" CHECK (("simulated_credits" >= (0)::numeric))
);


ALTER TABLE "public"."scenario_taken_courses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scenarios" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "program_id" "uuid" DEFAULT "gen_random_uuid"(),
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."scenarios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "grading_scale" "jsonb" DEFAULT '{}'::"jsonb",
    "default_term_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."taken_courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "course_id" "uuid",
    "institution_id" "uuid",
    "term_id" "uuid",
    "course_title" "text" NOT NULL,
    "credits" numeric(6,2) DEFAULT 0 NOT NULL,
    "grade" "text",
    "grade_value" numeric(4,3),
    "grade_scale" "text" DEFAULT '4.0'::"text",
    "is_retaken" boolean DEFAULT false NOT NULL,
    "original_taken_course_id" "uuid",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "taken_courses_credits_check" CHECK (("credits" >= (0)::numeric))
);


ALTER TABLE "public"."taken_courses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."terms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "start_date" "date",
    "end_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."terms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tutorial_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "tutorial_type" "text" NOT NULL,
    "completed" boolean DEFAULT false NOT NULL,
    "skipped" boolean DEFAULT false NOT NULL,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."tutorial_progress" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."user_credits_summary" WITH ("security_invoker"='on') AS
 SELECT "user_id",
    "count"(*) FILTER (WHERE ("grade" IS NOT NULL)) AS "course_count_with_grade",
    COALESCE("sum"("credits"), (0)::numeric) AS "total_credits"
   FROM "public"."taken_courses" "tc"
  GROUP BY "user_id";


ALTER VIEW "public"."user_credits_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_onboarding" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "onboarding_completed" boolean DEFAULT false NOT NULL,
    "current_step" "text",
    "steps_completed" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_onboarding" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" character varying(50) DEFAULT 'student'::character varying NOT NULL,
    "institution_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_roles" IS 'RLS policies allow users to manage their own roles. Institution admin operations should use service role key to bypass RLS.';



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "password_hash" "text",
    "name" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."academic_plans"
    ADD CONSTRAINT "academic_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audits"
    ADD CONSTRAINT "audits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."course_equivalencies"
    ADD CONSTRAINT "course_equivalencies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."error_logs"
    ADD CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."institutions"
    ADD CONSTRAINT "institutions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plan_terms"
    ADD CONSTRAINT "plan_terms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plan_terms"
    ADD CONSTRAINT "plan_terms_plan_id_display_order_key" UNIQUE ("plan_id", "display_order");



ALTER TABLE ONLY "public"."planned_course_prerequisites"
    ADD CONSTRAINT "planned_course_prerequisites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."planned_courses"
    ADD CONSTRAINT "planned_courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prereq_group_courses"
    ADD CONSTRAINT "prereq_group_courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prereq_groups"
    ADD CONSTRAINT "prereq_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."program_applications"
    ADD CONSTRAINT "program_applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."program_course_mappings"
    ADD CONSTRAINT "program_course_mappings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."program_course_mappings"
    ADD CONSTRAINT "program_course_mappings_user_id_program_required_course_id_key" UNIQUE ("user_id", "program_required_course_id");



ALTER TABLE ONLY "public"."program_required_courses"
    ADD CONSTRAINT "program_required_courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."program_requirements"
    ADD CONSTRAINT "program_requirements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scenario_taken_courses"
    ADD CONSTRAINT "scenario_taken_courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scenarios"
    ADD CONSTRAINT "scenarios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."settings"
    ADD CONSTRAINT "settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."settings"
    ADD CONSTRAINT "settings_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."taken_courses"
    ADD CONSTRAINT "taken_courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."terms"
    ADD CONSTRAINT "terms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tutorial_progress"
    ADD CONSTRAINT "tutorial_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "unique_user_institution" UNIQUE ("user_id", "institution_id");



ALTER TABLE ONLY "public"."program_applications"
    ADD CONSTRAINT "unique_user_program_application" UNIQUE ("user_id", "program_id");



ALTER TABLE ONLY "public"."user_onboarding"
    ADD CONSTRAINT "user_onboarding_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_onboarding"
    ADD CONSTRAINT "user_onboarding_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_academic_plans_active" ON "public"."academic_plans" USING "btree" ("user_id", "is_active");



CREATE INDEX "idx_academic_plans_user_id" ON "public"."academic_plans" USING "btree" ("user_id");



CREATE INDEX "idx_applications_program" ON "public"."program_applications" USING "btree" ("program_id");



CREATE INDEX "idx_applications_status" ON "public"."program_applications" USING "btree" ("status");



CREATE INDEX "idx_applications_submitted" ON "public"."program_applications" USING "btree" ("submitted_at");



CREATE INDEX "idx_applications_user" ON "public"."program_applications" USING "btree" ("user_id");



CREATE INDEX "idx_audits_user" ON "public"."audits" USING "btree" ("user_id");



CREATE INDEX "idx_courses_code" ON "public"."courses" USING "btree" ("code");



CREATE INDEX "idx_courses_department" ON "public"."courses" USING "btree" ("department");



CREATE INDEX "idx_courses_institution_official" ON "public"."courses" USING "btree" ("institution_id", "is_official");



CREATE INDEX "idx_courses_number" ON "public"."courses" USING "btree" ("course_number");



CREATE INDEX "idx_courses_official" ON "public"."courses" USING "btree" ("is_official");



CREATE INDEX "idx_courses_title" ON "public"."courses" USING "btree" ("lower"("title"));



CREATE INDEX "idx_equivalencies_equivalent_course" ON "public"."course_equivalencies" USING "btree" ("equivalent_course_id");



CREATE INDEX "idx_equivalencies_institution" ON "public"."course_equivalencies" USING "btree" ("institution_id");



CREATE INDEX "idx_equivalencies_lookup" ON "public"."course_equivalencies" USING "btree" ("institution_id", "target_course_id");



CREATE INDEX "idx_equivalencies_status" ON "public"."course_equivalencies" USING "btree" ("approval_status");



CREATE INDEX "idx_equivalencies_target_course" ON "public"."course_equivalencies" USING "btree" ("target_course_id");



CREATE INDEX "idx_institutions_admin" ON "public"."institutions" USING "btree" ("institution_admin_id");



CREATE INDEX "idx_institutions_domain" ON "public"."institutions" USING "btree" ("domain");



CREATE INDEX "idx_institutions_name" ON "public"."institutions" USING "btree" ("name");



CREATE INDEX "idx_institutions_official" ON "public"."institutions" USING "btree" ("is_official");



CREATE INDEX "idx_institutions_status" ON "public"."institutions" USING "btree" ("status");



CREATE INDEX "idx_pg_courses_prereq" ON "public"."prereq_group_courses" USING "btree" ("prereq_group_id");



CREATE INDEX "idx_plan_terms_order" ON "public"."plan_terms" USING "btree" ("plan_id", "display_order");



CREATE INDEX "idx_plan_terms_plan_id" ON "public"."plan_terms" USING "btree" ("plan_id");



CREATE INDEX "idx_planned_course_prerequisites" ON "public"."planned_course_prerequisites" USING "btree" ("planned_course_id");



CREATE INDEX "idx_planned_courses_order" ON "public"."planned_courses" USING "btree" ("plan_term_id", "display_order");



CREATE INDEX "idx_planned_courses_term_id" ON "public"."planned_courses" USING "btree" ("plan_term_id");



CREATE INDEX "idx_prereqgroups_program" ON "public"."prereq_groups" USING "btree" ("program_requirement_id");



CREATE INDEX "idx_program_course_mappings_program" ON "public"."program_course_mappings" USING "btree" ("program_requirement_id");



CREATE INDEX "idx_program_course_mappings_required_course" ON "public"."program_course_mappings" USING "btree" ("program_required_course_id");



CREATE INDEX "idx_program_course_mappings_user" ON "public"."program_course_mappings" USING "btree" ("user_id");



CREATE INDEX "idx_program_required_courses_category" ON "public"."program_required_courses" USING "btree" ("category");



CREATE INDEX "idx_program_required_courses_program" ON "public"."program_required_courses" USING "btree" ("program_requirement_id");



CREATE INDEX "idx_program_requirements_user" ON "public"."program_requirements" USING "btree" ("user_id");



CREATE INDEX "idx_programs_degree" ON "public"."program_requirements" USING "btree" ("degree_type");



CREATE INDEX "idx_programs_discovery" ON "public"."program_requirements" USING "btree" ("is_official", "is_published", "institution_id");



CREATE INDEX "idx_programs_field" ON "public"."program_requirements" USING "btree" ("field_of_study");



CREATE INDEX "idx_programs_institution" ON "public"."program_requirements" USING "btree" ("institution_id");



CREATE INDEX "idx_programs_name" ON "public"."program_requirements" USING "btree" ("lower"("name"));



CREATE INDEX "idx_programs_official" ON "public"."program_requirements" USING "btree" ("is_official");



CREATE INDEX "idx_programs_published" ON "public"."program_requirements" USING "btree" ("is_published");



CREATE INDEX "idx_programs_type" ON "public"."program_requirements" USING "btree" ("program_type");



CREATE INDEX "idx_scenario_overrides" ON "public"."scenario_taken_courses" USING "btree" ("scenario_id");



CREATE INDEX "idx_scenarios_user" ON "public"."scenarios" USING "btree" ("user_id");



CREATE INDEX "idx_taken_courseid" ON "public"."taken_courses" USING "btree" ("course_id");



CREATE INDEX "idx_taken_institution" ON "public"."taken_courses" USING "btree" ("institution_id");



CREATE INDEX "idx_taken_user" ON "public"."taken_courses" USING "btree" ("user_id");



CREATE INDEX "idx_terms_user" ON "public"."terms" USING "btree" ("user_id");



CREATE INDEX "idx_tutorial_progress_type" ON "public"."tutorial_progress" USING "btree" ("tutorial_type");



CREATE INDEX "idx_tutorial_progress_user" ON "public"."tutorial_progress" USING "btree" ("user_id");



CREATE INDEX "idx_user_onboarding_user" ON "public"."user_onboarding" USING "btree" ("user_id");



CREATE INDEX "idx_user_roles_institution" ON "public"."user_roles" USING "btree" ("institution_id");



CREATE INDEX "idx_user_roles_role" ON "public"."user_roles" USING "btree" ("role");



CREATE INDEX "idx_user_roles_user" ON "public"."user_roles" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "update_academic_plans_updated_at" BEFORE UPDATE ON "public"."academic_plans" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_course_equivalencies_updated_at" BEFORE UPDATE ON "public"."course_equivalencies" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_institutions_updated_at" BEFORE UPDATE ON "public"."institutions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_plan_terms_updated_at" BEFORE UPDATE ON "public"."plan_terms" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_planned_courses_updated_at" BEFORE UPDATE ON "public"."planned_courses" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_program_applications_updated_at" BEFORE UPDATE ON "public"."program_applications" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_roles_updated_at" BEFORE UPDATE ON "public"."user_roles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "user_onboarding_set_timestamp" BEFORE UPDATE ON "public"."user_onboarding" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



CREATE OR REPLACE TRIGGER "users_set_timestamp" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



ALTER TABLE ONLY "public"."academic_plans"
    ADD CONSTRAINT "academic_plans_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."academic_plans"
    ADD CONSTRAINT "academic_plans_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."program_requirements"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."academic_plans"
    ADD CONSTRAINT "academic_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audits"
    ADD CONSTRAINT "audits_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."course_equivalencies"
    ADD CONSTRAINT "course_equivalencies_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."course_equivalencies"
    ADD CONSTRAINT "course_equivalencies_equivalent_course_id_fkey" FOREIGN KEY ("equivalent_course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."course_equivalencies"
    ADD CONSTRAINT "course_equivalencies_equivalent_institution_id_fkey" FOREIGN KEY ("equivalent_institution_id") REFERENCES "public"."institutions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."course_equivalencies"
    ADD CONSTRAINT "course_equivalencies_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."course_equivalencies"
    ADD CONSTRAINT "course_equivalencies_target_course_id_fkey" FOREIGN KEY ("target_course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."error_logs"
    ADD CONSTRAINT "error_logs_user_fkey" FOREIGN KEY ("user") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."institutions"
    ADD CONSTRAINT "institutions_institution_admin_id_fkey" FOREIGN KEY ("institution_admin_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."institutions"
    ADD CONSTRAINT "institutions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."plan_terms"
    ADD CONSTRAINT "plan_terms_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."academic_plans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."planned_course_prerequisites"
    ADD CONSTRAINT "planned_course_prerequisites_planned_course_id_fkey" FOREIGN KEY ("planned_course_id") REFERENCES "public"."planned_courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."planned_course_prerequisites"
    ADD CONSTRAINT "planned_course_prerequisites_prerequisite_course_id_fkey" FOREIGN KEY ("prerequisite_course_id") REFERENCES "public"."courses"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."planned_course_prerequisites"
    ADD CONSTRAINT "planned_course_prerequisites_satisfied_by_planned_course_i_fkey" FOREIGN KEY ("satisfied_by_planned_course_id") REFERENCES "public"."planned_courses"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."planned_course_prerequisites"
    ADD CONSTRAINT "planned_course_prerequisites_satisfied_by_taken_course_id_fkey" FOREIGN KEY ("satisfied_by_taken_course_id") REFERENCES "public"."taken_courses"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."planned_courses"
    ADD CONSTRAINT "planned_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."planned_courses"
    ADD CONSTRAINT "planned_courses_plan_term_id_fkey" FOREIGN KEY ("plan_term_id") REFERENCES "public"."plan_terms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."planned_courses"
    ADD CONSTRAINT "planned_courses_taken_course_id_fkey" FOREIGN KEY ("taken_course_id") REFERENCES "public"."taken_courses"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."prereq_group_courses"
    ADD CONSTRAINT "prereq_group_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prereq_group_courses"
    ADD CONSTRAINT "prereq_group_courses_prereq_group_id_fkey" FOREIGN KEY ("prereq_group_id") REFERENCES "public"."prereq_groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prereq_groups"
    ADD CONSTRAINT "prereq_groups_program_requirement_id_fkey" FOREIGN KEY ("program_requirement_id") REFERENCES "public"."program_requirements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."program_applications"
    ADD CONSTRAINT "program_applications_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."program_requirements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."program_applications"
    ADD CONSTRAINT "program_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."program_course_mappings"
    ADD CONSTRAINT "program_course_mappings_program_required_course_id_fkey" FOREIGN KEY ("program_required_course_id") REFERENCES "public"."program_required_courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."program_course_mappings"
    ADD CONSTRAINT "program_course_mappings_program_requirement_id_fkey" FOREIGN KEY ("program_requirement_id") REFERENCES "public"."program_requirements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."program_course_mappings"
    ADD CONSTRAINT "program_course_mappings_taken_course_id_fkey" FOREIGN KEY ("taken_course_id") REFERENCES "public"."taken_courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."program_course_mappings"
    ADD CONSTRAINT "program_course_mappings_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."program_required_courses"
    ADD CONSTRAINT "program_required_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id");



ALTER TABLE ONLY "public"."program_required_courses"
    ADD CONSTRAINT "program_required_courses_program_requirement_id_fkey" FOREIGN KEY ("program_requirement_id") REFERENCES "public"."program_requirements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."program_requirements"
    ADD CONSTRAINT "program_requirements_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."program_requirements"
    ADD CONSTRAINT "program_requirements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."scenario_taken_courses"
    ADD CONSTRAINT "scenario_taken_courses_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "public"."scenarios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."scenario_taken_courses"
    ADD CONSTRAINT "scenario_taken_courses_taken_course_id_fkey" FOREIGN KEY ("taken_course_id") REFERENCES "public"."taken_courses"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."scenario_taken_courses"
    ADD CONSTRAINT "scenario_taken_courses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."scenarios"
    ADD CONSTRAINT "scenarios_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."program_requirements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."scenarios"
    ADD CONSTRAINT "scenarios_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."settings"
    ADD CONSTRAINT "settings_default_term_id_fkey" FOREIGN KEY ("default_term_id") REFERENCES "public"."terms"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."settings"
    ADD CONSTRAINT "settings_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."taken_courses"
    ADD CONSTRAINT "taken_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."taken_courses"
    ADD CONSTRAINT "taken_courses_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."taken_courses"
    ADD CONSTRAINT "taken_courses_original_taken_course_id_fkey" FOREIGN KEY ("original_taken_course_id") REFERENCES "public"."taken_courses"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."taken_courses"
    ADD CONSTRAINT "taken_courses_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "public"."terms"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."taken_courses"
    ADD CONSTRAINT "taken_courses_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."terms"
    ADD CONSTRAINT "terms_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."tutorial_progress"
    ADD CONSTRAINT "tutorial_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_onboarding"
    ADD CONSTRAINT "user_onboarding_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Anyone can view all courses" ON "public"."courses" FOR SELECT USING (true);



CREATE POLICY "Anyone can view approved equivalencies" ON "public"."course_equivalencies" FOR SELECT USING ((("approval_status")::"text" = 'approved'::"text"));



CREATE POLICY "Anyone can view published official programs" ON "public"."program_requirements" FOR SELECT USING (((("is_official" = true) AND ("is_published" = true)) OR ("user_id" = "auth"."uid"())));



CREATE POLICY "Anyone can view verified institutions" ON "public"."institutions" FOR SELECT USING (((("is_official" = true) AND (("status")::"text" = 'verified'::"text")) OR ("user_id" = "auth"."uid"())));



CREATE POLICY "Authenticated users can insert roles" ON "public"."user_roles" FOR INSERT WITH CHECK (true);



CREATE POLICY "Authenticated users can update own onboarding" ON "public"."user_onboarding" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."institutions" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."program_course_mappings" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."program_requirements" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."scenario_taken_courses" FOR DELETE USING (true);



CREATE POLICY "Enable delete for users based on user_id" ON "public"."scenarios" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."taken_courses" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."audits" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."courses" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."prereq_group_courses" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."prereq_groups" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."program_course_mappings" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."program_requirements" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."scenario_taken_courses" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."scenarios" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."settings" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."taken_courses" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."terms" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."tutorial_progress" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."user_onboarding" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."audits" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."courses" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."institutions" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."prereq_group_courses" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."prereq_groups" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."program_course_mappings" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."program_requirements" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."scenarios" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."settings" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."taken_courses" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."terms" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."tutorial_progress" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."user_onboarding" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."users" FOR SELECT USING (true);



CREATE POLICY "Enable update" ON "public"."program_course_mappings" FOR UPDATE USING (true);



CREATE POLICY "Enable update for users based on user_id" ON "public"."scenarios" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable updates for authenticated users" ON "public"."courses" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Enable updates for authenticated users" ON "public"."taken_courses" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Institution admins can manage their institution" ON "public"."institutions" USING ((("institution_admin_id" = "auth"."uid"()) OR ("id" IN ( SELECT "user_roles"."institution_id"
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND (("user_roles"."role")::"text" = ANY ((ARRAY['institution_admin'::character varying, 'institution_staff'::character varying])::"text"[])))))));



CREATE POLICY "Institution staff can manage their equivalencies" ON "public"."course_equivalencies" USING (("institution_id" IN ( SELECT "user_roles"."institution_id"
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND (("user_roles"."role")::"text" = ANY ((ARRAY['institution_admin'::character varying, 'institution_staff'::character varying])::"text"[]))))));



CREATE POLICY "Institution staff can manage their institution courses" ON "public"."courses" USING (("institution_id" IN ( SELECT "user_roles"."institution_id"
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND (("user_roles"."role")::"text" = ANY ((ARRAY['institution_admin'::character varying, 'institution_staff'::character varying])::"text"[]))))));



CREATE POLICY "Institution staff can manage their programs" ON "public"."program_requirements" USING (("institution_id" IN ( SELECT "user_roles"."institution_id"
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND (("user_roles"."role")::"text" = ANY ((ARRAY['institution_admin'::character varying, 'institution_staff'::character varying])::"text"[]))))));



CREATE POLICY "Institution staff can update applications to their programs" ON "public"."program_applications" FOR UPDATE USING (("program_id" IN ( SELECT "pr"."id"
   FROM ("public"."program_requirements" "pr"
     JOIN "public"."user_roles" "ur" ON (("ur"."institution_id" = "pr"."institution_id")))
  WHERE (("ur"."user_id" = "auth"."uid"()) AND (("ur"."role")::"text" = ANY ((ARRAY['institution_admin'::character varying, 'institution_staff'::character varying])::"text"[]))))));



CREATE POLICY "Institution staff can view applications to their programs" ON "public"."program_applications" FOR SELECT USING (("program_id" IN ( SELECT "pr"."id"
   FROM ("public"."program_requirements" "pr"
     JOIN "public"."user_roles" "ur" ON (("ur"."institution_id" = "pr"."institution_id")))
  WHERE (("ur"."user_id" = "auth"."uid"()) AND (("ur"."role")::"text" = ANY ((ARRAY['institution_admin'::character varying, 'institution_staff'::character varying])::"text"[]))))));



CREATE POLICY "Super admins can manage all courses" ON "public"."courses" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND (("user_roles"."role")::"text" = 'super_admin'::"text")))));



CREATE POLICY "Users can create plan terms in their plans" ON "public"."plan_terms" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."academic_plans"
  WHERE (("academic_plans"."id" = "plan_terms"."plan_id") AND ("academic_plans"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can create planned courses in their plans" ON "public"."planned_courses" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."plan_terms"
     JOIN "public"."academic_plans" ON (("academic_plans"."id" = "plan_terms"."plan_id")))
  WHERE (("plan_terms"."id" = "planned_courses"."plan_term_id") AND ("academic_plans"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can create their own academic plans" ON "public"."academic_plans" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own applications" ON "public"."program_applications" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own institutions" ON "public"."institutions" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can create their own programs" ON "public"."program_requirements" FOR INSERT WITH CHECK ((("user_id" = "auth"."uid"()) AND ("is_official" = false)));



CREATE POLICY "Users can delete plan terms in their plans" ON "public"."plan_terms" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."academic_plans"
  WHERE (("academic_plans"."id" = "plan_terms"."plan_id") AND ("academic_plans"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can delete planned courses in their plans" ON "public"."planned_courses" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."plan_terms"
     JOIN "public"."academic_plans" ON (("academic_plans"."id" = "plan_terms"."plan_id")))
  WHERE (("plan_terms"."id" = "planned_courses"."plan_term_id") AND ("academic_plans"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can delete their own academic plans" ON "public"."academic_plans" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own roles" ON "public"."user_roles" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own scenario courses" ON "public"."scenario_taken_courses" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own scenario courses" ON "public"."scenario_taken_courses" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage prerequisites in their plans" ON "public"."planned_course_prerequisites" USING ((EXISTS ( SELECT 1
   FROM (("public"."planned_courses"
     JOIN "public"."plan_terms" ON (("plan_terms"."id" = "planned_courses"."plan_term_id")))
     JOIN "public"."academic_plans" ON (("academic_plans"."id" = "plan_terms"."plan_id")))
  WHERE (("planned_courses"."id" = "planned_course_prerequisites"."planned_course_id") AND ("academic_plans"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage their own programs" ON "public"."program_requirements" USING ((("user_id" = "auth"."uid"()) AND ("is_official" = false)));



CREATE POLICY "Users can update plan terms in their plans" ON "public"."plan_terms" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."academic_plans"
  WHERE (("academic_plans"."id" = "plan_terms"."plan_id") AND ("academic_plans"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update planned courses in their plans" ON "public"."planned_courses" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."plan_terms"
     JOIN "public"."academic_plans" ON (("academic_plans"."id" = "plan_terms"."plan_id")))
  WHERE (("plan_terms"."id" = "planned_courses"."plan_term_id") AND ("academic_plans"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update their own academic plans" ON "public"."academic_plans" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own draft applications" ON "public"."program_applications" FOR UPDATE USING ((("auth"."uid"() = "user_id") AND (("status")::"text" = 'draft'::"text")));



CREATE POLICY "Users can update their own institutions" ON "public"."institutions" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own roles" ON "public"."user_roles" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own scenario courses" ON "public"."scenario_taken_courses" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view plan terms of their plans" ON "public"."plan_terms" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."academic_plans"
  WHERE (("academic_plans"."id" = "plan_terms"."plan_id") AND ("academic_plans"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view planned courses in their plans" ON "public"."planned_courses" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."plan_terms"
     JOIN "public"."academic_plans" ON (("academic_plans"."id" = "plan_terms"."plan_id")))
  WHERE (("plan_terms"."id" = "planned_courses"."plan_term_id") AND ("academic_plans"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view prerequisites in their plans" ON "public"."planned_course_prerequisites" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (("public"."planned_courses"
     JOIN "public"."plan_terms" ON (("plan_terms"."id" = "planned_courses"."plan_term_id")))
     JOIN "public"."academic_plans" ON (("academic_plans"."id" = "plan_terms"."plan_id")))
  WHERE (("planned_courses"."id" = "planned_course_prerequisites"."planned_course_id") AND ("academic_plans"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own academic plans" ON "public"."academic_plans" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own applications" ON "public"."program_applications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own roles" ON "public"."user_roles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own scenario courses" ON "public"."scenario_taken_courses" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."academic_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."course_equivalencies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."error_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."institutions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plan_terms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."planned_course_prerequisites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."planned_courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."prereq_group_courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."prereq_groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."program_applications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."program_course_mappings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."program_requirements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."scenario_taken_courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."scenarios" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."taken_courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."terms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tutorial_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_onboarding" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."calculate_program_completion"("p_user_id" "uuid", "p_program_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_program_completion"("p_user_id" "uuid", "p_program_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_program_completion"("p_user_id" "uuid", "p_program_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_user_onboarding"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_onboarding"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_onboarding"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_institution_stats"("p_institution_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_institution_stats"("p_institution_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_institution_stats"("p_institution_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user_onboarding"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user_onboarding"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user_onboarding"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_role"("check_role" character varying, "check_institution_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."has_role"("check_role" character varying, "check_institution_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_role"("check_role" character varying, "check_institution_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."academic_plans" TO "anon";
GRANT ALL ON TABLE "public"."academic_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."academic_plans" TO "service_role";



GRANT ALL ON TABLE "public"."audits" TO "anon";
GRANT ALL ON TABLE "public"."audits" TO "authenticated";
GRANT ALL ON TABLE "public"."audits" TO "service_role";



GRANT ALL ON TABLE "public"."course_equivalencies" TO "anon";
GRANT ALL ON TABLE "public"."course_equivalencies" TO "authenticated";
GRANT ALL ON TABLE "public"."course_equivalencies" TO "service_role";



GRANT ALL ON TABLE "public"."courses" TO "anon";
GRANT ALL ON TABLE "public"."courses" TO "authenticated";
GRANT ALL ON TABLE "public"."courses" TO "service_role";



GRANT ALL ON TABLE "public"."error_logs" TO "anon";
GRANT ALL ON TABLE "public"."error_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."error_logs" TO "service_role";



GRANT ALL ON TABLE "public"."institutions" TO "anon";
GRANT ALL ON TABLE "public"."institutions" TO "authenticated";
GRANT ALL ON TABLE "public"."institutions" TO "service_role";



GRANT ALL ON TABLE "public"."plan_terms" TO "anon";
GRANT ALL ON TABLE "public"."plan_terms" TO "authenticated";
GRANT ALL ON TABLE "public"."plan_terms" TO "service_role";



GRANT ALL ON TABLE "public"."planned_course_prerequisites" TO "anon";
GRANT ALL ON TABLE "public"."planned_course_prerequisites" TO "authenticated";
GRANT ALL ON TABLE "public"."planned_course_prerequisites" TO "service_role";



GRANT ALL ON TABLE "public"."planned_courses" TO "anon";
GRANT ALL ON TABLE "public"."planned_courses" TO "authenticated";
GRANT ALL ON TABLE "public"."planned_courses" TO "service_role";



GRANT ALL ON TABLE "public"."prereq_group_courses" TO "anon";
GRANT ALL ON TABLE "public"."prereq_group_courses" TO "authenticated";
GRANT ALL ON TABLE "public"."prereq_group_courses" TO "service_role";



GRANT ALL ON TABLE "public"."prereq_groups" TO "anon";
GRANT ALL ON TABLE "public"."prereq_groups" TO "authenticated";
GRANT ALL ON TABLE "public"."prereq_groups" TO "service_role";



GRANT ALL ON TABLE "public"."program_applications" TO "anon";
GRANT ALL ON TABLE "public"."program_applications" TO "authenticated";
GRANT ALL ON TABLE "public"."program_applications" TO "service_role";



GRANT ALL ON TABLE "public"."program_course_mappings" TO "anon";
GRANT ALL ON TABLE "public"."program_course_mappings" TO "authenticated";
GRANT ALL ON TABLE "public"."program_course_mappings" TO "service_role";



GRANT ALL ON TABLE "public"."program_required_courses" TO "anon";
GRANT ALL ON TABLE "public"."program_required_courses" TO "authenticated";
GRANT ALL ON TABLE "public"."program_required_courses" TO "service_role";



GRANT ALL ON TABLE "public"."program_requirements" TO "anon";
GRANT ALL ON TABLE "public"."program_requirements" TO "authenticated";
GRANT ALL ON TABLE "public"."program_requirements" TO "service_role";



GRANT ALL ON TABLE "public"."scenario_taken_courses" TO "anon";
GRANT ALL ON TABLE "public"."scenario_taken_courses" TO "authenticated";
GRANT ALL ON TABLE "public"."scenario_taken_courses" TO "service_role";



GRANT ALL ON TABLE "public"."scenarios" TO "anon";
GRANT ALL ON TABLE "public"."scenarios" TO "authenticated";
GRANT ALL ON TABLE "public"."scenarios" TO "service_role";



GRANT ALL ON TABLE "public"."settings" TO "anon";
GRANT ALL ON TABLE "public"."settings" TO "authenticated";
GRANT ALL ON TABLE "public"."settings" TO "service_role";



GRANT ALL ON TABLE "public"."taken_courses" TO "anon";
GRANT ALL ON TABLE "public"."taken_courses" TO "authenticated";
GRANT ALL ON TABLE "public"."taken_courses" TO "service_role";



GRANT ALL ON TABLE "public"."terms" TO "anon";
GRANT ALL ON TABLE "public"."terms" TO "authenticated";
GRANT ALL ON TABLE "public"."terms" TO "service_role";



GRANT ALL ON TABLE "public"."tutorial_progress" TO "anon";
GRANT ALL ON TABLE "public"."tutorial_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."tutorial_progress" TO "service_role";



GRANT ALL ON TABLE "public"."user_credits_summary" TO "anon";
GRANT ALL ON TABLE "public"."user_credits_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."user_credits_summary" TO "service_role";



GRANT ALL ON TABLE "public"."user_onboarding" TO "anon";
GRANT ALL ON TABLE "public"."user_onboarding" TO "authenticated";
GRANT ALL ON TABLE "public"."user_onboarding" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































drop extension if exists "pg_net";

drop policy "Institution staff can manage their equivalencies" on "public"."course_equivalencies";

drop policy "Institution staff can manage their institution courses" on "public"."courses";

drop policy "Institution admins can manage their institution" on "public"."institutions";

drop policy "Institution staff can update applications to their programs" on "public"."program_applications";

drop policy "Institution staff can view applications to their programs" on "public"."program_applications";

drop policy "Institution staff can manage their programs" on "public"."program_requirements";

alter table "public"."plan_terms" drop constraint "plan_terms_term_type_check";

alter table "public"."plan_terms" add constraint "plan_terms_term_type_check" CHECK (((term_type)::text = ANY ((ARRAY['Fall'::character varying, 'Spring'::character varying, 'Summer'::character varying, 'Winter'::character varying, 'Session'::character varying])::text[]))) not valid;

alter table "public"."plan_terms" validate constraint "plan_terms_term_type_check";


  create policy "Institution staff can manage their equivalencies"
  on "public"."course_equivalencies"
  as permissive
  for all
  to public
using ((institution_id IN ( SELECT user_roles.institution_id
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND ((user_roles.role)::text = ANY ((ARRAY['institution_admin'::character varying, 'institution_staff'::character varying])::text[]))))));



  create policy "Institution staff can manage their institution courses"
  on "public"."courses"
  as permissive
  for all
  to public
using ((institution_id IN ( SELECT user_roles.institution_id
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND ((user_roles.role)::text = ANY ((ARRAY['institution_admin'::character varying, 'institution_staff'::character varying])::text[]))))));



  create policy "Institution admins can manage their institution"
  on "public"."institutions"
  as permissive
  for all
  to public
using (((institution_admin_id = auth.uid()) OR (id IN ( SELECT user_roles.institution_id
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND ((user_roles.role)::text = ANY ((ARRAY['institution_admin'::character varying, 'institution_staff'::character varying])::text[])))))));



  create policy "Institution staff can update applications to their programs"
  on "public"."program_applications"
  as permissive
  for update
  to public
using ((program_id IN ( SELECT pr.id
   FROM (public.program_requirements pr
     JOIN public.user_roles ur ON ((ur.institution_id = pr.institution_id)))
  WHERE ((ur.user_id = auth.uid()) AND ((ur.role)::text = ANY ((ARRAY['institution_admin'::character varying, 'institution_staff'::character varying])::text[]))))));



  create policy "Institution staff can view applications to their programs"
  on "public"."program_applications"
  as permissive
  for select
  to public
using ((program_id IN ( SELECT pr.id
   FROM (public.program_requirements pr
     JOIN public.user_roles ur ON ((ur.institution_id = pr.institution_id)))
  WHERE ((ur.user_id = auth.uid()) AND ((ur.role)::text = ANY ((ARRAY['institution_admin'::character varying, 'institution_staff'::character varying])::text[]))))));



  create policy "Institution staff can manage their programs"
  on "public"."program_requirements"
  as permissive
  for all
  to public
using ((institution_id IN ( SELECT user_roles.institution_id
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND ((user_roles.role)::text = ANY ((ARRAY['institution_admin'::character varying, 'institution_staff'::character varying])::text[]))))));


CREATE TRIGGER on_auth_user_created_onboarding AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_onboarding();


