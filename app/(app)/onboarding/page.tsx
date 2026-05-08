'use client'

import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/store/useOnboardingStore'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import type { UserProfileType } from '@/types/project'

const PROFILES = [
  { value: 'artisan', label: 'Artisan / TPE', description: 'Je gère un petit business avec des projets concrets (chantiers, missions, commandes).' },
  { value: 'pm_advanced', label: 'Chef de projet', description: 'Je manage des projets complexes, j\'utilise ou souhaite utiliser les standards PMBOK.' },
  { value: 'sme_manager', label: 'Dirigeant PME', description: 'Je pilote plusieurs projets stratégiques et ai besoin de visibilité macro.' },
] as const

const BLOCKERS = [
  'Je perds du temps à chercher les infos',
  'Je ne sais pas où en sont mes projets',
  'Les risques me surprennent souvent',
  "Je n'ai pas de méthode structurée",
  'Mon équipe n\'est pas alignée',
]

export default function OnboardingPage() {
  const router = useRouter()
  const { step, data, nextStep, prevStep, updateData } = useOnboardingStore()
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
      const { data: project } = await supabase
        .from('projects')
        .insert({
          owner_id: user.id,
          name: data.firstProjectName,
          description: data.firstProjectDescription || null,
          approach: 'hybrid' as const,
          status: 'active' as const,
          success_criteria: [],
          tailoring_answers: {},
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
          <p className="text-slate-500 mt-1">Configuration de votre espace ({step}/5)</p>
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

        {/* Step 2 — Main blocker */}
        {step === 2 && (
          <Card>
            <CardHeader><CardTitle>Votre plus gros frein actuel ?</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {BLOCKERS.map((b) => (
                <button
                  key={b}
                  onClick={() => { updateData({ mainBlocker: b }); nextStep() }}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                    data.mainBlocker === b ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {b}
                </button>
              ))}
              <Button variant="ghost" size="sm" className="w-full" onClick={nextStep}>Passer cette étape</Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3 — Project count */}
        {step === 3 && (
          <Card>
            <CardHeader><CardTitle>Combien de projets gérez-vous en parallèle ?</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[['1', 1], ['2-3', 2], ['4-10', 5], ['10+', 15]].map(([label, val]) => (
                <button
                  key={label}
                  onClick={() => { updateData({ projectCount: Number(val) }); nextStep() }}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                    data.projectCount === Number(val) ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {label} projet{Number(val) > 1 ? 's' : ''}
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Step 4 — First project name */}
        {step === 4 && (
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
              <div className="space-y-2">
                <Label htmlFor="projectDesc">Description courte (optionnel)</Label>
                <Textarea
                  id="projectDesc"
                  value={data.firstProjectDescription}
                  onChange={(e) => updateData({ firstProjectDescription: e.target.value })}
                  rows={2}
                  placeholder="Contexte rapide..."
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

        {/* Step 5 — Summary */}
        {step === 5 && (
          <Card>
            <CardHeader><CardTitle>Tout est prêt !</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Profil</span>
                  <span className="font-medium">{PROFILES.find((p) => p.value === data.profileType)?.label ?? data.profileType}</span>
                </div>
                {data.firstProjectName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Premier projet</span>
                    <span className="font-medium">{data.firstProjectName}</span>
                  </div>
                )}
              </div>
              <Button className="w-full" onClick={handleFinish}>
                {data.firstProjectName ? 'Créer mon projet et commencer' : 'Accéder au dashboard'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
