# Journal
> Trace des sessions de travail.

## Format
**[DATE] - Session**
- **Objectif** : Ce qui était prévu
- **Réalisé** : Ce qui a été fait
- **Décisions prises** : Renvoi vers decisions.md si besoin
- **Prochaine session** : Ce qui est prévu

---

## 2026-05-08 — Session 2

- **Objectif** : Compléter les fichiers manquants, préparer le projet pour la connexion Supabase
- **Réalisé** :
  - Ajout `app/(app)/projects/[id]/page.tsx` (redirect → /kanban)
  - Ajout `app/api/webhooks/n8n/route.ts` (endpoint sécurisé par `x-n8n-secret`)
  - Création `.env.local` avec placeholders
  - Build : 20 routes, 0 erreurs TypeScript
  - `resume_session.md` créé
- **Décisions prises** : Aucune nouvelle
- **Prochaine session** : Connecter Supabase (Step 2) — nécessite les credentials de l'utilisateur

---
