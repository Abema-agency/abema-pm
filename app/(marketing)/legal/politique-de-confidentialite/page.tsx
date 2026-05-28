export default function PolitiqueConfidentialitePage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-3xl mx-auto prose prose-slate">
        <h1>Politique de confidentialité</h1>
        <p className="text-slate-500 text-sm">Dernière mise à jour : mai 2026</p>

        <h2>Responsable du traitement</h2>
        <p>
          <strong>Abema Agency</strong> — agencyabema@gmail.com<br />
          Hauts-de-France, France
        </p>

        <h2>Données collectées</h2>
        <p>Nous collectons les données suivantes lors de l'utilisation d'Abema PM :</p>
        <ul>
          <li><strong>Données de compte</strong> : email, nom complet (lors de l'inscription)</li>
          <li><strong>Données de projet</strong> : noms, descriptions, risques, parties prenantes que vous saisissez</li>
          <li><strong>Données d'usage</strong> : interactions avec le copilote IA, logs d'utilisation des workflows</li>
          <li><strong>Données techniques</strong> : adresse IP, type de navigateur (via Vercel Analytics)</li>
        </ul>

        <h2>Base légale</h2>
        <p>
          Le traitement repose sur votre <strong>consentement</strong> (lors de l'inscription)
          et sur l'<strong>exécution du contrat</strong> de service que vous acceptez lors de la création de compte.
        </p>

        <h2>Finalités du traitement</h2>
        <ul>
          <li>Fourniture et amélioration du service Abema PM</li>
          <li>Génération des réponses IA via l'API Anthropic</li>
          <li>Envoi d'emails transactionnels (confirmation de compte, rapports de statut)</li>
          <li>Sécurité et prévention de la fraude</li>
        </ul>

        <h2>Sous-traitants</h2>
        <ul>
          <li><strong>Supabase</strong> — stockage base de données (EU Frankfurt)</li>
          <li><strong>Anthropic</strong> — traitement des messages envoyés au copilote IA</li>
          <li><strong>Vercel</strong> — hébergement de l'application</li>
          <li><strong>Brevo</strong> — envoi d'emails transactionnels</li>
        </ul>

        <h2>Durée de conservation</h2>
        <p>
          Vos données sont conservées pendant toute la durée de votre compte actif,
          puis supprimées dans un délai de <strong>30 jours</strong> après la clôture de votre compte.
          Les données de facturation sont conservées 10 ans conformément aux obligations légales françaises.
        </p>

        <h2>Vos droits (RGPD)</h2>
        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul>
          <li>Droit d'accès à vos données</li>
          <li>Droit de rectification</li>
          <li>Droit à l'effacement (« droit à l'oubli »)</li>
          <li>Droit à la portabilité des données</li>
          <li>Droit d'opposition au traitement</li>
        </ul>
        <p>
          Pour exercer ces droits, contactez-nous à : <a href="mailto:agencyabema@gmail.com">agencyabema@gmail.com</a>
        </p>

        <h2>Cookies</h2>
        <p>
          Abema PM utilise uniquement des cookies strictement nécessaires au fonctionnement de l'authentification
          (session Supabase). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
        </p>

        <h2>Contact DPO</h2>
        <p>
          Pour toute question relative à la protection de vos données :
          <a href="mailto:agencyabema@gmail.com"> agencyabema@gmail.com</a>
        </p>
      </div>
    </div>
  )
}
