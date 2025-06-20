-- Create the project_status enum type
CREATE TYPE project_status AS ENUM ('Active', 'Pending', 'Completed', 'On Hold');

-- Add a new column with the enum type
ALTER TABLE projects ADD COLUMN status_enum project_status;

-- Update the new column with values from the existing status column
UPDATE projects 
SET status_enum = CASE 
  WHEN status = 'Active' THEN 'Active'::project_status
  WHEN status = 'Pending' THEN 'Pending'::project_status  
  WHEN status = 'Completed' THEN 'Completed'::project_status
  WHEN status = 'On Hold' THEN 'On Hold'::project_status
  ELSE 'Pending'::project_status -- default fallback
END;

-- Make the new column NOT NULL now that it's populated
ALTER TABLE projects ALTER COLUMN status_enum SET NOT NULL;

-- Drop the old status column
ALTER TABLE projects DROP COLUMN status;

-- Rename the new column to replace the old one
ALTER TABLE projects RENAME COLUMN status_enum TO status;
