import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = 'https://pvqwmuirzwszspfkmyhm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2cXdtdWlyendzenNwZmtteWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzA4NDUsImV4cCI6MjA5Mzg0Njg0NX0.g1lHqfGpNV93P5AgkHr1AQP59T_HWvq_j2eCnX0YBdY'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // 303 converts POST→GET so the browser GETs /dashboard (not re-POSTs)
  const response = NextResponse.redirect(new URL('/dashboard', request.url), { status: 303 })

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url),
      { status: 303 }
    )
  }

  return response
}
