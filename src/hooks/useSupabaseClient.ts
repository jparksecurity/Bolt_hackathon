import { useAuth } from '@clerk/clerk-react'
import { createClient } from '@supabase/supabase-js'
import { useMemo } from 'react'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export function useSupabaseClient() {
  const { getToken } = useAuth()

  return useMemo(() => {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        // Get the Clerk session token and use it as the access token
        fetch: async (url, options = {}) => {
          // Get the raw Clerk session token (not a template)
          const clerkToken = await getToken()

          // Insert the Clerk session token into the headers
          const headers = new Headers(options?.headers)
          if (clerkToken) {
            headers.set('Authorization', `Bearer ${clerkToken}`)
          }

          // Now call the default fetch
          return fetch(url, {
            ...options,
            headers,
          })
        },
      },
    })
  }, [getToken])
} 