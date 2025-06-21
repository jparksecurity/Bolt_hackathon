import { generateKeyBetween, generateNKeysBetween } from "fractional-indexing";
import { OrderedItem } from "../types/ordered";

/**
 * Maximum recommended length for order keys before reindexing
 */
const MAX_KEY_LENGTH = 40;

/**
 * Check if any keys in the list are too long and need reindexing
 */
export function needsReindexing<T extends OrderedItem>(items: T[]): boolean {
  return items.some((item) => item.order_key.length > MAX_KEY_LENGTH);
}

/**
 * Generate evenly spaced fractional keys for a list of items
 * This completely regenerates all keys with optimal spacing
 */
export function reindexOrderKeys<T extends OrderedItem>(items: T[]): T[] {
  if (items.length === 0) return items;

  // Generate evenly spaced keys
  const newKeys = generateNKeysBetween(null, null, items.length);

  return items.map((item, index) => ({
    ...item,
    order_key: newKeys[index],
  }));
}

/**
 * Safe key generation that handles collisions by falling back to reindexing
 */
export function generateSafeKey<T extends OrderedItem>(
  items: T[],
  oldIndex: number,
  newIndex: number,
): string {
  // Create the reordered array to get correct neighbors
  const reorderedItems = [...items];
  const [movedItem] = reorderedItems.splice(oldIndex, 1);
  reorderedItems.splice(newIndex, 0, movedItem);

  // Calculate neighbors from the reordered array
  const prevKey =
    newIndex > 0 ? (reorderedItems[newIndex - 1]?.order_key ?? null) : null;
  const nextKey =
    newIndex < reorderedItems.length - 1
      ? (reorderedItems[newIndex + 1]?.order_key ?? null)
      : null;

  try {
    const newKey = generateKeyBetween(prevKey, nextKey);

    if (!newKey) {
      // Collision occurred - this is rare but possible
      console.warn("Key collision detected, regenerating all keys");
      throw new Error("Key collision");
    }

    // Check if the new key is getting too long
    if (newKey.length > MAX_KEY_LENGTH) {
      console.warn(
        `Generated key is too long (${newKey.length} chars), reindexing needed`,
      );
      throw new Error("Key too long");
    }

    return newKey;
  } catch (error) {
    // Fall back to reindexing - this regenerates optimal keys for the entire list
    console.warn("Falling back to full reindexing due to:", error);

    // Use the same reordered array for consistency
    const reindexed = reindexOrderKeys(reorderedItems);
    return reindexed[newIndex].order_key;
  }
}

/**
 * Batch update order keys in database
 * Updates multiple items efficiently in a single transaction
 */
export async function batchUpdateOrderKeys<T extends OrderedItem>(
  items: T[],
  tableName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<void> {
  if (items.length === 0) return;

  try {
    // Use Supabase's upsert functionality for batch updates
    const updates = items.map((item) => ({
      id: item.id,
      order_key: item.order_key,
    }));

    const { error } = await supabase.from(tableName).upsert(updates, {
      onConflict: "id",
      ignoreDuplicates: false,
    });

    if (error) {
      throw error;
    }

    console.log(
      `Successfully updated ${items.length} order keys in ${tableName}`,
    );
  } catch (error) {
    console.error(`Failed to batch update order keys in ${tableName}:`, error);
    throw error;
  }
}

/**
 * Monitor and log key length statistics
 */
export function logKeyStats<T extends OrderedItem>(
  items: T[],
  context: string,
): void {
  if (items.length === 0) return;

  const lengths = items.map((item) => item.order_key.length);
  const maxLength = Math.max(...lengths);
  const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;

  console.log(
    `[${context}] Key stats: avg=${avgLength.toFixed(1)}, max=${maxLength}, items=${items.length}`,
  );

  if (maxLength > MAX_KEY_LENGTH) {
    console.warn(
      `[${context}] Keys are getting long! Max length: ${maxLength} (threshold: ${MAX_KEY_LENGTH})`,
    );
  }
}
