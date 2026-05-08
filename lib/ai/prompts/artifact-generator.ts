export type ArtifactType =
  | 'project_charter'
  | 'wbs'
  | 'stakeholder_register'
  | 'risk_register'
  | 'communications_plan'
  | 'status_report'
  | 'change_request'
  | 'lessons_learned'

export function buildArtifactPrompt(
  type: ArtifactType,
  projectData: Record<string, unknown>
): string {
  const base = `Tu es un expert PMBOK 8. Génère un artefact structuré au format JSON strict.
Projet : ${JSON.stringify(projectData, null, 2)}
Chaque champ inconnu → valeur "[À COMPLÉTER : <description>]".
Réponds UNIQUEMENT avec le JSON, sans markdown ni explication.`

  const templates: Record<ArtifactType, string> = {
    project_charter: `${base}
Structure JSON attendue :
{
  "title": "Charte Projet — <nom>",
  "project_purpose": "...",
  "business_justification": "...",
  "objectives": [{"description": "...", "success_metric": "..."}],
  "scope": {"in_scope": ["..."], "out_of_scope": ["..."]},
  "deliverables": ["..."],
  "milestones": [{"name": "...", "target_date": "..."}],
  "budget_estimate": "...",
  "risks_summary": ["..."],
  "stakeholders": [{"name": "...", "role": "..."}],
  "assumptions": ["..."],
  "constraints": ["..."],
  "sponsor": "...",
  "pm": "...",
  "approval_date": "[À COMPLÉTER : date de signature]"
}`,
    risk_register: `${base}
Structure JSON attendue :
{
  "title": "Registre des Risques — <nom>",
  "risks": [
    {
      "code": "R-001",
      "title": "...",
      "description": "...",
      "category": "technical|organizational|external|project_management|commercial",
      "is_opportunity": false,
      "probability": 1,
      "impact": 1,
      "score": 1,
      "strategy": "avoid|transfer|mitigate|accept",
      "response_actions": "...",
      "trigger": "...",
      "owner": "..."
    }
  ]
}`,
    wbs: `${base}
Structure JSON attendue :
{
  "title": "WBS — <nom>",
  "elements": [
    {
      "code": "1",
      "name": "...",
      "level": 1,
      "children": [
        {"code": "1.1", "name": "...", "level": 2, "children": []}
      ]
    }
  ]
}`,
    stakeholder_register: `${base}
Structure JSON attendue :
{
  "title": "Registre Parties Prenantes — <nom>",
  "stakeholders": [
    {
      "name": "...",
      "role": "...",
      "organization": "...",
      "power": 1,
      "interest": 1,
      "attitude": "champion|supportive|neutral|resistant|blocker",
      "current_engagement": "unaware|resistant|neutral|supportive|leading",
      "desired_engagement": "unaware|resistant|neutral|supportive|leading",
      "strategy": "..."
    }
  ]
}`,
    status_report: `${base}
Structure JSON attendue :
{
  "title": "Status Report — Semaine <num>",
  "period": {"start": "...", "end": "..."},
  "rag_status": "green|amber|red",
  "headline": "...",
  "schedule_variance_days": 0,
  "cost_variance_amount": 0,
  "scope_stable": true,
  "achievements": ["..."],
  "next_period_plan": ["..."],
  "risks_active": ["..."],
  "decisions_needed": ["..."]
}`,
    communications_plan: `${base}
Structure JSON attendue :
{
  "title": "Plan de Communication — <nom>",
  "communications": [
    {
      "type": "...",
      "purpose": "...",
      "audience": "...",
      "frequency": "...",
      "format": "...",
      "owner": "..."
    }
  ]
}`,
    change_request: `${base}
Structure JSON attendue :
{
  "title": "Demande de Changement #<num>",
  "description": "...",
  "justification": "...",
  "impact_scope": "...",
  "impact_schedule_days": 0,
  "impact_cost": 0,
  "recommended_action": "approve|reject|defer",
  "decision": "[À COMPLÉTER]",
  "decision_date": "[À COMPLÉTER]"
}`,
    lessons_learned: `${base}
Structure JSON attendue :
{
  "title": "Leçons Apprises — <nom>",
  "lessons": [
    {
      "category": "planning|execution|team|risk|stakeholder|technical",
      "situation": "...",
      "impact": "...",
      "recommendation": "...",
      "applicability": "..."
    }
  ]
}`,
  }

  return templates[type]
}
