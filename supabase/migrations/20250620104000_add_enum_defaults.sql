-- =====================================================
-- ADD ENUM DEFAULTS
-- Add sensible defaults to enum columns that were converted
-- from TEXT but lost their default values in the process
-- =====================================================

-- 1. PROJECTS TABLE - Add default for status
-- Default to 'Pending' as this is the most logical starting state for new projects
ALTER TABLE projects 
  ALTER COLUMN status SET DEFAULT 'Pending'::project_status;

-- 2. PROJECT_ROADMAP TABLE - Add default for status  
-- Default to 'pending' as new roadmap items start in pending state
ALTER TABLE project_roadmap 
  ALTER COLUMN status SET DEFAULT 'pending'::roadmap_status;

-- 3. PROJECT_DOCUMENTS TABLE - Add default for source_type
-- Default to 'upload' as this is the most common document source type
ALTER TABLE project_documents 
  ALTER COLUMN source_type SET DEFAULT 'upload'::document_source_type;

-- 4. PROPERTIES TABLE - Add defaults for status and current_state
-- Default status to 'new' as properties start as new prospects
-- Default current_state to 'Available' as this is the initial state for most properties
ALTER TABLE properties 
  ALTER COLUMN status SET DEFAULT 'new'::property_status,
  ALTER COLUMN current_state SET DEFAULT 'Available'::property_current_state; 