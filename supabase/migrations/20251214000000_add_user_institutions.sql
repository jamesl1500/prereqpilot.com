-- Add user_id to institutions to support user-created institutions
-- Existing institutions without user_id are "global" institutions

ALTER TABLE institutions
ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Create index for querying user institutions
CREATE INDEX IF NOT EXISTS idx_institutions_user ON institutions (user_id);

-- Update taken_courses to ensure institution_id is properly linked
-- (No changes needed as foreign key already exists)

COMMENT ON COLUMN institutions.user_id IS 'NULL for global institutions, set for user-created institutions';
