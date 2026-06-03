import type { Metadata } from 'next'
import { Big_Shoulders, Mulish } from 'next/font/google'
import './globals.css'

const bigShoulders = Big_Shoulders({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-big-shoulders',
  display: 'swap',
})

const mulish = Mulish({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-mulish',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Abema PM — Gestion de projet PMBOK 8',
    template: '%s | Abema PM',
  },
  description: 'Outil de gestion de projet bâti sur le référentiel PMBOK 8, avec un copilote IA natif pour les artisans, chefs de projet et dirigeants.',
  openGraph: {
    title: 'Abema PM — Gestion de projet PMBOK 8 avec IA',
    description: 'Contrairement à Asana ou Monday, Abema PM est bâti sur le référentiel PMBOK 8. Tailoring engine, copilote IA, matrice risques, registre parties prenantes.',
    url: 'https://pm.abemaagency.com',
    siteName: 'Abema PM',
    type: 'website',
    images: [
      {
        url: 'https://pm.abemaagency.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Abema PM — Gestion de projet PMBOK 8 avec IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Abema PM — Gestion de projet PMBOK 8 avec IA',
    description: 'Contrairement à Asana ou Monday, Abema PM est bâti sur le référentiel PMBOK 8.',
    images: ['https://pm.abemaagency.com/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${bigShoulders.variable} ${mulish.variable} h-full antialiased`}>
      <body className="h-full font-sans">{children}</body>
    </html>
  )
}
