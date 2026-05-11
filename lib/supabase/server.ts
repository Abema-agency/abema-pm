import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

const SUPABASE_URL = 'https://pvqwmuirzwszspfkmyhm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2cXdtdWlyendzenNwZmtteWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzA4NDUsImV4cCI6MjA5Mzg0Njg0NX0.g1lHqfGpNV93P5AgkHr1AQP59T_HWvq_j2eCnX0YBdY'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Component — ignoring cookie mutation
        }
      },
    },
  })
}
