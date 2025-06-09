-- Seed data for Lease Tracking System
-- This provides example data for development and testing

-- Insert the main project
INSERT INTO projects (
  id, clerk_user_id, title, status, start_date, expected_fee,
  broker_commission, commission_paid_by, payment_due,
  company_name, expected_headcount, created_at, updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'user_2yHntOGKi6N4kXscdHcJrYjEpWN',
  'Downtown Tech Hub - Office Lease',
  'Step 2: Market Research & Property Sourcing',
  '2024-01-15',
  0.00,
  15000.00,
  'Landlord',
  'Upon lease signing',
  'TechFlow Innovations',
  '75-100 employees',
  NOW(),
  NOW()
);

-- Insert project contact
INSERT INTO project_contacts (
  id, project_id, name, title, phone, email, is_primary, created_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  'Sarah Chen',
  'Head of Operations',
  '(555) 123-4567',
  'sarah.chen@techflow.com',
  true,
  NOW()
);

-- Insert client requirements - Space Requirements
INSERT INTO client_requirements (project_id, category, requirement_text) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Space Requirements', '15,000 sq ft minimum'),
('550e8400-e29b-41d4-a716-446655440000', 'Space Requirements', 'Open floor plan capability'),
('550e8400-e29b-41d4-a716-446655440000', 'Space Requirements', 'Private meeting rooms (4-6)'),
('550e8400-e29b-41d4-a716-446655440000', 'Space Requirements', 'Reception area');

-- Insert client requirements - Location
INSERT INTO client_requirements (project_id, category, requirement_text) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Location', 'Downtown core preferred'),
('550e8400-e29b-41d4-a716-446655440000', 'Location', 'Public transport access'),
('550e8400-e29b-41d4-a716-446655440000', 'Location', 'Walking distance to restaurants'),
('550e8400-e29b-41d4-a716-446655440000', 'Location', 'Parking availability');

-- Insert client requirements - Other
INSERT INTO client_requirements (project_id, category, requirement_text) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Other', 'Move-in ready by March 2024'),
('550e8400-e29b-41d4-a716-446655440000', 'Other', 'Pet-friendly building preferred'),
('550e8400-e29b-41d4-a716-446655440000', 'Other', 'Natural light priority'),
('550e8400-e29b-41d4-a716-446655440000', 'Other', 'Flexible lease terms (3-5 years)');

-- Insert project roadmap steps
INSERT INTO project_roadmap (
  id, project_id, title, description, status, expected_date, completed_date, order_index
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440010',
  '550e8400-e29b-41d4-a716-446655440000',
  'Initial Client Consultation',
  'Gathered detailed requirements, timeline expectations, and timeline expectations from the client team.',
  'completed',
  '2024-01-15',
  '2024-01-15',
  1
),
(
  '550e8400-e29b-41d4-a716-446655440011',
  '550e8400-e29b-41d4-a716-446655440000',
  'Market Research & Property Sourcing',
  'Identifying suitable properties that match client criteria and conducting market analysis for competitive pricing.',
  'in-progress',
  '2024-02-01',
  NULL,
  2
),
(
  '550e8400-e29b-41d4-a716-446655440012',
  '550e8400-e29b-41d4-a716-446655440000',
  'Property Tours & Negotiations',
  'Schedule property viewings with client and begin lease negotiations with preferred properties.',
  'pending',
  '2024-02-15',
  NULL,
  3
);

-- Insert properties
INSERT INTO properties (
  id, project_id, name, size, rent, availability, description,
  status, lease_type, service_type, created_at, updated_at
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440020',
  '550e8400-e29b-41d4-a716-446655440000',
  'Downtown Tech Tower - 5th Street',
  '18,500 sq ft',
  '$24/sq ft',
  'Available March 2024',
  'Modern Class A office space with exposed brick, high ceilings, and floor-to-ceiling windows. Fiber internet ready, flexible open floor plan perfect for collaborative workspaces. 2 blocks from metro station.',
  'active',
  'Direct Lease',
  'Full Service',
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440021',
  '550e8400-e29b-41d4-a716-446655440000',
  'Innovation District Plaza',
  '16,200 sq ft',
  '$32/sq ft',
  'Available April 2024',
  'Brand new construction in the Innovation District. Features include rooftop terrace, bike storage, and state-of-the-art HVAC. One block south from light rail with incredible views for maximum flexibility.',
  'new',
  'Direct Lease',
  'NNN',
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440022',
  '550e8400-e29b-41d4-a716-446655440000',
  'Historic Warehouse Conversion',
  '22,000 sq ft',
  '$24/sq ft',
  'Available February 2024',
  'Converted warehouse with industrial charm. High ceilings, polished concrete floors, and abundant natural light. Includes parking garage and loading dock. Great for companies wanting unique character.',
  'declined',
  'Sublease',
  'Modified Gross',
  NOW(),
  NOW()
);

-- Update the declined property with decline reason
UPDATE properties
SET decline_reason = 'Client concerned about noise levels from nearby construction and lack of modern HVAC system.'
WHERE id = '550e8400-e29b-41d4-a716-446655440022';

-- Insert property features
INSERT INTO property_features (property_id, feature) VALUES
('550e8400-e29b-41d4-a716-446655440020', 'Virtual Tour'),
('550e8400-e29b-41d4-a716-446655440020', 'Brochure'),
('550e8400-e29b-41d4-a716-446655440021', 'Virtual Tour'),
('550e8400-e29b-41d4-a716-446655440021', 'Brochure Coming Soon'),
('550e8400-e29b-41d4-a716-446655440022', 'Virtual Tour Pending'),
('550e8400-e29b-41d4-a716-446655440022', 'Brochure');

-- Insert project documents
INSERT INTO project_documents (
  id, project_id, name, file_type, created_at
) VALUES
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440000', 'Client Requirements.pdf', 'pdf', NOW()),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440000', 'Market Analysis.xlsx', 'xlsx', NOW()),
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440000', 'Property Photos.zip', 'zip', NOW()),
('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440000', 'Lease Template.docx', 'docx', NOW()),
('550e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440000', 'Financial Projections.pdf', 'pdf', NOW());

-- Insert project updates
INSERT INTO project_updates (
  id, project_id, content, update_date, created_at
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440040',
  '550e8400-e29b-41d4-a716-446655440000',
  'Found 3 potential properties that match your criteria. Scheduling tours for next week. The downtown location on 5th Street looks particularly promising with modern infrastructure and competitive pricing.',
  '2024-01-29',
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440041',
  '550e8400-e29b-41d4-a716-446655440000',
  'Completed market research phase. Identified 15 potential properties within your budget range and location preferences. Moving to property evaluation phase.',
  '2024-01-22',
  NOW()
); 