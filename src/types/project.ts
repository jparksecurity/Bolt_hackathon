export interface BaseProjectData {
  id: string;
  title: string;
  company_name?: string | null;
  city?: string | null;
  state?: string | null;
  start_date?: string | null;
  desired_move_in_date?: string | null;
  status: string;
  broker_commission?: number | null;
  expected_fee?: number | null;
  dashboard_card_order?: ProjectCard[] | null;
  public_share_id?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface ProjectCard {
  id: string;
  type: 'updates' | 'availability' | 'properties' | 'roadmap' | 'documents';
  title: string;
  order_index: number;
} 