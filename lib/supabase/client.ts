import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://pvqwmuirzwszspfkmyhm.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2cXdtdWlyendzenNwZmtteWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzA4NDUsImV4cCI6MjA5Mzg0Njg0NX0.g1lHqfGpNV93P5AgkHr1AQP59T_HWvq_j2eCnX0YBdY'

export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
}
