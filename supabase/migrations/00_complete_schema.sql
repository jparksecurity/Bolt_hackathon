-- =====================================================
-- COMPLETE LEASE TRACKING SYSTEM SCHEMA
-- Combines all migrations into one file
-- =====================================================

-- Lease Tracking System Schema for Clerk + Supabase Integration
-- This schema supports multi-tenant lease tracking with Clerk authentication
-- OPTIMIZED VERSION: RLS policies use (SELECT auth.jwt()) pattern for performance

-- =====================================
-- CORE TABLES
-- =====================================

-- Projects table (main entity for each lease tracking project)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL, -- Clerk user identifier
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Pending', 'Completed', 'On Hold')),
  start_date DATE,
  expected_fee DECIMAL(10,2),
  broker_commission DECIMAL(10,2),
  commission_paid_by TEXT,
  payment_due TEXT,
  company_name TEXT,
  expected_headcount TEXT,
  public_share_id UUID UNIQUE, -- For public sharing functionality
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- Soft delete functionality
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to document the valid status values
COMMENT ON COLUMN projects.status IS 'Valid values: Active, Pending, Completed, On Hold';

-- Project contacts table (client contacts for each project)
CREATE TABLE project_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT,
  phone TEXT,
  email TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client requirements table (categorized requirements per project)
CREATE TABLE client_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'Space Requirements', 'Location', 'Other'
  requirement_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project roadmap table (tracking project phases)
CREATE TABLE project_roadmap (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('completed', 'in-progress', 'pending')),
  expected_date DATE,
  completed_date DATE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties table (properties of interest for each project)
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size TEXT,
  rent TEXT,
  availability TEXT,
  description TEXT,
  status TEXT CHECK (status IN ('active', 'new', 'pending', 'declined')),
  decline_reason TEXT,
  lease_type TEXT CHECK (lease_type IN ('Direct Lease', 'Sublease', 'Sub-sublease')),
  service_type TEXT CHECK (service_type IN ('Full Service', 'NNN', 'Modified Gross')),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property features table (features for each property)
CREATE TABLE property_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project documents table (documents associated with projects)
CREATE TABLE project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT, -- Path in Supabase Storage
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project updates table (activity log for each project)
CREATE TABLE project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  update_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================

-- Enable Row Level Security (RLS) for multi-tenant support
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_roadmap ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;

-- Projects policies - SIMPLIFIED: Users can access all their projects (active + deleted)
-- This reduces policy complexity while maintaining security
CREATE POLICY "Users can access their own projects" ON projects
  FOR ALL USING (
    clerk_user_id = (SELECT auth.jwt() ->> 'sub')
  );

-- Project-related tables policies - Use the optimized composite index pattern
-- These policies reference the projects table and benefit from the composite index

-- Project contacts policy
CREATE POLICY "Users can access their project contacts" ON project_contacts
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE clerk_user_id = (SELECT auth.jwt() ->> 'sub')
    )
  );

-- Client requirements policy
CREATE POLICY "Users can access their client requirements" ON client_requirements
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE clerk_user_id = (SELECT auth.jwt() ->> 'sub')
    )
  );

-- Project roadmap policy
CREATE POLICY "Users can access their project roadmap" ON project_roadmap
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE clerk_user_id = (SELECT auth.jwt() ->> 'sub')
    )
  );

-- Properties policy
CREATE POLICY "Users can access their properties" ON properties
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE clerk_user_id = (SELECT auth.jwt() ->> 'sub')
    )
  );

-- Property features policy - optimized with direct join
CREATE POLICY "Users can access their property features" ON property_features
  FOR ALL USING (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN projects pr ON p.project_id = pr.id
      WHERE pr.clerk_user_id = (SELECT auth.jwt() ->> 'sub')
    )
  );

-- Project documents policy
CREATE POLICY "Users can access their project documents" ON project_documents
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE clerk_user_id = (SELECT auth.jwt() ->> 'sub')
    )
  );

-- Project updates policy
CREATE POLICY "Users can access their project updates" ON project_updates
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE clerk_user_id = (SELECT auth.jwt() ->> 'sub')
    )
  );

-- =====================================
-- OPTIMIZED INDEXES
-- =====================================

-- Primary composite index for projects - serves multiple query patterns
CREATE INDEX idx_projects_clerk_user_deleted ON projects(clerk_user_id, deleted_at);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_public_share_id ON projects(public_share_id) WHERE public_share_id IS NOT NULL;

-- Additional indexes for foreign key relationships and common queries
CREATE INDEX idx_project_contacts_project_id ON project_contacts(project_id);
CREATE INDEX idx_client_requirements_project_id ON client_requirements(project_id);
CREATE INDEX idx_project_roadmap_project_id ON project_roadmap(project_id);
CREATE INDEX idx_project_roadmap_order ON project_roadmap(project_id, order_index);
CREATE INDEX idx_properties_project_id ON properties(project_id);
CREATE INDEX idx_properties_status ON properties(project_id, status);
CREATE INDEX idx_properties_order ON properties(project_id, order_index);
CREATE INDEX idx_property_features_property_id ON property_features(property_id);
CREATE INDEX idx_project_documents_project_id ON project_documents(project_id);
CREATE INDEX idx_project_documents_order ON project_documents(project_id, order_index);
CREATE INDEX idx_project_updates_project_id ON project_updates(project_id);
CREATE INDEX idx_project_updates_date ON project_updates(project_id, update_date DESC);

-- =====================================
-- STORAGE SETUP
-- =====================================

-- Create a bucket for project documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-documents',
  'project-documents', 
  true, -- Made public for shared access
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-zip-compressed',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain'
  ]
);

-- Create a function to check if user owns the project (for storage policies)
-- This reduces code duplication in storage policies
CREATE OR REPLACE FUNCTION user_owns_project(project_uuid TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM projects 
    WHERE id = project_uuid::UUID 
    AND clerk_user_id = (SELECT auth.jwt() ->> 'sub')
  );
$$;

-- Storage policies for project documents bucket - OPTIMIZED with function
-- Allow users to upload files to their project folders
CREATE POLICY "Users can upload to their project folders" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-documents' AND
    (storage.foldername(name))[1] = (SELECT auth.jwt() ->> 'sub') AND
    user_owns_project((storage.foldername(name))[2])
  );

-- Allow users to view files from their project folders
CREATE POLICY "Users can view their project files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'project-documents' AND
    (storage.foldername(name))[1] = (SELECT auth.jwt() ->> 'sub') AND
    user_owns_project((storage.foldername(name))[2])
  );

-- Allow users to delete files from their project folders
CREATE POLICY "Users can delete their project files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'project-documents' AND
    (storage.foldername(name))[1] = (SELECT auth.jwt() ->> 'sub') AND
    user_owns_project((storage.foldername(name))[2])
  );

-- Allow users to update files from their project folders  
CREATE POLICY "Users can update their project files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'project-documents' AND
    (storage.foldername(name))[1] = (SELECT auth.jwt() ->> 'sub') AND
    user_owns_project((storage.foldername(name))[2])
  );

-- Add storage policies to allow public read access for documents in shared projects
CREATE POLICY "Public document access for shared projects"
ON storage.objects FOR SELECT
TO anon
USING (
  bucket_id = 'project-documents' 
  AND EXISTS (
    SELECT 1 FROM project_documents pd
    JOIN projects p ON pd.project_id = p.id
    WHERE pd.storage_path = name 
      AND p.public_share_id IS NOT NULL
      AND p.deleted_at IS NULL
  )
);

-- =====================================
-- PUBLIC SHARING FUNCTIONS
-- =====================================

-- Create a secure function to get public project data
-- This function bypasses RLS for the specific case of public sharing
CREATE OR REPLACE FUNCTION get_public_project(share_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  status TEXT,
  start_date DATE,
  expected_fee DECIMAL(10,2),
  broker_commission DECIMAL(10,2),
  commission_paid_by TEXT,
  payment_due TEXT,
  company_name TEXT,
  expected_headcount TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    p.title,
    p.status,
    p.start_date,
    p.expected_fee,
    p.broker_commission,
    p.commission_paid_by,
    p.payment_due,
    p.company_name,
    p.expected_headcount,
    p.created_at,
    p.updated_at
  FROM projects p
  WHERE p.public_share_id = share_id 
    AND p.deleted_at IS NULL;
$$;

-- Create a function to get public project contacts
CREATE OR REPLACE FUNCTION get_public_project_contacts(share_id UUID)
RETURNS TABLE (
  id UUID,
  project_id UUID,
  name TEXT,
  title TEXT,
  phone TEXT,
  email TEXT,
  is_primary BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    pc.id,
    pc.project_id,
    pc.name,
    pc.title,
    pc.phone,
    pc.email,
    pc.is_primary,
    pc.created_at
  FROM project_contacts pc
  JOIN projects p ON pc.project_id = p.id
  WHERE p.public_share_id = share_id 
    AND p.deleted_at IS NULL;
$$;

-- Create a function to get public project roadmap
CREATE OR REPLACE FUNCTION get_public_project_roadmap(share_id UUID)
RETURNS TABLE (
  id UUID,
  project_id UUID,
  title TEXT,
  description TEXT,
  status TEXT,
  expected_date DATE,
  completed_date DATE,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    pr.id,
    pr.project_id,
    pr.title,
    pr.description,
    pr.status,
    pr.expected_date,
    pr.completed_date,
    pr.order_index,
    pr.created_at
  FROM project_roadmap pr
  JOIN projects p ON pr.project_id = p.id
  WHERE p.public_share_id = share_id 
    AND p.deleted_at IS NULL
  ORDER BY pr.order_index;
$$;

-- Create a function to get public properties
CREATE OR REPLACE FUNCTION get_public_properties(share_id UUID)
RETURNS TABLE (
  id UUID,
  project_id UUID,
  name TEXT,
  size TEXT,
  rent TEXT,
  availability TEXT,
  description TEXT,
  status TEXT,
  decline_reason TEXT,
  lease_type TEXT,
  service_type TEXT,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    prop.id,
    prop.project_id,
    prop.name,
    prop.size,
    prop.rent,
    prop.availability,
    prop.description,
    prop.status,
    prop.decline_reason,
    prop.lease_type,
    prop.service_type,
    prop.order_index,
    prop.created_at,
    prop.updated_at
  FROM properties prop
  JOIN projects p ON prop.project_id = p.id
  WHERE p.public_share_id = share_id 
    AND p.deleted_at IS NULL
  ORDER BY prop.order_index;
$$;

-- Create a function to get public property features
CREATE OR REPLACE FUNCTION get_public_property_features(share_id UUID)
RETURNS TABLE (
  id UUID,
  property_id UUID,
  feature TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    pf.id,
    pf.property_id,
    pf.feature,
    pf.created_at
  FROM property_features pf
  JOIN properties prop ON pf.property_id = prop.id
  JOIN projects p ON prop.project_id = p.id
  WHERE p.public_share_id = share_id 
    AND p.deleted_at IS NULL;
$$;

-- Create a function to get public project updates
CREATE OR REPLACE FUNCTION get_public_project_updates(share_id UUID)
RETURNS TABLE (
  id UUID,
  project_id UUID,
  content TEXT,
  update_date DATE,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    pu.id,
    pu.project_id,
    pu.content,
    pu.update_date,
    pu.created_at
  FROM project_updates pu
  JOIN projects p ON pu.project_id = p.id
  WHERE p.public_share_id = share_id 
    AND p.deleted_at IS NULL
  ORDER BY pu.update_date DESC;
$$;

-- Create a function to get public project documents
CREATE OR REPLACE FUNCTION get_public_project_documents(share_id UUID)
RETURNS TABLE (
  id UUID,
  project_id UUID,
  name TEXT,
  file_type TEXT,
  storage_path TEXT,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    pd.id,
    pd.project_id,
    pd.name,
    pd.file_type,
    pd.storage_path,
    pd.order_index,
    pd.created_at
  FROM project_documents pd
  JOIN projects p ON pd.project_id = p.id
  WHERE p.public_share_id = share_id 
    AND p.deleted_at IS NULL
  ORDER BY pd.order_index;
$$;

-- Create a function to get public client requirements
CREATE OR REPLACE FUNCTION get_public_client_requirements(share_id UUID)
RETURNS TABLE (
  id UUID,
  project_id UUID,
  category TEXT,
  requirement_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    cr.id,
    cr.project_id,
    cr.category,
    cr.requirement_text,
    cr.created_at
  FROM client_requirements cr
  JOIN projects p ON cr.project_id = p.id
  WHERE p.public_share_id = share_id 
    AND p.deleted_at IS NULL
  ORDER BY cr.category;
$$;

-- Add function for public document download that returns document info for client-side URL generation
CREATE OR REPLACE FUNCTION get_public_document_info(share_id UUID, document_id UUID)
RETURNS TABLE (
  storage_path TEXT,
  name TEXT,
  file_type TEXT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    pd.storage_path,
    pd.name,
    pd.file_type
  FROM project_documents pd
  JOIN projects p ON pd.project_id = p.id
  WHERE p.public_share_id = share_id 
    AND pd.id = document_id
    AND p.deleted_at IS NULL;
$$;

-- =====================================
-- PERMISSIONS
-- =====================================

-- Grant execute permissions on these functions to anonymous users
GRANT EXECUTE ON FUNCTION get_public_project(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_public_project_contacts(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_public_project_roadmap(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_public_properties(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_public_property_features(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_public_project_updates(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_public_project_documents(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_public_client_requirements(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_public_document_info(UUID, UUID) TO anon; 