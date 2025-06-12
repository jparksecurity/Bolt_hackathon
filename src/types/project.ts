export enum ProjectStatus {
  ACTIVE = 'Active',
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  ON_HOLD = 'On Hold'
}

export interface BaseProjectData {
  id: string;
  title: string;
  status: ProjectStatus;
  start_date?: string | null;
  desired_move_in_date?: string | null;
  expected_fee?: number | null;
  broker_commission?: number | null;
  commission_paid_by?: string | null;
  payment_due?: string | null;
  company_name?: string | null;
  expected_headcount?: string | null;
  contact_name?: string | null;
  contact_title?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  public_share_id?: string | null;
  created_at: string;
  updated_at: string;
}