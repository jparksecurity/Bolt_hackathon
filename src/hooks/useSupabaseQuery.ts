import { useState, useEffect, useCallback } from 'react'
import { useSupabaseClient } from './useSupabaseClient'

interface QueryOptions {
  select?: string
  eq?: Record<string, unknown>
  order?: { column: string; ascending?: boolean }
  single?: boolean
}

interface QueryState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/**
 * Generic hook for querying Supabase tables with automatic loading and error states
 * @param table - The table name to query
 * @param options - Query options (select, filters, ordering, etc.)
 * @param dependencies - Dependencies array to re-run the query when these change
 * @returns Object with data, loading, error states and refetch function
 */
export function useSupabaseQuery<T>(
  table: string,
  options: QueryOptions = {},
  dependencies: unknown[] = []
): QueryState<T> & { refetch: () => void } {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useSupabaseClient()

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase.from(table)

      // Apply select
      if (options.select) {
        query = query.select(options.select)
      } else {
        query = query.select('*')
      }

      // Apply equality filters
      if (options.eq) {
        Object.entries(options.eq).forEach(([column, value]) => {
          query = query.eq(column, value)
        })
      }

      // Apply ordering
      if (options.order) {
        query = query.order(options.order.column, { 
          ascending: options.order.ascending ?? false 
        })
      }

      // Execute query
      const result = options.single ? await query.single() : await query

      if (result.error) {
        console.error(`Error fetching from ${table}:`, result.error)
        setError(result.error.message)
        setData(null)
      } else {
        setData(result.data)
      }
    } catch (err) {
      console.error(`Error fetching from ${table}:`, err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [table, supabase, options.select, options.eq, options.order, options.single, ...dependencies])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData
  }
}

/**
 * Hook for inserting/updating data in Supabase tables
 * @param table - The table name to mutate
 * @returns Object with mutate function and loading/error states
 */
export function useSupabaseMutation<T>(table: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = useSupabaseClient()

  const mutate = useCallback(async (
    operation: 'insert' | 'update' | 'delete',
    data?: unknown,
    options?: { eq?: Record<string, unknown> }
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)

    try {
      let query
      
      switch (operation) {
        case 'insert':
          query = supabase.from(table).insert(data).select()
          break
        case 'update':
          query = supabase.from(table).update(data)
          if (options?.eq) {
            Object.entries(options.eq).forEach(([column, value]) => {
              query = query.eq(column, value)
            })
          }
          query = query.select()
          break
        case 'delete':
          query = supabase.from(table).delete()
          if (options?.eq) {
            Object.entries(options.eq).forEach(([column, value]) => {
              query = query.eq(column, value)
            })
          }
          break
        default:
          throw new Error(`Unsupported operation: ${operation}`)
      }

      const result = await query

      if (result.error) {
        console.error(`Error ${operation} in ${table}:`, result.error)
        setError(result.error.message)
        return null
      }

      return result.data
    } catch (err) {
      console.error(`Error ${operation} in ${table}:`, err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      return null
    } finally {
      setLoading(false)
    }
  }, [table, supabase])

  return {
    mutate,
    loading,
    error
  }
}