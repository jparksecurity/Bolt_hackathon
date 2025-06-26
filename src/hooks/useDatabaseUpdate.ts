import { useState, useCallback } from "react";
import { useSupabaseClient } from "../services/supabase";
import { DatabaseUpdateService } from "../services/databaseUpdateService";
import type {
  UpdateSuggestion,
  DatabaseUpdateResult,
} from "../types/aiSuggestions";

interface UseDatabaseUpdateState {
  applying: boolean;
  updateResult: DatabaseUpdateResult | null;
}

interface UseDatabaseUpdateActions {
  applyUpdates: (
    suggestions: UpdateSuggestion[],
  ) => Promise<DatabaseUpdateResult>;
  clearUpdateResult: () => void;
}

/**
 * Custom hook for managing database update operations
 * Handles batch application of approved suggestions
 */
export function useDatabaseUpdate(): UseDatabaseUpdateState &
  UseDatabaseUpdateActions {
  const supabase = useSupabaseClient();
  const [applying, setApplying] = useState(false);
  const [updateResult, setUpdateResult] = useState<DatabaseUpdateResult | null>(
    null,
  );

  const applyUpdates = useCallback(
    async (suggestions: UpdateSuggestion[]): Promise<DatabaseUpdateResult> => {
      setApplying(true);
      setUpdateResult(null);

      try {
        const service = new DatabaseUpdateService(supabase);
        const result = await service.applyApprovedSuggestions(suggestions);

        setUpdateResult(result);
        return result;
      } catch (error) {
        const errorResult: DatabaseUpdateResult = {
          success: false,
          processedCount: 0,
          failedCount: suggestions.length,
          errors: [
            error instanceof Error ? error.message : "Unknown error occurred",
          ],
        };

        setUpdateResult(errorResult);
        return errorResult;
      } finally {
        setApplying(false);
      }
    },
    [supabase],
  );

  const clearUpdateResult = useCallback(() => {
    setUpdateResult(null);
  }, []);

  return {
    applying,
    updateResult,
    applyUpdates,
    clearUpdateResult,
  };
}
