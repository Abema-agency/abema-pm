import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('id, onboarding_completed')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return NextResponse.json({
    cookieNames: allCookies.map(c => c.name),
    cookieCount: allCookies.length,
    user: user ? { id: user.id, email: user.email } : null,
    error: error?.message ?? null,
    profile,
  })
}
