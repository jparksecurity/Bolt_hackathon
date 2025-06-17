-- Migration: Fix properties status constraint violation
-- This fixes any 'prospect' values that were set by the previous migration
-- The properties table has a check constraint: status IN ('active', 'new', 'pending', 'declined')

-- Update any 'prospect' values to 'new' (which is allowed by the constraint)
UPDATE properties SET status = 'new' WHERE status = 'prospect';

-- Update the default to use 'new' instead of 'prospect'
ALTER TABLE properties 
  ALTER COLUMN status SET DEFAULT 'new'; 