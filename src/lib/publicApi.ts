import { SupabaseClient } from '@supabase/supabase-js';

export interface PublicProjectData {
  id: string;
  title: string;
  status: string;
  start_date?: string | null;
  expected_fee?: number | null;
  broker_commission?: number | null;
  commission_paid_by?: string | null;
  payment_due?: string | null;
  company_name?: string | null;
  expected_headcount?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicProjectUpdate {
  id: string;
  project_id: string;
  content: string;
  update_date: string;
  created_at: string;
}

export interface PublicProperty {
  id: string;
  project_id: string;
  name: string;
  size?: string | null;
  rent?: string | null;
  availability?: string | null;
  description?: string | null;
  status: string;
  decline_reason?: string | null;
  lease_type?: string | null;
  service_type?: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface PublicRoadmapItem {
  id: string;
  project_id: string;
  title: string;
  description?: string | null;
  status: string;
  expected_date?: string | null;
  completed_date?: string | null;
  order_index: number;
  created_at: string;
}

export interface PublicDocument {
  id: string;
  project_id: string;
  name: string;
  file_type: string;
  storage_path?: string | null;
  order_index: number;
  created_at: string;
}

export class PublicProjectAPI {
  constructor(private supabase: SupabaseClient) {}

  async getProject(shareId: string): Promise<PublicProjectData | null> {
    const { data, error } = await this.supabase
      .rpc('get_public_project', { share_id: shareId });

    if (error) {
      return null;
    }

    return data?.[0] || null;
  }

  async getUpdates(shareId: string): Promise<PublicProjectUpdate[]> {
    const { data, error } = await this.supabase
      .rpc('get_public_project_updates', { share_id: shareId });

    if (error) {
      return [];
    }

    return data || [];
  }

  async getProperties(shareId: string): Promise<PublicProperty[]> {
    const { data, error } = await this.supabase
      .rpc('get_public_properties', { share_id: shareId });

    if (error) {
      return [];
    }

    return data || [];
  }

  async getRoadmap(shareId: string): Promise<PublicRoadmapItem[]> {
    const { data, error } = await this.supabase
      .rpc('get_public_project_roadmap', { share_id: shareId });

    if (error) {
      return [];
    }

    return data || [];
  }

  async getDocuments(shareId: string): Promise<PublicDocument[]> {
    const { data, error } = await this.supabase
      .rpc('get_public_project_documents', { share_id: shareId });

    if (error) {
      return [];
    }

    return data || [];
  }

  async getDocumentDownloadInfo(shareId: string, documentId: string): Promise<{ documentInfo: { storage_path: string; name: string; file_type: string } | null; error: string | null }> {
    try {
      // Get the document info to verify it exists and belongs to the shared project
      const { data, error } = await this.supabase
        .rpc('get_public_document_info', { 
          share_id: shareId, 
          document_id: documentId 
        });

      if (error) {
        return { documentInfo: null, error: error.message };
      }

      if (!data || data.length === 0) {
        return { documentInfo: null, error: 'Document not found or not accessible' };
      }

      return { documentInfo: data[0], error: null };
    } catch {
      return { documentInfo: null, error: 'An unexpected error occurred' };
    }
  }
} 