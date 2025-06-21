import { generateKeyBetween } from "fractional-indexing";

/**
 * Generate a fractional indexing key between two existing keys
 * @param a - The key before the new position (null for start)
 * @param b - The key after the new position (null for end)
 * @returns A new fractional key that sorts between a and b
 */
export function keyBetween(a: string | null, b: string | null): string {
  return generateKeyBetween(a ?? null, b ?? null);
}

/**
 * Generate the first key for an empty list
 * @returns The first fractional key
 */
export function firstKey(): string {
  return generateKeyBetween(null, null);
}

/**
 * Generate a key that comes before all existing keys in a list
 * @param items - Array of items with order_key property
 * @returns A new key that sorts before all existing keys
 */
export function keyBeforeAll<
  T extends { order_key?: string; order_index?: number | null },
>(items: T[]): string {
  if (items.length === 0) {
    return firstKey();
  }

  // Filter items that have order_key and find the minimum
  const itemsWithKeys = items.filter((item) => item.order_key);
  if (itemsWithKeys.length === 0) {
    return firstKey();
  }

  const minKey = itemsWithKeys.reduce(
    (min, item) => (item.order_key! < min ? item.order_key! : min),
    itemsWithKeys[0].order_key!,
  );

  return generateKeyBetween(null, minKey);
}

/**
 * Generate a key that comes after all existing keys in a list
 * @param items - Array of items with order_key property
 * @returns A new key that sorts after all existing keys
 */
export function keyAfterAll<
  T extends { order_key?: string; order_index?: number | null },
>(items: T[]): string {
  if (items.length === 0) {
    return firstKey();
  }

  // Filter items that have order_key and find the maximum
  const itemsWithKeys = items.filter((item) => item.order_key);
  if (itemsWithKeys.length === 0) {
    return firstKey();
  }

  const maxKey = itemsWithKeys.reduce(
    (max, item) => (item.order_key! > max ? item.order_key! : max),
    itemsWithKeys[0].order_key!,
  );

  return generateKeyBetween(maxKey, null);
}

/**
 * Sort items by their fractional order keys using JavaScript string comparison
 * @param items - Array of items to sort
 * @returns Sorted array
 */
export function sortByOrderKey<T extends { order_key: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    return a.order_key < b.order_key ? -1 : a.order_key > b.order_key ? 1 : 0;
  });
}
