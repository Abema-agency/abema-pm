# PROMPT N8N — Workflows Abema PM
# À coller dans Claude Code depuis C:\Users\jamilaaa\Desktop\Claude code\abema-pm
# Ou directement dans n8n en mode "Ask AI"

---

Tu vas créer 4 workflows n8n pour Abema PM.
Mon instance n8n est self-hosted sur mon VPS Hostinger.
Les workflows utilisent : Supabase, Anthropic API, Email (SMTP ou Gmail).

---

## WORKFLOW 1 — Status Report Hebdomadaire Automatique

**Déclencheur** : Cron — chaque lundi à 8h00

**Étapes** :

1. **Cron Trigger** : lundi 08:00

2. **Supabase — Récupère tous les projets actifs** :
   - Table : `projects`
   - Filtre : `status = 'active'`
   - Retourne : id, name, owner_id, target_end_date, budget, sector, approach

3. **Loop over projets** : pour chaque projet...

4. **Supabase — Récupère les données du projet** (4 calls en parallèle) :
   - Work packages : count par statut (not_started/in_progress/blocked/completed)
   - Risques actifs : count + top 3 par score (P×I)
   - Issues ouvertes : count par sévérité
   - Dernière activité : date du dernier WP modifié

5. **Supabase — Récupère le profil du owner** :
   - Table : `profiles`
   - Filtre : id = owner_id du projet
   - Retourne : full_name, email

6. **Function Node — Calcule les métriques** :
```javascript
const wps = $input.item.json.workPackages;
const total = wps.length;
const completed = wps.filter(w => w.status === 'completed').length;
const blocked = wps.filter(w => w.status === 'blocked').length;
const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

// Calcul RAG automatique
let rag = 'green';
if (blocked > 2 || progress < 30) rag = 'red';
else if (blocked > 0 || progress < 60) rag = 'amber';

// Variance schedule
const today = new Date();
const target = new Date($input.item.json.project.target_end_date);
const daysLeft = Math.ceil((target - today) / (1000 * 60 * 60 * 24));

return {
  progress,
  rag,
  daysLeft,
  blocked,
  completed,
  total
};
```

7. **Anthropic API — Génère le status report** :
   - Model : claude-sonnet-4-6
   - Max tokens : 800
   - Prompt :
```
Tu es un expert en gestion de projet PMBOK 8.
Génère un status report hebdomadaire concis pour ce projet.

Projet : {{$json.project.name}}
Secteur : {{$json.project.sector}}
Approche : {{$json.project.approach}}
Progression : {{$json.metrics.progress}}%
Statut RAG : {{$json.metrics.rag}}
Tâches bloquées : {{$json.metrics.blocked}}
Jours restants : {{$json.metrics.daysLeft}}
Top risques : {{$json.risks}}

Format de sortie (respecte exactement ce format HTML) :
<h2>Status Report — {{projet}} — Semaine du {{date}}</h2>
<p><strong>Statut :</strong> 🟢/🟡/🔴 [GREEN/AMBER/RED]</p>
<p><strong>Progression :</strong> X% des livrables complétés</p>
<h3>Cette semaine</h3>
<ul>[2-3 accomplissements]</ul>
<h3>Points d'attention</h3>
<ul>[risques actifs + tâches bloquées]</ul>
<h3>Semaine prochaine</h3>
<ul>[2-3 actions prioritaires]</ul>
<p><em>Rapport généré automatiquement par Abema PM · PMBOK 8</em></p>
```

8. **Supabase — Sauvegarde le status report** :
   - Table : `status_reports`
   - Insert : project_id, period_start, period_end, rag_status, content, generated_by_ai=true

9. **Gmail/SMTP — Envoie l'email** :
   - To : email du owner
   - Subject : `[Abema PM] Status Report — {{project.name}} — Semaine du {{date}}`
   - Body : le HTML généré par Claude
   - Footer : "Géré sur pm.abemaagency.com"

---

## WORKFLOW 2 — Lead Gen Agence (Power Users → Clients Agence)

**Déclencheur** : Webhook Supabase (Database Webhook sur table `projects`)
Ou : Cron quotidien à 9h00 (plus simple)

**Objectif** : Détecter les utilisateurs lite gratuits engagés et les convertir en clients Abema Agency.

**Étapes** :

1. **Cron Trigger** : chaque jour à 9h00

2. **Supabase — Identifie les power users** :
```sql
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.profile_type,
  p.created_at,
  COUNT(DISTINCT pr.id) as project_count,
  COUNT(DISTINCT wp.id) as task_count,
  MAX(pr.updated_at) as last_activity
FROM profiles p
LEFT JOIN projects pr ON pr.owner_id = p.id
LEFT JOIN work_packages wp ON wp.project_id = pr.id
WHERE p.created_at > NOW() - INTERVAL '30 days'
GROUP BY p.id, p.email, p.full_name, p.profile_type, p.created_at
HAVING COUNT(DISTINCT pr.id) >= 2
ORDER BY last_activity DESC
```

3. **Filter Node — Filtre les leads qualifiés** :
   - project_count >= 2 ET last_activity dans les 7 derniers jours
   - Exclut les utilisateurs déjà contactés (tag dans metadata)

4. **IF Node — Segmente par profil** :
   - Artisan/TPE → séquence email "Abema Agency - Agent IA"
   - PM avancé → séquence email "Upgrade Pro"
   - Dirigeant PME → séquence email "Audit Gratuit"

5. **Branche Artisan/TPE** :
   - Email J0 : "Vous utilisez Abema PM activement — avez-vous pensé à automatiser vos relances clients ?"
   - CTA : "Réserver mon audit gratuit Abema Agency"

6. **Branche PM avancé** :
   - Email J0 : "Vous gérez {{N}} projets sur Abema PM — découvrez le plan Pro (EVM avancé, Monte Carlo, exports clients)"
   - CTA : "Voir les fonctionnalités Pro"

7. **Branche Dirigeant PME** :
   - Email J0 : "{{Prénom}}, vos projets méritent un suivi stratégique — audit gratuit de 30 min offert"
   - CTA : "Réserver mon audit"

8. **Supabase — Tag l'utilisateur** :
   - Met à jour `profiles.metadata` avec `lead_contacted: true, contacted_at: now()`

9. **Notification Slack/Email toi** :
   - "Nouveau lead qualifié : {{nom}} — {{N}} projets — profil {{type}}"

---

## WORKFLOW 3 — Notifications Risques (Alertes Proactives)

**Déclencheur** : Cron — chaque mardi et vendredi à 9h00

**Étapes** :

1. **Supabase — Risques sans review depuis 7 jours** :
```sql
SELECT r.*, p.name as project_name, pr.email, pr.full_name
FROM risks r
JOIN projects p ON p.id = r.project_id
JOIN profiles pr ON pr.id = r.owner_id
WHERE r.status = 'open'
AND r.last_review_date < NOW() - INTERVAL '7 days'
AND r.score >= 9
ORDER BY r.score DESC
```

2. **Group by owner** : regroupe les risques par owner pour envoyer 1 seul email par personne

3. **Email — Alerte risques** :
   - Subject : `⚠️ [Abema PM] {{N}} risque(s) à revoir sur {{projet}}`
   - Body : liste des risques avec score, stratégie, lien direct
   - CTA : "Revoir mes risques →"

4. **Supabase — Tâches bloquées depuis 5 jours** :
```sql
SELECT wp.*, p.name as project_name, pr.email
FROM work_packages wp
JOIN projects p ON p.id = wp.project_id  
JOIN profiles pr ON pr.id = wp.owner_id
WHERE wp.status = 'blocked'
AND wp.updated_at < NOW() - INTERVAL '5 days'
```

5. **Email — Alerte tâches bloquées** (combiné avec l'email risques si même owner)

---

## WORKFLOW 4 — Onboarding Email Séquence

**Déclencheur** : Webhook — quand `profiles.onboarding_completed` passe à `true`
(Configure un Database Webhook Supabase sur UPDATE de la table profiles)

**Étapes** :

1. **Webhook Trigger** : POST depuis Supabase webhook

2. **Wait — J+0** (immédiat) :
   - Email de bienvenue personnalisé selon `profile_type`

3. **Email J+0 — Artisan** :
   - Subject : "Bienvenue sur Abema PM — votre chantier est prêt 🔨"
   - Body : "Votre projet est créé. Prochaine étape : ajoutez vos 3 premiers risques (météo, livraison matériaux, modification client). Ça prend 2 minutes."
   - CTA : "Ajouter mes risques →"

4. **Email J+0 — PM avancé** :
   - Subject : "Abema PM activé — PMBOK 8 à portée de main"
   - Body : "Votre workspace est prêt. Commencez par le questionnaire de tailoring pour configurer votre approche (prédictif/agile/hybride)."
   - CTA : "Lancer le tailoring →"

5. **Email J+0 — Dirigeant PME** :
   - Subject : "Abema PM — votre copilote IA est prêt"
   - Body : "En 5 minutes, votre copilote IA peut générer la charte complète de votre projet. Essayez maintenant."
   - CTA : "Générer ma charte →"

6. **Wait node — 3 jours**

7. **Email J+3** :
   - Supabase check : a-t-il créé des risques ? des WP ?
   - Si non : "Besoin d'aide pour démarrer ? Voici les 3 premières choses à faire."
   - Si oui : "Bien joué ! Prochaine étape : invitez un collaborateur."

8. **Wait node — 7 jours**

9. **Email J+7** :
   - Tips PMBOK 8 selon le secteur de l'utilisateur
   - Artisan : "Les 5 risques classiques d'un chantier de rénovation"
   - IT : "Comment le tailoring agile change la gestion de votre projet digital"
   - PME : "Qu'est-ce que l'EVM et pourquoi ça vous sauvera la mise"

---

## CONFIGURATION REQUISE DANS N8N

### Credentials à configurer :
1. **Supabase** : Project URL + Service Role Key (pas la anon key — la service role pour les webhooks)
2. **Anthropic** : API Key
3. **Gmail ou SMTP** : pour les envois d'emails
4. **Slack** (optionnel) : pour les notifications personnelles

### Variables d'environnement n8n :
```
SUPABASE_URL=https://pvqwmuirzwszspfkmyhm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[ta clé service role]
ANTHROPIC_API_KEY=[ta clé Anthropic]
APP_URL=https://pm.abemaagency.com
AGENCY_EMAIL=agencyabema@gmail.com
```

### Webhooks Supabase à configurer :
Dans Supabase → Database → Webhooks → Create Webhook :
1. Table `profiles`, Event `UPDATE`, URL : `https://ton-n8n.com/webhook/onboarding-complete`
2. Table `projects`, Event `INSERT`, URL : `https://ton-n8n.com/webhook/new-project`

---

## WORKFLOW 5 — Rapport Exécutif Vendredi (Plan Team uniquement)

**Déclencheur** : Cron — chaque vendredi à 17h00

**Objectif** : Envoyer un rapport exécutif synthétique cross-projets aux organisations abonnées au plan Team.

**Étapes** :

1. **Cron Trigger** : vendredi 17:00

2. **Supabase — Récupère les orgs Team** :
```sql
SELECT o.id as org_id, o.name as org_name, o.plan,
       p.id as admin_id, p.email as admin_email, p.full_name as admin_name
FROM organizations o
JOIN profiles p ON p.org_id = o.id
WHERE o.plan = 'team'
ORDER BY o.id, p.created_at ASC
```
   - Garder le 1er profil par org (admin = premier inscrit)

3. **Loop over organisations** : pour chaque org...

4. **Supabase — Récupère tous les projets actifs de l'org** :
```sql
SELECT pr.id, pr.name, pr.sector, pr.approach,
       pr.target_end_date, pr.budget, pr.status,
       pr.owner_id
FROM projects pr
JOIN profiles p ON p.id = pr.owner_id
WHERE p.org_id = '{{org_id}}'
AND pr.status = 'active'
```

5. **Loop over projets (sous-loop)** : pour chaque projet, récupère les métriques en parallèle :
   - Work packages : `SELECT status, COUNT(*) FROM work_packages WHERE project_id = '{{id}}' GROUP BY status`
   - Risques critiques : `SELECT COUNT(*) FROM risks WHERE project_id = '{{id}}' AND status = 'open' AND probability * impact >= 9`
   - Issues bloquantes : `SELECT COUNT(*) FROM issues WHERE project_id = '{{id}}' AND status = 'open' AND severity = 'critical'`

6. **Function Node — Calcule le résumé exécutif** :
```javascript
const projects = $input.all();
const summary = projects.map(p => {
  const wps = p.json.workPackages || [];
  const total = wps.reduce((s, w) => s + (w.count || 0), 0);
  const completed = wps.find(w => w.status === 'completed')?.count || 0;
  const blocked = wps.find(w => w.status === 'blocked')?.count || 0;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  let rag = 'green';
  if (blocked > 2 || progress < 30 || p.json.criticalRisks > 2) rag = 'red';
  else if (blocked > 0 || progress < 60 || p.json.criticalRisks > 0) rag = 'amber';

  const today = new Date();
  const target = p.json.project.target_end_date ? new Date(p.json.project.target_end_date) : null;
  const daysLeft = target ? Math.ceil((target - today) / (1000 * 60 * 60 * 24)) : null;

  return {
    name: p.json.project.name,
    sector: p.json.project.sector,
    progress,
    rag,
    blocked,
    criticalRisks: p.json.criticalRisks || 0,
    daysLeft,
    budget: p.json.project.budget,
  };
});

const globalRag = summary.some(p => p.rag === 'red') ? 'red'
  : summary.some(p => p.rag === 'amber') ? 'amber' : 'green';

return { summary, globalRag, projectCount: summary.length };
```

7. **Anthropic API — Génère le rapport exécutif** :
   - Model : claude-sonnet-4-6
   - Max tokens : 1200
   - Prompt :
```
Tu es un directeur de programme senior.
Génère un rapport exécutif d'une page pour la direction.
Ton : professionnel, synthétique, orienté décision.

Organisation : {{$json.org_name}}
Date : vendredi {{date}}
Nombre de projets actifs : {{$json.projectCount}}
Statut global : {{$json.globalRag}}

Projets :
{{$json.summary | json}}

Format de sortie HTML (respecte exactement) :
<h2>Rapport Exécutif — {{org_name}} — {{date}}</h2>
<p><strong>Statut global du portefeuille :</strong> 🟢/🟡/🔴 [GREEN/AMBER/RED]</p>
<p><strong>{{N}} projets actifs</strong> — Répartition : X vert, Y amber, Z rouge</p>

<h3>Résumé par projet</h3>
<table border="1" cellpadding="6" style="border-collapse:collapse;width:100%">
  <tr><th>Projet</th><th>Avancement</th><th>Statut</th><th>Risques critiques</th><th>Jours restants</th></tr>
  [une ligne par projet]
</table>

<h3>Points d'attention (décision requise)</h3>
<ul>[2-3 sujets critiques qui nécessitent l'attention de la direction cette semaine]</ul>

<h3>Actions recommandées</h3>
<ul>[2-3 actions concrètes avec responsable suggéré]</ul>

<p><em>Rapport exécutif généré automatiquement par Abema PM · Plan Team · PMBOK 8</em></p>
```

8. **HTTP Request — Sauvegarde dans Abema PM** :
   - Method : POST
   - URL : `https://pm.abemaagency.com/api/webhooks/executive-report`
   - Header : `x-n8n-secret: {{N8N_WEBHOOK_SECRET}}`
   - Body :
```json
{
  "projectId": "{{premier projet de l'org}}",
  "orgId": "{{org_id}}",
  "periodStart": "{{lundi de la semaine}}",
  "periodEnd": "{{vendredi aujourd'hui}}",
  "ragStatus": "{{globalRag}}",
  "headline": "{{org_name}} — {{projectCount}} projets — {{globalRag}}",
  "content": { "html": "{{rapport_html}}", "summary": "{{summary}}" },
  "sentTo": ["{{admin_email}}"]
}
```

9. **Gmail/SMTP — Envoie le rapport exécutif** :
   - To : `{{admin_email}}`
   - Subject : `[Abema PM] Rapport Exécutif — {{org_name}} — Vendredi {{date}}`
   - Body : le HTML généré par Claude
   - Footer : "Voir le détail sur pm.abemaagency.com | Plan Team"

---

## ORDRE D'IMPLÉMENTATION RECOMMANDÉ

1. **Workflow 4** (Onboarding emails) — impact immédiat sur l'activation
2. **Workflow 1** (Status reports) — valeur différenciante visible
3. **Workflow 5** (Rapport exécutif Team) — feature premium, rétention Team
4. **Workflow 2** (Lead gen) — ROI direct pour l'agence
5. **Workflow 3** (Alertes risques) — rétention long terme

---

## NOTE IMPORTANTE

Le endpoint webhook n8n est déjà prévu dans le code Next.js :
`app/api/webhooks/n8n/route.ts` — sécurisé par header `x-n8n-secret`

Pour les appels depuis n8n vers Abema PM, ajoute le header :
```
x-n8n-secret: [valeur de N8N_WEBHOOK_SECRET dans .env.local]
```
