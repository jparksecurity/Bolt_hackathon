-- Seed data for Lease Tracking System
-- This provides example data for development and testing

-- Insert the main project with enhanced data for new UI
INSERT INTO projects (
  id, clerk_user_id, title, status, start_date, desired_move_in_date, 
  expected_contract_value, expected_fee, broker_commission, commission_paid_by, payment_due,
  company_name, expected_headcount, 
  contact_name, contact_title, contact_phone, contact_email,
  broker_contact_name, broker_contact_title, broker_contact_phone, broker_contact_email, brokerage,
  city, state,
  created_at, updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'user_2yHntOGKi6N4kXscdHcJrYjEpWN',
  'Downtown Tech Hub - Office Lease',
  'Active',
  '2024-01-15',
  '2024-03-01',
  2400000.00,    -- $2.4M lease value (18,500 sf × $24/sf × 5.4 years avg)
  125000.00,     -- $125K tenant fee (typical 5-6% of lease value)
  48000.00,      -- $48K broker commission (2% of lease value)
  'Landlord',
  'Upon lease signing',
  'TechFlow Innovations',
  '75-100 employees',
  'Sarah Chen',
  'Head of Operations',
  '(555) 123-4567',
  'sarah.chen@techflow.com',
  'Michael Rodriguez',
  'Senior Commercial Broker',
  '(555) 987-6543',
  'mrodriguez@cbre.com',
  'CBRE',
  'San Francisco',
  'CA',
  NOW(),
  NOW()
);

-- Insert a second project to showcase dashboard aggregation
INSERT INTO projects (
  id, clerk_user_id, title, status, start_date, desired_move_in_date, 
  expected_contract_value, expected_fee, broker_commission, commission_paid_by, payment_due,
  company_name, expected_headcount, 
  contact_name, contact_title, contact_phone, contact_email,
  broker_contact_name, broker_contact_title, broker_contact_phone, broker_contact_email, brokerage,
  city, state,
  created_at, updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'user_2yHntOGKi6N4kXscdHcJrYjEpWN',
  'Warehouse Expansion Project',
  'Pending',
  '2024-02-01',
  '2024-04-15',
  1800000.00,    -- $1.8M lease value 
  90000.00,      -- $90K tenant fee
  36000.00,      -- $36K broker commission
  'Tenant',
  'Net 30 days after lease execution',
  'LogiCorp Distribution',
  '40-60 employees',
  'David Kim',
  'Facilities Manager', 
  '(555) 234-5678',
  'david.kim@logicorp.com',
  'Jennifer Walsh',
  'Industrial Specialist',
  '(555) 876-5432',
  'j.walsh@cushwake.com',
  'Cushman & Wakefield',
  'Oakland',
  'CA',
  NOW(),
  NOW()
);

-- Insert a completed project for dashboard metrics
INSERT INTO projects (
  id, clerk_user_id, title, status, start_date, desired_move_in_date, 
  expected_contract_value, expected_fee, broker_commission, commission_paid_by, payment_due,
  company_name, expected_headcount, 
  contact_name, contact_title, contact_phone, contact_email,
  broker_contact_name, broker_contact_title, broker_contact_phone, broker_contact_email, brokerage,
  city, state,
  created_at, updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440002',
  'user_2yHntOGKi6N4kXscdHcJrYjEpWN',
  'Financial District Headquarters',
  'Completed',
  '2023-11-01',
  '2024-01-01',
  3200000.00,    -- $3.2M lease value 
  160000.00,     -- $160K tenant fee
  64000.00,      -- $64K broker commission
  'Landlord',
  'Paid upon lease signing',
  'FinanceMax Solutions',
  '120-150 employees',
  'Emily Rodriguez',
  'Chief Operating Officer',
  '(555) 345-6789',
  'emily.rodriguez@financemax.com',
  'Robert Chen',
  'Executive Director',
  '(555) 765-4321',
  'rchen@jll.com',
  'JLL',
  'San Francisco',
  'CA',
  NOW(),
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

-- Insert client requirements for Warehouse project
INSERT INTO client_requirements (project_id, category, requirement_text) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Space Requirements', 'Minimum 25,000 sq ft warehouse space'),
('550e8400-e29b-41d4-a716-446655440001', 'Space Requirements', 'Loading dock access (minimum 4 docks)'),
('550e8400-e29b-41d4-a716-446655440001', 'Space Requirements', 'Office space for 15-20 staff'),
('550e8400-e29b-41d4-a716-446655440001', 'Location', 'Within 10 miles of major highways'),
('550e8400-e29b-41d4-a716-446655440001', 'Location', 'Industrial zoning preferred'),
('550e8400-e29b-41d4-a716-446655440001', 'Other', 'Ground-level access required'),
('550e8400-e29b-41d4-a716-446655440001', 'Other', 'Climate-controlled storage areas');

-- Insert client requirements for completed Financial project
INSERT INTO client_requirements (project_id, category, requirement_text) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'Space Requirements', 'Class A office building required'),
('550e8400-e29b-41d4-a716-446655440002', 'Space Requirements', 'Executive conference facilities'),
('550e8400-e29b-41d4-a716-446655440002', 'Space Requirements', 'Secure document storage'),
('550e8400-e29b-41d4-a716-446655440002', 'Location', 'Financial District proximity essential'),
('550e8400-e29b-41d4-a716-446655440002', 'Location', 'Premium building image required'),
('550e8400-e29b-41d4-a716-446655440002', 'Other', 'Move-in completed January 2024'),
('550e8400-e29b-41d4-a716-446655440002', 'Other', 'Long-term lease (7-10 years)');

-- Insert project roadmap steps
INSERT INTO project_roadmap (
  id, project_id, title, description, status, expected_date, completed_date, order_key
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440010',
  '550e8400-e29b-41d4-a716-446655440000',
  'Initial Client Consultation',
  'Gathered detailed requirements, timeline expectations, and timeline expectations from the client team.',
  'completed',
  '2024-01-15',
  '2024-01-15',
  'a0'
),
(
  '550e8400-e29b-41d4-a716-446655440011',
  '550e8400-e29b-41d4-a716-446655440000',
  'Market Research & Property Sourcing',
  'Identifying suitable properties that match client criteria and conducting market analysis for competitive pricing.',
  'in-progress',
  '2024-02-01',
  NULL,
  'a1'
),
(
  '550e8400-e29b-41d4-a716-446655440012',
  '550e8400-e29b-41d4-a716-446655440000',
  'Property Tours & Negotiations',
  'Schedule property viewings with client and begin lease negotiations with preferred properties.',
  'pending',
  '2024-02-15',
  NULL,
  'a2'
);

-- Insert properties with tour information
INSERT INTO properties (
  id, project_id, name, address, sf, people_capacity, price_per_sf, monthly_cost,
  expected_monthly_cost, contract_term, availability, lease_type, lease_structure, current_state, condition, misc_notes,
  virtual_tour_url, suggestion, flier_url, 
  tour_datetime, tour_location, tour_status,
  status, order_key, created_at, updated_at
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440020',
  '550e8400-e29b-41d4-a716-446655440000',
  'Downtown Tech Tower - 5th Street',
  '123 Tech Boulevard, Downtown',
  '18,500',
  '90-110',
  '$24',
  '$37,000',
  '$35,000',
  '3-5 years',
  'Available March 2024',
  'Direct Lease',
  'Full Service',
  'Available',
  'Built-out',
  'Modern Class A office space with exposed brick, high ceilings, and floor-to-ceiling windows. Fiber internet ready, flexible open floor plan perfect for collaborative workspaces. 2 blocks from metro station.',
  'https://drive.google.com/file/d/1example-virtual-tour-tech-tower',
  'Highly recommended - perfect location and modern infrastructure',
  'https://drive.google.com/file/d/1example-flier-tech-tower',
  '2024-02-08 14:00:00+00',
  'Meet at main lobby with building manager',
  'Scheduled',
  'active',
  'a0',
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440021',
  '550e8400-e29b-41d4-a716-446655440000',
  'Innovation District Plaza',
  '456 Innovation Way, Innovation District',
  '16,200',
  '75-95',
  '$32',
  '$43,200',
  '$41,000',
  '5-7 years',
  'Available April 2024',
  'Direct Lease',
  'NNN',
  'Under Review',
  'Turnkey',
  'Brand new construction in the Innovation District. Features include rooftop terrace, bike storage, and state-of-the-art HVAC. One block south from light rail with incredible views for maximum flexibility.',
  'https://drive.google.com/file/d/1example-virtual-tour-innovation',
  'Great amenities but higher cost - consider if budget allows',
  'https://drive.google.com/file/d/1example-flier-innovation',
  '2024-01-25 10:30:00+00',
  'Property management office, 2nd floor',
  'Completed',
  'new',
  'a1',
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440022',
  '550e8400-e29b-41d4-a716-446655440000',
  'Historic Warehouse Conversion',
  '789 Industrial Avenue, Warehouse District',
  '22,000',
  '100-130',
  '$24',
  '$44,000',
  '$42,000',
  '3-4 years',
  'Available February 2024',
  'Sublease',
  'Full Service',
  'Declined',
  'White Box',
  'Converted warehouse with industrial charm. High ceilings, polished concrete floors, and abundant natural light. Includes parking garage and loading dock. Great for companies wanting unique character.',
  NULL,
  'Consider for future if noise concerns can be addressed',
  'https://drive.google.com/file/d/1example-flier-warehouse',
  '2024-01-30 16:00:00+00',
  'Loading dock entrance - ask for Tom',
  'Cancelled',
  'declined',
  'a2',
  NOW(),
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440023',
  '550e8400-e29b-41d4-a716-446655440000',
  'Riverside Executive Center',
  '321 River View Drive, Financial District',
  '14,800',
  '70-85',
  '$28',
  '$34,500',
  '$33,000',
  '3-6 years',
  'Available May 2024',
  'Direct Lease',
  'NNN',
  'Negotiating',
  'Plug & Play',
  'Premium executive office space with stunning river views. Recently renovated with modern amenities, conference facilities, and executive parking. Walking distance to financial district and waterfront.',
  'https://drive.google.com/file/d/1example-virtual-tour-riverside',
  'Excellent location and amenities, slightly over budget but worth considering',
  'https://drive.google.com/file/d/1example-flier-riverside',
  '2024-02-12 11:00:00+00',
  'Executive lobby, ask for Ms. Johnson',
  'Rescheduled',
  'pending',
  'a3',
  NOW(),
  NOW()
);

-- Update the declined property with decline reason
UPDATE properties
SET decline_reason = 'Client concerned about noise levels from nearby construction and lack of modern HVAC system.'
WHERE id = '550e8400-e29b-41d4-a716-446655440022';


-- Insert project documents
INSERT INTO project_documents (
  id, project_id, name, file_type, document_url, source_type, order_key, created_at
) VALUES
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440000', 'Client Requirements.pdf', 'pdf', 'https://drive.google.com/file/d/1example-client-requirements-doc', 'google_drive', 'a0', NOW()),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440000', 'Market Analysis.xlsx', 'xlsx', 'https://docs.google.com/spreadsheets/d/1example-market-analysis-sheet', 'google_drive', 'a1', NOW()),
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440000', 'Property Photos.zip', 'zip', 'https://drive.google.com/file/d/1example-property-photos-zip', 'google_drive', 'a2', NOW()),
('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440000', 'Lease Template.docx', 'docx', 'https://1drv.ms/w/example-lease-template-onedrive', 'onedrive', 'a3', NOW()),
('550e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440000', 'Financial Projections.pdf', 'pdf', 'https://drive.google.com/file/d/1example-financial-projections', 'google_drive', 'a4', NOW());

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