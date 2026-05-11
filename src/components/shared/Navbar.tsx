import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from './LogoutButton'

const navLinks = [
  { href: '/?seccion=nuevas',      label: 'Nuevas llegadas' },
  { href: '/?seccion=bestsellers', label: 'Best Sellers' },
  { href: '/?seccion=preventa',    label: 'Pre-ventas' },
  { href: '/?seccion=generos',     label: 'Géneros' },
]

export default async function Navbar({ activeSection }: { activeSection?: string } = {}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: { full_name: string; role: string[] } | null = null
  if (user) {
    const { data } = await supabase.from('user').select('full_name, role').eq('id', user.id).single()
    profile = data
  }

  const isAdmin  = profile?.role?.includes('admin')
  const isWriter = profile?.role?.includes('writer')

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold text-stone-900 shrink-0 tracking-tight"
        >
          Achachaw Books
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                activeSection && l.href.includes(activeSection)
                  ? 'text-stone-900 font-semibold bg-stone-100'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Search */}
        <form action="/" className="hidden sm:flex items-center flex-1 max-w-xs">
          <div className="relative w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              name="buscar"
              placeholder="Títulos, autores..."
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-stone-200 rounded-full bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:bg-white transition"
            />
          </div>
        </form>

        {/* User area */}
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <>
              {isAdmin && (
                <Link href="/dashboard/admin" className="text-xs px-3 py-1.5 bg-stone-900 text-white rounded-full hover:bg-stone-700 transition-colors">
                  Admin
                </Link>
              )}
              {isWriter && (
                <Link href="/dashboard/escritor" className="text-xs px-3 py-1.5 border border-stone-300 text-stone-700 rounded-full hover:bg-stone-50 transition-colors">
                  Mi espacio
                </Link>
              )}
              {!isAdmin && !isWriter && (
                <Link href="/dashboard/lector" className="text-xs px-3 py-1.5 border border-stone-300 text-stone-700 rounded-full hover:bg-stone-50 transition-colors">
                  Mi cuenta
                </Link>
              )}
              <Link href="/pedidos" title="Mis pedidos" className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </Link>
              <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                <span className="text-xs text-stone-500 hidden sm:block max-w-[100px] truncate">{profile?.full_name}</span>
                <LogoutButton />
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-stone-600 hover:text-stone-900 px-3 py-1.5 transition-colors">
                Ingresar
              </Link>
              <Link href="/register" className="text-sm bg-stone-900 text-white px-4 py-1.5 rounded-full hover:bg-stone-700 transition-colors">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
