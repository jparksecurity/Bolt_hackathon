/**
 * Shared interface for items that support fractional indexing ordering
 */
export interface OrderedItem {
  id: string;
  order_key: string;
}

/**
 * Base type for any item that can be reordered using fractional indexing
 */
export type Orderable<T = Record<string, unknown>> = T & OrderedItem;
