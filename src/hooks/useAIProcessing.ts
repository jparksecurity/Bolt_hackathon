import { useState, useCallback } from "react";
import { useSupabaseClient } from "../services/supabase";
import type { UpdateSuggestion } from "../types/aiSuggestions";
import { AIProcessingService } from "../services/aiProcessingService";

interface UseAIProcessingState {
  suggestions: UpdateSuggestion[];
  processing: boolean;
  error: string | null;
  showSuggestions: boolean;
}

interface UseAIProcessingActions {
  processWithAI: (inputText: string) => Promise<void>;
  clearSuggestions: () => void;
  clearError: () => void;
}

/**
 * Custom hook for managing AI processing state and operations
 * Handles communication with AI service and manages UI state
 */
export function useAIProcessing(): UseAIProcessingState &
  UseAIProcessingActions {
  const supabase = useSupabaseClient();
  const [suggestions, setSuggestions] = useState<UpdateSuggestion[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const processWithAI = useCallback(
    async (inputText: string) => {
      setProcessing(true);
      setError(null);
      setShowSuggestions(false);

      try {
        const service = new AIProcessingService(supabase);
        const result = await service.processWithAI({ inputText });

        if (result.success) {
          setSuggestions(result.suggestions);
          setShowSuggestions(true);
        } else {
          setError(result.error || "Failed to process with AI");
          setSuggestions([]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred",
        );
        setSuggestions([]);
      } finally {
        setProcessing(false);
      }
    },
    [supabase],
  );

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setShowSuggestions(false);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    suggestions,
    processing,
    error,
    showSuggestions,
    processWithAI,
    clearSuggestions,
    clearError,
  };
}
