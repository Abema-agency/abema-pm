'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#F59E0B" />
      <path d="M16 7 L8 25 M16 7 L24 25 M11.5 19 L20.5 19" stroke="#0A0A0F" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const NAV_LINKS = [
  { href: '/#fonctionnalites', label: 'Fonctionnalités' },
  { href: '/#personas', label: 'Pour qui ?' },
  { href: '/pricing', label: 'Tarifs' },
]

const NAV_LINK_CLASS =
  'hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary rounded-sm'

export function MarketingHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <header
      ref={menuRef}
      className="sticky top-0 z-50 border-b"
      style={{ background: 'rgba(10,10,15,0.96)', backdropFilter: 'blur(16px)', borderColor: 'rgba(240,235,224,0.08)' }}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className={NAV_LINK_CLASS + ' flex items-center gap-2.5'}>
          <LogoMark />
          <span style={{ fontFamily: "'Big Shoulders Display', 'Arial Narrow', Impact, sans-serif", fontWeight: 900, fontSize: '1.2rem', letterSpacing: '0.05em', color: '#F0EBE0' }}>
            ABEMA <span style={{ color: '#F59E0B' }}>PM</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm" aria-label="Navigation principale">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={NAV_LINK_CLASS} style={{ color: '#C4BAA6' }}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex text-brand-sand hover:text-brand-cream">
            <Link href="/login">Connexion</Link>
          </Button>
          <Button size="sm" asChild className="hidden md:inline-flex">
            <Link href="/signup">Essai gratuit</Link>
          </Button>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label="Ouvrir le menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsOpen((v) => !v)}
            style={{ color: '#C4BAA6' }}
          >
            {isOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`md:hidden overflow-hidden transition-all duration-200 ${
          isOpen ? 'opacity-100 translate-y-0 max-h-72' : 'opacity-0 -translate-y-2 max-h-0 pointer-events-none'
        }`}
        style={{ background: 'rgba(10,10,15,0.98)', borderTop: isOpen ? '1px solid rgba(240,235,224,0.08)' : 'none' }}
      >
        <nav className="flex flex-col px-4 py-3 gap-1" aria-label="Menu mobile">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="py-2 px-3 rounded-md text-sm hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              style={{ color: '#C4BAA6' }}
              onClick={() => setIsOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2 mt-1 border-t" style={{ borderColor: 'rgba(240,235,224,0.08)' }}>
            <Button variant="ghost" size="sm" asChild className="flex-1">
              <Link href="/login" onClick={() => setIsOpen(false)}>Connexion</Link>
            </Button>
            <Button size="sm" asChild className="flex-1">
              <Link href="/signup" onClick={() => setIsOpen(false)}>Essai gratuit</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
