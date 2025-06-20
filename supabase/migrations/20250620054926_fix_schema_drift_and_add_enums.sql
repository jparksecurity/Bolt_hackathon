-- Add missing storage_path field to project_documents
ALTER TABLE project_documents ADD COLUMN storage_path TEXT;

-- Create enums for better type safety
CREATE TYPE roadmap_status AS ENUM ('completed', 'in-progress', 'pending');
CREATE TYPE document_source_type AS ENUM ('upload', 'google_drive', 'onedrive', 'url');
CREATE TYPE property_status AS ENUM ('new', 'active', 'pending', 'under_review', 'negotiating', 'on_hold', 'declined', 'accepted');
CREATE TYPE property_current_state AS ENUM ('Available', 'Under Review', 'Negotiating', 'On Hold', 'Declined');
CREATE TYPE tour_status AS ENUM ('Scheduled', 'Completed', 'Cancelled', 'Rescheduled');

-- Update project_roadmap to use enum for status
ALTER TABLE project_roadmap ADD COLUMN status_enum roadmap_status;

-- Migrate existing roadmap status data
UPDATE project_roadmap 
SET status_enum = CASE 
  WHEN status = 'completed' THEN 'completed'::roadmap_status
  WHEN status = 'in-progress' THEN 'in-progress'::roadmap_status
  WHEN status = 'pending' THEN 'pending'::roadmap_status
  ELSE 'pending'::roadmap_status -- default fallback
END;

-- Make the new column NOT NULL and drop the old one
ALTER TABLE project_roadmap ALTER COLUMN status_enum SET NOT NULL;
ALTER TABLE project_roadmap DROP COLUMN status;
ALTER TABLE project_roadmap RENAME COLUMN status_enum TO status;

-- Update project_documents to use enum for source_type  
ALTER TABLE project_documents ADD COLUMN source_type_enum document_source_type;

-- Migrate existing document source_type data
UPDATE project_documents 
SET source_type_enum = CASE 
  WHEN source_type = 'upload' THEN 'upload'::document_source_type
  WHEN source_type = 'google_drive' THEN 'google_drive'::document_source_type
  WHEN source_type = 'onedrive' THEN 'onedrive'::document_source_type
  WHEN source_type = 'url' THEN 'url'::document_source_type
  ELSE 'url'::document_source_type -- default fallback
END;

-- Make the new column NOT NULL and drop the old one
ALTER TABLE project_documents ALTER COLUMN source_type_enum SET NOT NULL;
ALTER TABLE project_documents DROP COLUMN source_type;
ALTER TABLE project_documents RENAME COLUMN source_type_enum TO source_type;

-- Update properties table to use enums
ALTER TABLE properties ADD COLUMN status_enum property_status;
ALTER TABLE properties ADD COLUMN current_state_enum property_current_state;
ALTER TABLE properties ADD COLUMN tour_status_enum tour_status;

-- Migrate existing property data
UPDATE properties 
SET status_enum = CASE 
  WHEN status = 'new' THEN 'new'::property_status
  WHEN status = 'active' THEN 'active'::property_status  
  WHEN status = 'pending' THEN 'pending'::property_status
  WHEN status = 'under_review' THEN 'under_review'::property_status
  WHEN status = 'negotiating' THEN 'negotiating'::property_status
  WHEN status = 'on_hold' THEN 'on_hold'::property_status
  WHEN status = 'declined' THEN 'declined'::property_status
  WHEN status = 'accepted' THEN 'accepted'::property_status
  ELSE 'new'::property_status -- default fallback
END;

UPDATE properties 
SET current_state_enum = CASE 
  WHEN current_state = 'Available' THEN 'Available'::property_current_state
  WHEN current_state = 'Under Review' THEN 'Under Review'::property_current_state
  WHEN current_state = 'Negotiating' THEN 'Negotiating'::property_current_state
  WHEN current_state = 'On Hold' THEN 'On Hold'::property_current_state
  WHEN current_state = 'Declined' THEN 'Declined'::property_current_state
  ELSE 'Available'::property_current_state -- default fallback
END;

UPDATE properties 
SET tour_status_enum = CASE 
  WHEN tour_status = 'Scheduled' THEN 'Scheduled'::tour_status
  WHEN tour_status = 'Completed' THEN 'Completed'::tour_status
  WHEN tour_status = 'Cancelled' THEN 'Cancelled'::tour_status
  WHEN tour_status = 'Rescheduled' THEN 'Rescheduled'::tour_status
  ELSE NULL -- allow NULL for properties without tours
END;

-- Replace old columns with enum columns for properties
ALTER TABLE properties DROP COLUMN status;
ALTER TABLE properties DROP COLUMN current_state;
ALTER TABLE properties DROP COLUMN tour_status;
ALTER TABLE properties RENAME COLUMN status_enum TO status;
ALTER TABLE properties RENAME COLUMN current_state_enum TO current_state;
ALTER TABLE properties RENAME COLUMN tour_status_enum TO tour_status;

-- Make status and current_state NOT NULL but allow tour_status to be NULL
ALTER TABLE properties ALTER COLUMN status SET NOT NULL;
ALTER TABLE properties ALTER COLUMN current_state SET NOT NULL;
