'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AppHeader } from '@/components/layout/AppHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { TAILORING_QUESTIONS, computeApproach } from '@/lib/pmbok/tailoring'
import { PROJECT_SECTORS } from '@/lib/pmbok/constants'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'

const step1Schema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères'),
  description: z.string().optional(),
  sector: z.string().min(1, 'Sélectionnez un secteur'),
  start_date: z.string().optional(),
  target_end_date: z.string().optional(),
  budget: z.string().optional(),
})

type Step1Data = z.infer<typeof step1Schema>

export default function NewProjectPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [tailoringAnswers, setTailoringAnswers] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  const form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { name: '', description: '', sector: '' },
  })

  const tailoringResult = Object.keys(tailoringAnswers).length === TAILORING_QUESTIONS.length
    ? computeApproach(tailoringAnswers)
    : null

  async function handleCreate() {
    const data = form.getValues()
    if (!tailoringResult) return

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        owner_id: user.id,
        name: data.name,
        description: data.description ?? null,
        sector: data.sector,
        approach: tailoringResult.approach,
        start_date: data.start_date || null,
        target_end_date: data.target_end_date || null,
        budget: data.budget ? parseFloat(data.budget) : null,
        tailoring_answers: tailoringAnswers,
        status: 'active',
        success_criteria: [],
      })
      .select()
      .single()

    setLoading(false)

    if (!error && project && 'id' in project) {
      router.push(`/projects/${(project as { id: string }).id}/kanban`)
    }
  }

  return (
    <div>
      <AppHeader
        title="Nouveau projet"
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Nouveau projet' },
        ]}
      />
      <div className="p-6 max-w-2xl mx-auto">
        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                s < step ? 'bg-blue-600 text-white' :
                s === step ? 'bg-blue-600 text-white' :
                'bg-slate-200 text-slate-500'
              }`}>
                {s < step ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`h-px w-12 ${s < step ? 'bg-blue-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
          <span className="ml-2 text-sm text-slate-500">
            {step === 1 ? 'Informations' : step === 2 ? 'Approche projet' : 'Confirmation'}
          </span>
        </div>

        {/* Step 1 — Basic info */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Informations du projet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du projet *</Label>
                <Input id="name" {...form.register('name')} placeholder="Ex: Refonte site e-commerce" />
                {form.formState.errors.name && (
                  <p className="text-xs text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...form.register('description')} rows={3} placeholder="Contexte et objectifs principaux..." />
              </div>
              <div className="space-y-2">
                <Label>Secteur *</Label>
                <Select onValueChange={(v) => form.setValue('sector', v as string)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_SECTORS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Date de début</Label>
                  <Input id="start_date" type="date" {...form.register('start_date')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_end_date">Date cible de fin</Label>
                  <Input id="target_end_date" type="date" {...form.register('target_end_date')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget estimé (€)</Label>
                <Input id="budget" type="number" {...form.register('budget')} placeholder="Ex: 50000" />
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  onClick={async () => {
                    const valid = await form.trigger()
                    if (valid) setStep(2)
                  }}
                >
                  Suivant <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2 — Tailoring */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Approche projet</CardTitle>
              <p className="text-sm text-slate-500">Ces 5 questions déterminent l'approche optimale pour votre projet.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {TAILORING_QUESTIONS.map((q, idx) => (
                <div key={q.id} className="space-y-3">
                  <p className="font-medium text-sm text-slate-800">
                    {idx + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setTailoringAnswers((prev) => ({ ...prev, [q.id]: opt.value }))}
                        className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                          tailoringAnswers[q.id] === opt.value
                            ? 'border-blue-500 bg-blue-50 text-blue-800'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Retour
                </Button>
                <Button
                  disabled={Object.keys(tailoringAnswers).length < TAILORING_QUESTIONS.length}
                  onClick={() => setStep(3)}
                >
                  Voir le résultat <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 — Summary */}
        {step === 3 && tailoringResult && (
          <Card>
            <CardHeader>
              <CardTitle>Résumé et confirmation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800 mb-1">Approche recommandée</p>
                <p className="text-2xl font-bold text-blue-900 capitalize">{tailoringResult.approach === 'hybrid' ? 'Hybride' : tailoringResult.approach === 'predictive' ? 'Prédictive' : 'Agile'}</p>
                <p className="text-sm text-blue-700 mt-2">{tailoringResult.rationale}</p>
                <p className="text-xs text-blue-600 mt-1">Confiance : {tailoringResult.confidence === 'high' ? 'Élevée' : tailoringResult.confidence === 'medium' ? 'Moyenne' : 'Faible'}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Projet</span>
                  <span className="font-medium">{form.getValues('name')}</span>
                </div>
                {form.getValues('target_end_date') && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Date cible</span>
                    <span className="font-medium">{form.getValues('target_end_date')}</span>
                  </div>
                )}
                {form.getValues('budget') && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Budget estimé</span>
                    <span className="font-medium">{Number(form.getValues('budget')).toLocaleString('fr-FR')} €</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Retour
                </Button>
                <Button onClick={handleCreate} disabled={loading}>
                  {loading ? 'Création...' : 'Créer le projet'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

