import { SupabaseClient } from '@supabase/supabase-js';

interface OrderableItem {
  id: string;
  order_index?: number | null;
}

/**
 * Shared utility for handling drag-and-drop reorder operations
 * @param items - Array of items to reorder
 * @param oldIndex - Original index of the dragged item
 * @param newIndex - New index where the item should be placed
 * @param tableName - Name of the Supabase table to update
 * @param supabase - Supabase client instance
 * @returns Promise that resolves when all updates are complete
 */
export async function updateItemOrder<T extends OrderableItem>(
  items: T[],
  oldIndex: number,
  newIndex: number,
  tableName: string,
  supabase: SupabaseClient
): Promise<void> {
  // Sort items by order_index first
  const sortedItems = [...items].sort((a, b) => {
    const aOrder = a.order_index ?? 999999;
    const bOrder = b.order_index ?? 999999;
    return aOrder - bOrder;
  });

  // Perform the reorder operation
  const newOrder = [...sortedItems];
  const [removed] = newOrder.splice(oldIndex, 1);
  newOrder.splice(newIndex, 0, removed);

  // Update order_index for all items
  const updates = newOrder.map((item, index) => ({
    id: item.id,
    order_index: index,
  }));

  // Batch update all items
  const updatePromises = updates.map(update =>
    supabase
      .from(tableName)
      .update({ order_index: update.order_index })
      .eq('id', update.id)
  );

  await Promise.all(updatePromises);
} 