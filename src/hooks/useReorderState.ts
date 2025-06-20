import { useState, useCallback } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { updateItemOrder, optimisticUpdateOrder } from "../utils/updateOrder";

interface OrderableItem {
  id: string;
  order_index?: number | null;
}

interface UseReorderStateOptions {
  tableName: string;
  supabase: SupabaseClient;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useReorderState<T extends OrderableItem>(
  items: T[],
  setItems: (items: T[]) => void,
  options: UseReorderStateOptions,
) {
  const [isReordering, setIsReordering] = useState(false);
  const [reorderError, setReorderError] = useState<string | null>(null);

  const handleReorder = useCallback(
    async (oldIndex: number, newIndex: number) => {
      if (isReordering) return; // Prevent concurrent reorders

      setIsReordering(true);
      setReorderError(null);

      try {
        await optimisticUpdateOrder(
          items,
          oldIndex,
          newIndex,
          // Update function
          () =>
            updateItemOrder(
              items,
              oldIndex,
              newIndex,
              options.tableName,
              options.supabase,
            ),
          // Optimistic update
          (newOrder) => setItems(newOrder),
          // Rollback
          () => setItems(items),
          // Success callback
          (newOrder) => {
            setItems(newOrder);
            options.onSuccess?.();
          },
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to reorder items";
        setReorderError(errorMessage);
        options.onError?.(
          error instanceof Error ? error : new Error(errorMessage),
        );
      } finally {
        setIsReordering(false);
      }
    },
    [items, setItems, options, isReordering],
  );

  const clearError = useCallback(() => {
    setReorderError(null);
  }, []);

  return {
    handleReorder,
    isReordering,
    reorderError,
    clearError,
  };
}
