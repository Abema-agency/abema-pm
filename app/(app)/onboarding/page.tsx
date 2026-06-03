// app/(app)/onboarding/page.tsx
'use client'

import { useOnboardingStore, recommendApproach } from '@/store/useOnboardingStore'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { UserProfileType, ProjectSector } from '@/types/project'
import type { TailoringAnswers } from '@/store/useOnboardingStore'

const PROFILES = [
  { value: 'artisan' as UserProfileType,     label: 'Artisan / TPE',  desc: 'Chantiers, missions, commandes concrètes' },
  { value: 'pm_advanced' as UserProfileType, label: 'Chef de projet', desc: 'Projets complexes, méthode PMBOK' },
  { value: 'sme_manager' as UserProfileType, label: 'Dirigeant PME',  desc: 'Pilotage multi-projets stratégiques' },
]

const SECTORS: { value: ProjectSector; label: string }[] = [
  { value: 'construction',       label: 'BTP / Construction' },
  { value: 'it_software',        label: 'IT / Logiciel' },
  { value: 'marketing_events',   label: 'Marketing / Événements' },
  { value: 'rd_innovation',      label: 'R&D / Innovation' },
  { value: 'transformation',     label: 'Transformation' },
  { value: 'product_launch',     label: 'Lancement produit' },
  { value: 'regulatory_public',  label: 'Réglementation / Public' },
  { value: 'other',              label: 'Autre' },
]

const APPROACHES = [
  { value: 'predictive' as const, label: 'Prédictif', desc: 'Périmètre fixé dès le début, livrables formels' },
  { value: 'agile' as const,      label: 'Agile',     desc: 'Livraisons continues, périmètre évolutif' },
  { value: 'hybrid' as const,     label: 'Hybride',   desc: 'Mix des deux selon les phases' },
]

const TAILORING_QUESTIONS: {
  key: keyof TailoringAnswers
  question: string
  options: { value: string; label: string }[]
}[] = [
  {
    key: 'teamSize',
    question: 'Taille de votre équipe projet ?',
    options: [{ value: '1-3', label: '1–3 personnes' }, { value: '4-10', label: '4–10 personnes' }, { value: '10+', label: '10+ personnes' }],
  },
  {
    key: 'scopeDefined',
    question: 'Le périmètre est-il défini dès le départ ?',
    options: [{ value: 'fixed', label: 'Oui, figé' }, { value: 'partial', label: 'Partiellement' }, { value: 'evolving', label: 'Non, évolutif' }],
  },
  {
    key: 'formalDeliverables',
    question: 'Votre client demande-t-il des livrables formels ?',
    options: [{ value: 'yes', label: 'Oui' }, { value: 'no', label: 'Non' }],
  },
  {
    key: 'fixedBudget',
    question: 'Avez-vous une contrainte de budget fixe ?',
    options: [{ value: 'yes', label: 'Oui' }, { value: 'no', label: 'Non' }],
  },
  {
    key: 'deliveryFrequency',
    question: 'À quelle fréquence livrez-vous ?',
    options: [{ value: 'milestones', label: 'Par jalons' }, { value: 'continuous', label: 'En continu' }, { value: 'both', label: 'Les deux' }],
  },
]

export default function OnboardingPage() {
  const { step, data, nextStep, prevStep, updateData, updateTailoring } = useOnboardingStore()
  const supabase = createClient()

  async function handleFinish() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const approach = data.firstProjectApproach ?? recommendApproach(data.tailoring)

    await supabase
      .from('profiles')
      .update({
        profile_type: data.profileType ?? 'artisan',
        onboarding_completed: true,
      } as { profile_type: UserProfileType; onboarding_completed: boolean })
      .eq('id', user.id)

    if (data.firstProjectName.trim()) {
      const { data: project } = await supabase
        .from('projects')
        .insert({
          owner_id: user.id,
          name: data.firstProjectName,
          sector: data.firstProjectSector ?? null,
          approach,
          status: 'active' as const,
          success_criteria: [],
          tailoring_answers: {},
        })
        .select()
        .single()

      if (project && 'id' in project) {
        window.location.href = `/dashboard/projects/${(project as { id: string }).id}`
        return
      }
    }

    window.location.href = '/dashboard'
  }

  const totalSteps = 4
  const recommended = recommendApproach(data.tailoring)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            <span className="text-blue-600">A</span>bema PM
          </h1>
          <p className="text-gray-400 text-sm mt-1">Configuration de votre espace · Étape {step}/{totalSteps}</p>
          {/* Step dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i + 1 === step ? 'w-5 bg-blue-600' : i + 1 < step ? 'w-1.5 bg-blue-300' : 'w-1.5 bg-gray-200'
                )}
              />
            ))}
          </div>
        </div>

        {/* ── Step 1: Profile ── */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quel est votre contexte ?</h2>
            <div className="space-y-2">
              {PROFILES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => { updateData({ profileType: p.value }); nextStep() }}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-lg border transition-colors',
                    data.profileType === p.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <p className="font-medium text-sm text-gray-800">{p.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: First project ── */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Votre premier projet</h2>
            <p className="text-sm text-gray-400 mb-4">Vous pourrez ajouter tous les détails ensuite.</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="pname" className="text-sm text-gray-700">Nom du projet <span className="text-red-400">*</span></Label>
                <Input
                  id="pname"
                  value={data.firstProjectName}
                  onChange={(e) => updateData({ firstProjectName: e.target.value })}
                  placeholder="Ex: Rénovation cuisine Dubois"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-700">Secteur</Label>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {SECTORS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => updateData({ firstProjectSector: s.value })}
                      className={cn(
                        'text-left px-3 py-2 rounded-md border text-xs transition-colors',
                        data.firstProjectSector === s.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={prevStep}>← Retour</Button>
                <Button
                  className="flex-1"
                  onClick={nextStep}
                  disabled={!data.firstProjectName.trim()}
                >
                  Continuer →
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="w-full text-gray-400" onClick={() => { updateData({ firstProjectName: 'Mon premier projet' }); nextStep() }}>
                Passer cette étape
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: PMBOK tailoring ── */}
        {step === 3 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Tailoring PMBOK 8</h2>
            <p className="text-sm text-gray-400 mb-4">5 questions rapides pour recommander votre approche.</p>
            <div className="space-y-4">
              {TAILORING_QUESTIONS.map((q) => (
                <div key={q.key}>
                  <p className="text-sm font-medium text-gray-700 mb-1.5">{q.question}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {q.options.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateTailoring({ [q.key]: opt.value } as Partial<TailoringAnswers>)}
                        className={cn(
                          'px-3 py-1.5 rounded-md border text-xs font-medium transition-colors',
                          data.tailoring[q.key] === opt.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Recommendation preview */}
            <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-xs text-blue-600 font-medium">
                Approche recommandée :{' '}
                <span className="font-bold capitalize">{APPROACHES.find((a) => a.value === recommended)?.label ?? recommended}</span>
              </p>
              <p className="text-xs text-blue-400 mt-0.5">
                {APPROACHES.find((a) => a.value === recommended)?.desc}
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={prevStep}>← Retour</Button>
              <Button className="flex-1" onClick={() => { updateData({ firstProjectApproach: recommended }); nextStep() }}>
                Utiliser {APPROACHES.find((a) => a.value === recommended)?.label} →
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 4: Confirmation ── */}
        {step === 4 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{'C\'est parti !'}</h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm mb-6">
              <Row label="Profil" value={PROFILES.find((p) => p.value === data.profileType)?.label ?? data.profileType ?? '—'} />
              {data.firstProjectName && <Row label="Projet" value={data.firstProjectName} />}
              {data.firstProjectSector && <Row label="Secteur" value={SECTORS.find((s) => s.value === data.firstProjectSector)?.label ?? data.firstProjectSector} />}
              <Row label="Approche" value={APPROACHES.find((a) => a.value === (data.firstProjectApproach ?? recommended))?.label ?? '—'} />
            </div>
            <Button className="w-full" onClick={handleFinish}>
              {data.firstProjectName.trim() ? 'Créer mon projet et commencer' : 'Accéder au dashboard'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  )
}
