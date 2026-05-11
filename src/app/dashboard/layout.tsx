import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/shared/LogoutButton'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role?.includes('admin')
  const isWriter = profile?.role?.includes('writer')

  const writerLinks = [
    { href: '/dashboard/escritor', label: 'Panel' },
    { href: '/dashboard/escritor/libros/nuevo', label: 'Publicar libro' },
    { href: '/dashboard/escritor/pedidos', label: 'Pedidos' },
    { href: '/dashboard/escritor/configuracion', label: 'Configuración' },
  ]

  const adminLinks = [
    { href: '/dashboard/admin', label: 'Panel' },
    { href: '/dashboard/admin/pagos', label: 'Cola de pagos' },
    { href: '/dashboard/admin/moderacion', label: 'Moderación' },
  ]

  const readerLinks = [
    { href: '/dashboard/lector',         label: 'Panel' },
    { href: '/dashboard/lector/pedidos', label: 'Mis pedidos' },
    { href: '/dashboard/lector/perfil',  label: 'Mis datos' },
  ]

  const navLinks = isAdmin ? adminLinks : isWriter ? writerLinks : readerLinks

  return (
    <div className="min-h-screen flex bg-stone-100">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-stone-200 flex flex-col">
        <div className="p-4 border-b border-stone-200">
          <Link href="/" className="font-bold text-stone-900 text-sm">📚 Achachaw Books</Link>
          <p className="text-xs text-stone-400 mt-0.5 truncate">{profile?.full_name}</p>
          <p className="text-xs text-stone-400">
            {isAdmin ? 'Administrador' : isWriter ? 'Escritor' : 'Lector'}
          </p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 rounded-lg text-sm text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-stone-200 space-y-2">
          <Link href="/" className="block text-xs text-stone-400 hover:text-stone-600">
            ← Ver catálogo
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
