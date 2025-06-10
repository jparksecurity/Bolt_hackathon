-- Lease Tracking System Schema for Clerk + Supabase Integration
-- This schema supports multi-tenant lease tracking with Clerk authentication
-- OPTIMIZED VERSION: RLS policies use (SELECT auth.jwt()) pattern for performance

-- Projects table (main entity for each lease tracking project)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL, -- Clerk user identifier
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  start_date DATE,
  expected_fee DECIMAL(10,2),
  broker_commission DECIMAL(10,2),
  commission_paid_by TEXT,
  payment_due TEXT,
  company_name TEXT,
  expected_headcount TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- Soft delete functionality
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
  order_index INTEGER,
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

-- Enable Row Level Security (RLS) for multi-tenant support
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_roadmap ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;

-- OPTIMIZED RLS policies - using (SELECT auth.jwt()) pattern for performance
-- This ensures auth functions are evaluated once per query, not once per row

-- Projects policies - separate policies for different operations with soft delete support
-- SELECT policy - excludes soft-deleted projects by default
CREATE POLICY "Users can view their own active projects" ON projects
  FOR SELECT USING (
    clerk_user_id = (SELECT auth.jwt() ->> 'sub') AND 
    deleted_at IS NULL
  );

-- INSERT policy - allows users to insert their own projects
CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (
    clerk_user_id = (SELECT auth.jwt() ->> 'sub')
  );

-- UPDATE policy - allows users to update their own projects (including soft delete)
CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (
    clerk_user_id = (SELECT auth.jwt() ->> 'sub')
  ) WITH CHECK (
    clerk_user_id = (SELECT auth.jwt() ->> 'sub')
  );

-- DELETE policy - allows users to hard delete their own projects (if needed)
CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (
    clerk_user_id = (SELECT auth.jwt() ->> 'sub')
  );

-- Create a separate policy for viewing deleted projects (for admin/recovery purposes)
CREATE POLICY "Users can view their own deleted projects" ON projects
  FOR SELECT USING (
    clerk_user_id = (SELECT auth.jwt() ->> 'sub') AND 
    deleted_at IS NOT NULL
  );

-- Project contacts policy - users can access contacts for their projects
CREATE POLICY "Users can access their project contacts" ON project_contacts
  FOR ALL USING (project_id IN (
    SELECT id FROM projects WHERE clerk_user_id = (SELECT auth.jwt() ->> 'sub') AND deleted_at IS NULL
  ));

-- Client requirements policy - users can access requirements for their projects
CREATE POLICY "Users can access their client requirements" ON client_requirements
  FOR ALL USING (project_id IN (
    SELECT id FROM projects WHERE clerk_user_id = (SELECT auth.jwt() ->> 'sub') AND deleted_at IS NULL
  ));

-- Project roadmap policy - users can access roadmap for their projects
CREATE POLICY "Users can access their project roadmap" ON project_roadmap
  FOR ALL USING (project_id IN (
    SELECT id FROM projects WHERE clerk_user_id = (SELECT auth.jwt() ->> 'sub') AND deleted_at IS NULL
  ));

-- Properties policy - users can access properties for their projects
CREATE POLICY "Users can access their properties" ON properties
  FOR ALL USING (project_id IN (
    SELECT id FROM projects WHERE clerk_user_id = (SELECT auth.jwt() ->> 'sub') AND deleted_at IS NULL
  ));

-- Property features policy - users can access features for properties in their projects
CREATE POLICY "Users can access their property features" ON property_features
  FOR ALL USING (property_id IN (
    SELECT p.id FROM properties p
    JOIN projects pr ON p.project_id = pr.id
    WHERE pr.clerk_user_id = (SELECT auth.jwt() ->> 'sub') AND pr.deleted_at IS NULL
  ));

-- Project documents policy - users can access documents for their projects
CREATE POLICY "Users can access their project documents" ON project_documents
  FOR ALL USING (project_id IN (
    SELECT id FROM projects WHERE clerk_user_id = (SELECT auth.jwt() ->> 'sub') AND deleted_at IS NULL
  ));

-- Project updates policy - users can access updates for their projects
CREATE POLICY "Users can access their project updates" ON project_updates
  FOR ALL USING (project_id IN (
    SELECT id FROM projects WHERE clerk_user_id = (SELECT auth.jwt() ->> 'sub') AND deleted_at IS NULL
  ));

-- Create indexes for performance optimization
CREATE INDEX idx_projects_clerk_user_id ON projects(clerk_user_id);
CREATE INDEX idx_projects_deleted_at ON projects(deleted_at);
CREATE INDEX idx_projects_clerk_user_deleted ON projects(clerk_user_id, deleted_at);
CREATE INDEX idx_project_contacts_project_id ON project_contacts(project_id);
CREATE INDEX idx_client_requirements_project_id ON client_requirements(project_id);
CREATE INDEX idx_project_roadmap_project_id ON project_roadmap(project_id);
CREATE INDEX idx_project_roadmap_order ON project_roadmap(project_id, order_index);
CREATE INDEX idx_properties_project_id ON properties(project_id);
CREATE INDEX idx_properties_status ON properties(project_id, status);
CREATE INDEX idx_property_features_property_id ON property_features(property_id);
CREATE INDEX idx_project_documents_project_id ON project_documents(project_id);
CREATE INDEX idx_project_updates_project_id ON project_updates(project_id);
CREATE INDEX idx_project_updates_date ON project_updates(project_id, update_date DESC);

-- =====================================
-- STORAGE SETUP
-- =====================================

-- Create a bucket for project documents
-- Note: Storage is already enabled in Supabase local development
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-documents',
  'project-documents', 
  false, -- private bucket, users can only access their own files
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

-- Storage policies for project documents bucket
-- Allow users to upload files to their project folders
CREATE POLICY "Users can upload to their project folders" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-documents' AND
    -- Path should be: user_id/project_id/filename
    (storage.foldername(name))[1] = (SELECT auth.jwt() ->> 'sub') AND
    -- Ensure the project belongs to the user and is not soft-deleted
    (storage.foldername(name))[2] IN (
      SELECT id::text FROM projects 
      WHERE clerk_user_id = (SELECT auth.jwt() ->> 'sub') AND deleted_at IS NULL
    )
  );

-- Allow users to view files from their project folders
CREATE POLICY "Users can view their project files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'project-documents' AND
    -- Path should be: user_id/project_id/filename
    (storage.foldername(name))[1] = (SELECT auth.jwt() ->> 'sub') AND
    -- Ensure the project belongs to the user and is not soft-deleted
    (storage.foldername(name))[2] IN (
      SELECT id::text FROM projects 
      WHERE clerk_user_id = (SELECT auth.jwt() ->> 'sub') AND deleted_at IS NULL
    )
  );

-- Allow users to delete files from their project folders
CREATE POLICY "Users can delete their project files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'project-documents' AND
    -- Path should be: user_id/project_id/filename
    (storage.foldername(name))[1] = (SELECT auth.jwt() ->> 'sub') AND
    -- Ensure the project belongs to the user and is not soft-deleted
    (storage.foldername(name))[2] IN (
      SELECT id::text FROM projects 
      WHERE clerk_user_id = (SELECT auth.jwt() ->> 'sub') AND deleted_at IS NULL
    )
  );

-- Allow users to update files from their project folders  
CREATE POLICY "Users can update their project files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'project-documents' AND
    -- Path should be: user_id/project_id/filename
    (storage.foldername(name))[1] = (SELECT auth.jwt() ->> 'sub') AND
    -- Ensure the project belongs to the user and is not soft-deleted
    (storage.foldername(name))[2] IN (
      SELECT id::text FROM projects 
      WHERE clerk_user_id = (SELECT auth.jwt() ->> 'sub') AND deleted_at IS NULL
    )
  ); 