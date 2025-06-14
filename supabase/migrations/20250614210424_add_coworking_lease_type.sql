-- =====================================================
-- ADD COWORKING LEASE TYPE OPTION
-- Updates lease_type constraint to include 'Coworking' option
-- =====================================================

-- Drop the existing lease_type constraint if it exists
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_lease_type_check;

-- Add the updated lease_type constraint that includes Coworking
ALTER TABLE properties 
ADD CONSTRAINT properties_lease_type_check 
CHECK (lease_type IS NULL OR lease_type IN ('Direct Lease', 'Sublease', 'Sub-sublease', 'Coworking'));
