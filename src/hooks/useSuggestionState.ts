import { useState, useCallback } from "react";
import type { UpdateSuggestion, SuggestionState } from "../types/aiSuggestions";

interface UseSuggestionStateActions {
  approveSuggestion: (id: string) => void;
  rejectSuggestion: (id: string) => void;
  clearSuggestionState: () => void;
  getApprovedSuggestions: (
    suggestions: UpdateSuggestion[],
  ) => UpdateSuggestion[];
}

/**
 * Custom hook for managing suggestion approval/rejection state
 * Provides clean interface for tracking which suggestions are approved/rejected
 */
export function useSuggestionState(): SuggestionState &
  UseSuggestionStateActions {
  const [approved, setApproved] = useState<Set<string>>(new Set());
  const [rejected, setRejected] = useState<Set<string>>(new Set());

  const approveSuggestion = useCallback((id: string) => {
    setApproved((prev) => new Set(prev).add(id));
    setRejected((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const rejectSuggestion = useCallback((id: string) => {
    setRejected((prev) => new Set(prev).add(id));
    setApproved((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const clearSuggestionState = useCallback(() => {
    setApproved(new Set());
    setRejected(new Set());
  }, []);

  const getApprovedSuggestions = useCallback(
    (suggestions: UpdateSuggestion[]) => {
      return suggestions.filter((suggestion) => approved.has(suggestion.id));
    },
    [approved],
  );

  return {
    approved,
    rejected,
    approveSuggestion,
    rejectSuggestion,
    clearSuggestionState,
    getApprovedSuggestions,
  };
}
