export interface Project {
  id: string
  clerk_user_id: string
  title: string
  status: string
  start_date: string | null
  expected_fee: number | null
  broker_commission: number | null
  commission_paid_by: string | null
  payment_due: string | null
  company_name: string | null
  expected_headcount: string | null
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  project_id: string
  name: string
  size: string | null
  rent: string | null
  availability: string | null
  description: string | null
  status: 'active' | 'new' | 'pending' | 'declined'
  decline_reason: string | null
  lease_type: 'Direct Lease' | 'Sublease' | 'Sub-sublease' | null
  service_type: 'Full Service' | 'NNN' | 'Modified Gross' | null
  created_at: string
  updated_at: string
}

export interface PropertyFeature {
  id: string
  property_id: string
  feature_name: string
  feature_value: string | null
  created_at: string
}

export interface ProjectUpdate {
  id: string
  project_id: string
  content: string
  update_date: string
  created_at: string
}

export interface ClientRequirement {
  id: string
  project_id: string
  category: string
  requirement_text: string
  created_at: string
}

export interface ProjectContact {
  id: string
  project_id: string
  name: string
  title: string | null
  phone: string | null
  email: string | null
  is_primary: boolean
  created_at: string
}

export interface ProjectDocument {
  id: string
  project_id: string
  name: string
  file_type: string
  file_url: string | null
  created_at: string
}

export interface ProjectRoadmap {
  id: string
  project_id: string
  title: string
  description: string | null
  status: 'completed' | 'in-progress' | 'pending' | null
  expected_date: string | null
  completed_date: string | null
  order_index: number | null
  created_at: string
} 