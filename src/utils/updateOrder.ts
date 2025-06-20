import { SupabaseClient } from "@supabase/supabase-js";
import { arrayMove } from "@dnd-kit/sortable";

interface OrderableItem {
  id: string;
  order_index?: number | null;
}

export interface UpdateOrderResult<T> {
  success: boolean;
  newOrder: T[];
  error?: Error;
}

/**
 * Shared utility for handling drag-and-drop reorder operations with optimistic updates
 * @param items - Array of items to reorder
 * @param oldIndex - Original index of the dragged item
 * @param newIndex - New index where the item should be placed
 * @param tableName - Name of the Supabase table to update
 * @param supabase - Supabase client instance
 * @returns Promise with result containing success status and new order
 */
export async function updateItemOrder<T extends OrderableItem>(
  items: T[],
  oldIndex: number,
  newIndex: number,
  tableName: string,
  supabase: SupabaseClient,
): Promise<UpdateOrderResult<T>> {
  try {
    // Sort items by order_index first
    const sortedItems = [...items].sort((a, b) => {
      const aOrder = a.order_index ?? 999999;
      const bOrder = b.order_index ?? 999999;
      return aOrder - bOrder;
    });

    // Use arrayMove for cleaner reordering
    const newOrder = arrayMove(sortedItems, oldIndex, newIndex);

    // Update order_index for all items
    const updates = newOrder.map((item, index) => ({
      id: item.id,
      order_index: index,
    }));

    // Batch update all items
    const updatePromises = updates.map((update) =>
      supabase
        .from(tableName)
        .update({ order_index: update.order_index })
        .eq("id", update.id),
    );

    await Promise.all(updatePromises);

    return {
      success: true,
      newOrder: newOrder.map((item, index) => ({
        ...item,
        order_index: index,
      })),
    };
  } catch (error) {
    return {
      success: false,
      newOrder: items,
      error:
        error instanceof Error ? error : new Error("Unknown error occurred"),
    };
  }
}

/**
 * Optimistic update helper that applies changes immediately and rolls back on failure
 * @param items - Current items array
 * @param oldIndex - Original index
 * @param newIndex - New index
 * @param updateFn - Function to apply the server update
 * @param onOptimisticUpdate - Callback for optimistic UI update
 * @param onRollback - Callback for rollback on failure
 * @param onSuccess - Callback for successful update
 */
export async function optimisticUpdateOrder<T extends OrderableItem>(
  items: T[],
  oldIndex: number,
  newIndex: number,
  updateFn: () => Promise<UpdateOrderResult<T>>,
  onOptimisticUpdate: (newOrder: T[]) => void,
  onRollback: () => void,
  onSuccess?: (newOrder: T[]) => void,
): Promise<void> {
  // Sort items first for consistent indexing
  const sortedItems = [...items].sort((a, b) => {
    const aOrder = a.order_index ?? 999999;
    const bOrder = b.order_index ?? 999999;
    return aOrder - bOrder;
  });

  // Apply optimistic update immediately
  const optimisticOrder = arrayMove(sortedItems, oldIndex, newIndex).map(
    (item, index) => ({
      ...item,
      order_index: index,
    }),
  );

  onOptimisticUpdate(optimisticOrder);

  try {
    // Attempt server update
    const result = await updateFn();

    if (result.success) {
      onSuccess?.(result.newOrder);
    } else {
      // Rollback on failure
      onRollback();
      throw result.error || new Error("Update failed");
    }
  } catch (error) {
    // Ensure rollback is called on any error
    onRollback();
    throw error;
  }
}
