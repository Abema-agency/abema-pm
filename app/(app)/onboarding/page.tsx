'use client'

import { useRouter } from 'next/navigation'
import { useOnboardingStore, recommendApproach } from '@/store/useOnboardingStore'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import type { UserProfileType, ProjectSector } from '@/types/project'

const PROFILES = [
  { value: 'artisan', label: 'Artisan / TPE', description: 'Je gère un petit business avec des projets concrets (chantiers, missions, commandes).' },
  { value: 'pm_advanced', label: 'Chef de projet', description: 'Je manage des projets complexes, j\'utilise ou souhaite utiliser les standards PMBOK.' },
  { value: 'sme_manager', label: 'Dirigeant PME', description: 'Je pilote plusieurs projets stratégiques et ai besoin de visibilité macro.' },
] as const

const SECTORS: { value: ProjectSector; label: string }[] = [
  { value: 'construction', label: 'Construction' },
  { value: 'it_software', label: 'IT & Software' },
  { value: 'marketing_events', label: 'Marketing & Événementiel' },
  { value: 'rd_innovation', label: 'R&D & Innovation' },
  { value: 'transformation', label: 'Transformation' },
  { value: 'product_launch', label: 'Lancement produit' },
  { value: 'regulatory_public', label: 'Réglementaire & Public' },
  { value: 'other', label: 'Autre' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { step, data, nextStep, prevStep, updateData, updateTailoring } = useOnboardingStore()
  const supabase = createClient()

  async function handleFinish() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('profiles')
      .update({
        profile_type: data.profileType ?? 'artisan',
        onboarding_completed: true,
      } as { profile_type: 'artisan' | 'pm_advanced' | 'sme_manager'; onboarding_completed: boolean })
      .eq('id', user.id)

    if (data.firstProjectName) {
      const approach = recommendApproach(data.tailoring)
      const { data: project } = await supabase
        .from('projects')
        .insert({
          owner_id: user.id,
          name: data.firstProjectName,
          sector: data.firstProjectSector || null,
          approach: approach,
          status: 'active' as const,
          success_criteria: [],
          tailoring_answers: data.tailoring,
        })
        .select()
        .single()

      if (project && 'id' in project) {
        router.push(`/projects/${(project as { id: string }).id}/kanban`)
        return
      }
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            <span className="text-blue-600">Abema</span> PM
          </h1>
          <p className="text-slate-500 mt-1">Configuration de votre espace ({step}/4)</p>
        </div>

        {/* Step 1 — Profile */}
        {step === 1 && (
          <Card>
            <CardHeader><CardTitle>Quel est votre profil ?</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {PROFILES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => { updateData({ profileType: p.value as UserProfileType }); nextStep() }}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    data.profileType === p.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-medium text-sm text-slate-800">{p.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Step 2 — Project sector */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Secteur du projet ?</CardTitle>
              <p className="text-sm text-slate-500">Cela aide à adapter les recommandations.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {SECTORS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => { updateData({ firstProjectSector: s.value }); nextStep() }}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                    data.firstProjectSector === s.value ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
              <Button variant="ghost" size="sm" className="w-full" onClick={nextStep}>Passer cette étape</Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3 — Project name */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Créer votre premier projet</CardTitle>
              <p className="text-sm text-slate-500">Vous pourrez ajouter tous les détails ensuite.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Nom du projet</Label>
                <Input
                  id="projectName"
                  value={data.firstProjectName}
                  onChange={(e) => updateData({ firstProjectName: e.target.value })}
                  placeholder="Ex: Rénovation cuisine client Dubois"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={prevStep}><ChevronLeft className="w-4 h-4 mr-1" />Retour</Button>
                <Button className="flex-1" onClick={nextStep} disabled={!data.firstProjectName.trim()}>
                  Suivant <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="w-full text-slate-400" onClick={() => router.push('/dashboard')}>
                Passer et aller au dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 4 — PMBOK tailoring */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Adaptez à votre contexte</CardTitle>
              <p className="text-sm text-slate-500">Cela aide à choisir la meilleure approche (Prédictive/Agile/Hybride).</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Scope defined */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Le périmètre est-il clairement défini ?</Label>
                <div className="space-y-2">
                  {['fixed', 'partial', 'evolving'].map((val) => (
                    <button
                      key={val}
                      onClick={() => updateTailoring({ scopeDefined: val as any })}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                        data.tailoring.scopeDefined === val ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {val === 'fixed' && 'Oui, le périmètre est fixé'}
                      {val === 'partial' && 'Partiellement défini'}
                      {val === 'evolving' && 'Non, il évolue régulièrement'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Avez-vous un budget fixé ?</Label>
                <div className="space-y-2">
                  {['yes', 'no'].map((val) => (
                    <button
                      key={val}
                      onClick={() => updateTailoring({ fixedBudget: val as any })}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                        data.tailoring.fixedBudget === val ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {val === 'yes' ? 'Oui' : 'Non, flexible'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery frequency */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Quelle est la fréquence de livraison ?</Label>
                <div className="space-y-2">
                  {['milestones', 'continuous', 'both'].map((val) => (
                    <button
                      key={val}
                      onClick={() => updateTailoring({ deliveryFrequency: val as any })}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                        data.tailoring.deliveryFrequency === val ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {val === 'milestones' && 'Par jalons'}
                      {val === 'continuous' && 'Continu (itérations)'}
                      {val === 'both' && 'Les deux'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={prevStep}><ChevronLeft className="w-4 h-4 mr-1" />Retour</Button>
                <Button className="flex-1" onClick={handleFinish}>
                  Créer le projet <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
