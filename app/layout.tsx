import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Abema PM — Gestion de projet PMBOK 8',
    template: '%s | Abema PM',
  },
  description: 'Outil de gestion de projet bâti sur le référentiel PMBOK 8, avec un copilote IA natif pour les artisans, chefs de projet et dirigeants.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@400;600;700;800;900&family=Mulish:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full font-sans">{children}</body>
    </html>
  )
}
