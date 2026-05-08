import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            <span className="text-blue-600">Abema</span> PM
          </h1>
          <p className="text-sm text-slate-500 mt-1">Gestion de projet PMBOK 8</p>
        </div>
        {children}
      </div>
    </div>
  )
}
