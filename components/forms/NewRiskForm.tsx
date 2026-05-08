'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateRisk } from '@/hooks/useRisks'
import { RISK_CATEGORIES, RISK_STRATEGIES_THREAT } from '@/lib/pmbok/constants'

const schema = z.object({
  title: z.string().min(2, 'Minimum 2 caractères'),
  description: z.string().optional(),
  category: z.enum(['technical', 'organizational', 'external', 'project_management', 'commercial'] as const),
  probability: z.number().min(1).max(5),
  impact: z.number().min(1).max(5),
  strategy: z.string().optional(),
  response_actions: z.string().optional(),
  trigger_condition: z.string().optional(),
})

type FormData = z.infer<typeof schema>

type Props = { projectId: string; onSuccess: () => void }

export function RiskForm({ projectId, onSuccess }: Props) {
  const createRisk = useCreateRisk()
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { probability: 3, impact: 3, category: 'external' },
  })

  async function onSubmit(data: any) {
    await createRisk.mutateAsync({
      project_id: projectId,
      title: data.title,
      description: data.description ?? null,
      category: data.category,
      is_opportunity: false,
      probability: data.probability,
      impact: data.impact,
      strategy: data.strategy ?? null,
      response_actions: data.response_actions ?? null,
      trigger_condition: data.trigger_condition ?? null,
      status: 'open',
      code: null,
      owner_id: null,
      last_review_date: null,
    })
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Titre du risque *</Label>
        <Input id="title" {...register('title')} placeholder="Ex: Dépassement budget matériaux" />
        {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} rows={2} placeholder="Description détaillée..." />
      </div>

      <div className="space-y-2">
        <Label>Catégorie</Label>
        <Select defaultValue="external" onValueChange={(v) => setValue('category', v as FormData['category'])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RISK_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="probability">Probabilité (1-5)</Label>
          <Input
          id="probability"
          type="number"
          min={1}
          max={5}
          onChange={(e) => setValue('probability', parseInt(e.target.value, 10))}
          defaultValue={3}
        />
        </div>
        <div className="space-y-2">
          <Label htmlFor="impact">Impact (1-5)</Label>
          <Input
            id="impact"
            type="number"
            min={1}
            max={5}
            onChange={(e) => setValue('impact', parseInt(e.target.value, 10))}
            defaultValue={3}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Stratégie de réponse</Label>
        <Select onValueChange={(v) => setValue('strategy', v as string)}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner..." />
          </SelectTrigger>
          <SelectContent>
            {RISK_STRATEGIES_THREAT.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="response_actions">Actions de réponse</Label>
        <Textarea id="response_actions" {...register('response_actions')} rows={2} placeholder="Actions concrètes à mettre en œuvre..." />
      </div>

      <Button type="submit" className="w-full" disabled={createRisk.isPending}>
        {createRisk.isPending ? 'Création...' : 'Créer le risque'}
      </Button>
    </form>
  )
}
