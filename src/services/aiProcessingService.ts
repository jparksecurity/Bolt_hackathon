import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/database";
import type { UpdateSuggestion } from "../types/aiSuggestions";

interface AIProcessingOptions {
  inputText: string;
}

interface AIProcessingResult {
  suggestions: UpdateSuggestion[];
  success: boolean;
  error?: string;
}

/**
 * Service for handling AI processing requests
 * Centralizes communication with the project-intelligence Edge function
 */
export class AIProcessingService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Process input text with AI to generate update suggestions
   */
  async processWithAI(
    options: AIProcessingOptions,
  ): Promise<AIProcessingResult> {
    const { inputText } = options;

    if (!inputText.trim()) {
      return {
        suggestions: [],
        success: false,
        error: "Please provide some information to process.",
      };
    }

    try {
      // Call the Supabase project-intelligence function
      const { data, error } = await this.supabase.functions.invoke(
        "project-intelligence",
        {
          body: {
            inputText: inputText.trim(),
          },
        },
      );

      if (error) {
        return {
          suggestions: [],
          success: false,
          error: error.message || "Failed to process with AI",
        };
      }

      if (data?.suggestions) {
        // Ensure each suggestion has a unique id to prevent React key conflicts
        const uniqueSuggestions: UpdateSuggestion[] = data.suggestions.map(
          (s: UpdateSuggestion, idx: number) => ({
            ...s,
            id: s.id ? `${s.id}-${idx}` : `suggestion-${idx}`,
          }),
        );

        return {
          suggestions: uniqueSuggestions,
          success: true,
        };
      } else {
        return {
          suggestions: [],
          success: false,
          error: "No suggestions received from AI",
        };
      }
    } catch (error) {
      return {
        suggestions: [],
        success: false,
        error:
          error instanceof Error
            ? `Network error: ${error.message}`
            : "An unexpected error occurred during AI processing",
      };
    }
  }
}
