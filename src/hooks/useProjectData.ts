import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { useSupabaseClient } from "../services/supabase";

interface UseProjectDataOptions {
  projectId?: string;
  shareId?: string;
  dataType:
    | "updates"
    | "properties"
    | "roadmap"
    | "documents"
    | "contacts"
    | "requirements";
}

export function useProjectData<T = unknown>({
  projectId,
  shareId,
  dataType,
}: UseProjectDataOptions) {
  const { user } = useUser();
  const supabase = useSupabaseClient();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isPublicMode = Boolean(shareId);
  const isAuthenticatedMode = Boolean(projectId && user);

  const fetchData = useCallback(async () => {
    if (!isPublicMode && !isAuthenticatedMode) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      let result;

      if (isPublicMode && shareId) {
        // Public mode - use RPC functions
        switch (dataType) {
          case "updates":
            result = await supabase.rpc("get_public_project_updates", {
              share_id: shareId,
            });
            break;
          case "properties":
            result = await supabase.rpc("get_public_properties", {
              share_id: shareId,
            });
            break;
          case "roadmap":
            result = await supabase.rpc("get_public_project_roadmap", {
              share_id: shareId,
            });
            break;
          case "documents":
            result = await supabase.rpc("get_public_project_documents", {
              share_id: shareId,
            });
            break;
          case "contacts":
            result = await supabase.rpc("get_public_project_contacts", {
              share_id: shareId,
            });
            break;
          case "requirements":
            result = await supabase.rpc("get_public_client_requirements", {
              share_id: shareId,
            });
            break;
          default:
            throw new Error(`Unsupported data type: ${dataType}`);
        }
      } else if (isAuthenticatedMode && projectId) {
        // Authenticated mode - use direct table queries
        switch (dataType) {
          case "updates":
            result = await supabase
              .from("project_updates")
              .select("*")
              .eq("project_id", projectId)
              .order("update_date", { ascending: false });
            break;
          case "properties":
            result = await supabase
              .from("properties")
              .select("*")
              .eq("project_id", projectId)
              .order("order_index", { ascending: true });
            break;
          case "roadmap":
            result = await supabase
              .from("project_roadmap")
              .select("*")
              .eq("project_id", projectId)
              .order("order_index", { ascending: true });
            break;
          case "documents":
            result = await supabase
              .from("project_documents")
              .select("*")
              .eq("project_id", projectId)
              .order("order_index", { ascending: true });
            break;
          case "contacts":
            result = await supabase
              .from("project_contacts")
              .select("*")
              .eq("project_id", projectId)
              .order("is_primary", { ascending: false });
            break;
          case "requirements":
            result = await supabase
              .from("client_requirements")
              .select("*")
              .eq("project_id", projectId)
              .order("category");
            break;
          default:
            throw new Error(`Unsupported data type: ${dataType}`);
        }
      }

      if (result?.error) {
        throw result.error;
      }

      setData(result?.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [
    supabase,
    projectId,
    shareId,
    dataType,
    isPublicMode,
    isAuthenticatedMode,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    isPublicMode,
    isAuthenticatedMode,
  };
}
