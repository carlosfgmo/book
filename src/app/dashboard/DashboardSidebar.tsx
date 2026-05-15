'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from '@/components/shared/LogoutButton'

type NavLink = { href: string; label: string }
type Section = { label: string; links: NavLink[] }

type Props = {
  fullName: string
  roleLabel: string
  sections: Section[]
}

export default function DashboardSidebar({ fullName, roleLabel, sections }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const close = () => setOpen(false)

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-stone-200">
        <Link href="/" onClick={close} className="font-bold text-stone-900 text-sm">
          📚 Achachaw Books
        </Link>
        <p className="text-xs text-stone-400 mt-0.5 truncate">{fullName}</p>
        <p className="text-xs text-stone-400">{roleLabel}</p>
      </div>

      <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.label}>
            {sections.length > 1 && (
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider px-3 mb-1">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    pathname === link.href
                      ? 'bg-stone-900 text-white font-medium'
                      : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-stone-200 space-y-2">
        <Link href="/" onClick={close} className="block text-xs text-stone-400 hover:text-stone-600">
          ← Ver catálogo
        </Link>
        <LogoutButton />
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center gap-3 px-4 py-3 bg-white border-b border-stone-200">
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
          aria-label="Abrir menú"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-bold text-stone-900 text-sm">📚 Achachaw Books</span>
      </div>

      {/* Desktop sidebar — always visible */}
      <aside className="hidden md:flex w-56 shrink-0 bg-white border-r border-stone-200 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={close}
          aria-hidden
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
          <span className="font-bold text-stone-900 text-sm">Menú</span>
          <button
            onClick={close}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors"
            aria-label="Cerrar menú"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  )
}
