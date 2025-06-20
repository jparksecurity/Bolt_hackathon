-- =====================================================
-- CLEANUP TEMPORARY ENUM COLUMNS
-- =====================================================
-- This migration safely removes the temporary *_enum columns
-- that were left behind during the enum migration process.
-- These columns are no longer needed since the original
-- columns have been converted to proper enum types.
-- =====================================================

-- Drop temporary enum columns that were left behind
-- Only drop if they exist to ensure migration is idempotent

-- 1. Clean up projects table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'status_enum') THEN
        ALTER TABLE projects DROP COLUMN status_enum;
    END IF;
END$$;

-- 2. Clean up project_roadmap table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_roadmap' AND column_name = 'status_enum') THEN
        ALTER TABLE project_roadmap DROP COLUMN status_enum;
    END IF;
END$$;

-- 3. Clean up project_documents table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_documents' AND column_name = 'source_type_enum') THEN
        ALTER TABLE project_documents DROP COLUMN source_type_enum;
    END IF;
END$$;

-- 4. Clean up properties table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'status_enum') THEN
        ALTER TABLE properties DROP COLUMN status_enum;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'current_state_enum') THEN
        ALTER TABLE properties DROP COLUMN current_state_enum;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'tour_status_enum') THEN
        ALTER TABLE properties DROP COLUMN tour_status_enum;
    END IF;
END$$;
