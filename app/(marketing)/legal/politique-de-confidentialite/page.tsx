export default function PolitiqueConfidentialitePage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-3xl mx-auto prose prose-slate">
        <h1>Politique de confidentialité</h1>
        <p className="text-slate-500 text-sm">
          Conforme au RGPD (Règlement UE 2016/679) et à la Loi Informatique &amp; Libertés.
          Dernière mise à jour : juin 2026.
        </p>

        <h2>1. Responsable du traitement</h2>
        <ul>
          <li><strong>ABEMA AGENCY</strong> — SIREN 925 242 976</li>
          <li>Représentée par Abdallah Ait Essaghir</li>
          <li>25 Rue de Rouvroy, 62680 Méricourt, France</li>
          <li>Email : <a href="mailto:contact@abemaagency.com">contact@abemaagency.com</a></li>
        </ul>
        <p>
          Compte tenu de la taille de la structure, ABEMA AGENCY n&apos;a pas désigné de DPO.
          Toute demande relative à vos données peut être adressée directement à l&apos;email ci-dessus.
        </p>

        <h2>2. Données collectées et bases légales</h2>
        <table>
          <thead>
            <tr>
              <th>Donnée</th>
              <th>Source</th>
              <th>Base légale</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Email, nom complet</td>
              <td>Inscription</td>
              <td>Consentement (art. 6.1.a)</td>
            </tr>
            <tr>
              <td>Données de projet (noms, risques, parties prenantes)</td>
              <td>Saisie utilisateur</td>
              <td>Exécution du contrat (art. 6.1.b)</td>
            </tr>
            <tr>
              <td>Interactions copilote IA</td>
              <td>Usage de la fonctionnalité</td>
              <td>Exécution du contrat</td>
            </tr>
            <tr>
              <td>Logs techniques (IP tronquée, navigateur)</td>
              <td>Hébergeur</td>
              <td>Intérêt légitime — sécurité</td>
            </tr>
            <tr>
              <td>Données de facturation</td>
              <td>Plan payant</td>
              <td>Obligation légale (art. 6.1.c)</td>
            </tr>
          </tbody>
        </table>
        <p>Aucune donnée sensible n&apos;est collectée.</p>

        <h2>3. Finalités du traitement</h2>
        <ul>
          <li>Fourniture et amélioration du service Abema PM</li>
          <li>Génération des réponses IA via l&apos;API Anthropic (Claude)</li>
          <li>Envoi d&apos;emails transactionnels (confirmation, rapports de statut, onboarding)</li>
          <li>Sécurité et prévention de la fraude</li>
          <li>Respect des obligations comptables et légales</li>
        </ul>
        <p>Vos données ne sont jamais vendues, louées ni cédées à des tiers commerciaux.</p>

        <h2>4. Sous-traitants</h2>
        <table>
          <thead>
            <tr>
              <th>Sous-traitant</th>
              <th>Rôle</th>
              <th>Localisation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Supabase</td>
              <td>Base de données et authentification</td>
              <td>EU — Francfort, Allemagne</td>
            </tr>
            <tr>
              <td>Vercel Inc.</td>
              <td>Hébergement de l&apos;application</td>
              <td>UE / USA — clauses contractuelles types</td>
            </tr>
            <tr>
              <td>Anthropic</td>
              <td>Modèle de langage (copilote IA)</td>
              <td>USA — clauses contractuelles types</td>
            </tr>
            <tr>
              <td>Gmail / Brevo</td>
              <td>Envoi d&apos;emails transactionnels</td>
              <td>UE / USA</td>
            </tr>
          </tbody>
        </table>
        <p>
          Pour les transferts hors UE, nous nous appuyons sur les clauses contractuelles types
          validées par la Commission européenne.
        </p>

        <h2>5. Durées de conservation</h2>
        <ul>
          <li><strong>Compte actif :</strong> données conservées pendant toute la durée de l&apos;abonnement</li>
          <li><strong>Suppression du compte :</strong> données effacées dans un délai de 30 jours</li>
          <li><strong>Documents comptables :</strong> 10 ans (obligation légale française)</li>
          <li><strong>Logs techniques :</strong> 12 mois maximum</li>
        </ul>

        <h2>6. Vos droits (RGPD)</h2>
        <p>Vous disposez à tout moment des droits suivants :</p>
        <ul>
          <li><strong>Accès :</strong> obtenir une copie de vos données</li>
          <li><strong>Rectification :</strong> corriger des données inexactes</li>
          <li><strong>Effacement :</strong> demander la suppression (« droit à l&apos;oubli »)</li>
          <li><strong>Limitation :</strong> restreindre le traitement</li>
          <li><strong>Portabilité :</strong> recevoir vos données dans un format structuré</li>
          <li><strong>Opposition :</strong> vous opposer à un traitement fondé sur l&apos;intérêt légitime</li>
          <li><strong>Retrait du consentement</strong> à tout moment, sans effet rétroactif</li>
        </ul>
        <p>
          Pour exercer ces droits : <a href="mailto:contact@abemaagency.com">contact@abemaagency.com</a> (objet : « RGPD »).
          Délai de réponse : 30 jours maximum.{' '}
          En cas de réclamation non résolue :{' '}
          <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer">cnil.fr/fr/plaintes</a>
        </p>

        <h2>7. Cookies</h2>
        <p>
          Abema PM utilise uniquement des cookies strictement nécessaires au fonctionnement
          de l&apos;authentification (session Supabase). Aucun cookie publicitaire ni cookie de
          tracking tiers n&apos;est utilisé.
        </p>

        <h2>8. Sécurité</h2>
        <ul>
          <li>Connexion HTTPS sur l&apos;ensemble du site</li>
          <li>Row Level Security (RLS) Supabase — données cloisonnées par organisation</li>
          <li>Accès restreint par authentification forte</li>
          <li>Hébergement des données en Union européenne (Francfort)</li>
        </ul>
        <p>
          En cas de violation de données, ABEMA AGENCY s&apos;engage à notifier la CNIL dans les
          72h conformément à l&apos;article 33 du RGPD.
        </p>
      </div>
    </div>
  )
}
