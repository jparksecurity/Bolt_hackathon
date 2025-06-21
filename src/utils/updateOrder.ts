import { SupabaseClient } from "@supabase/supabase-js";
import { arrayMove } from "@dnd-kit/sortable";
import {
  generateSafeKey,
  needsReindexing,
  reindexOrderKeys,
  batchUpdateOrderKeys,
  logKeyStats,
} from "./keyMaintenance";
import { type OrderedItem } from "../types/ordered";

export interface UpdateOrderResult<T> {
  success: boolean;
  newOrder: T[];
  error?: Error;
}

/**
 * Shared utility for handling drag-and-drop reorder operations with fractional indexing
 * @param items - Array of items to reorder
 * @param oldIndex - Original index of the dragged item
 * @param newIndex - New index where the item should be placed
 * @param tableName - Name of the Supabase table to update
 * @param supabase - Supabase client instance
 * @returns Promise with result containing success status and new order
 */
export async function updateItemOrder<T extends OrderedItem>(
  items: T[],
  oldIndex: number,
  newIndex: number,
  tableName: string,
  supabase: SupabaseClient,
): Promise<UpdateOrderResult<T>> {
  try {
    logKeyStats(items, `updateItemOrder(${tableName})`);

    // Create reordered array
    const reorderedItems = arrayMove([...items], oldIndex, newIndex);
    const draggedItem = reorderedItems[newIndex];

    // Check if we need full reindexing
    if (needsReindexing(items)) {
      console.log(`Reindexing ${tableName} due to long keys`);
      const reindexedItems = reindexOrderKeys(reorderedItems);
      await batchUpdateOrderKeys(reindexedItems, tableName, supabase);

      return {
        success: true,
        newOrder: reindexedItems,
      };
    }

    // Generate safe key for just the moved item
    const newOrderKey = generateSafeKey(items, oldIndex, newIndex);

    // Update only the dragged item in the database
    const { error } = await supabase
      .from(tableName)
      .update({ order_key: newOrderKey })
      .eq("id", draggedItem.id);

    if (error) throw error;

    // Return the new order with updated key
    const newOrder = reorderedItems.map((item) =>
      item.id === draggedItem.id ? { ...item, order_key: newOrderKey } : item,
    );

    return {
      success: true,
      newOrder,
    };
  } catch (error) {
    console.error(`Error updating order in ${tableName}:`, error);
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
export async function optimisticUpdateOrder<T extends OrderedItem>(
  items: T[],
  oldIndex: number,
  newIndex: number,
  updateFn: () => Promise<UpdateOrderResult<T>>,
  onOptimisticUpdate: (newOrder: T[]) => void,
  onRollback: () => void,
  onSuccess?: (newOrder: T[]) => void,
): Promise<void> {
  // Apply optimistic update immediately with fractional keys
  const optimisticOrder = arrayMove([...items], oldIndex, newIndex);

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
