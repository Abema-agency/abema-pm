'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { MailCheck } from 'lucide-react'

export default function CheckEmailPage() {
  const supabase = useMemo(() => createClient(), [])
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const [resent, setResent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleResend() {
    if (!email) return
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) { setError(error.message) } else { setResent(true) }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur réseau.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
            <MailCheck className="w-7 h-7 text-blue-600" />
          </div>
        </div>
        <CardTitle>Vérifiez votre boîte mail</CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          Un email de confirmation a été envoyé
          {email ? <> à <span className="font-medium text-slate-700">{email}</span></> : ''}.
          {' '}Cliquez sur le lien pour activer votre compte.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {resent && (
          <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
            Email renvoyé avec succès.
          </p>
        )}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
            {error}
          </p>
        )}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleResend}
          disabled={loading || !email || resent}
        >
          {loading ? 'Envoi…' : resent ? 'Email renvoyé ✓' : 'Renvoyer l\'email de confirmation'}
        </Button>
      </CardContent>

      <CardFooter className="justify-center">
        <Link href="/login" className="text-sm text-blue-600 hover:underline font-medium">
          ← Retour à la connexion
        </Link>
      </CardFooter>
    </Card>
  )
}
