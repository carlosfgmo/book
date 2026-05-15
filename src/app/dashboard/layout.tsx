import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardSidebar from './DashboardSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  const isAdmin  = profile?.role?.includes('admin')
  const isWriter = profile?.role?.includes('writer')

  const writerLinks = [
    { href: '/dashboard/escritor',              label: 'Panel' },
    { href: '/dashboard/escritor/libros/nuevo', label: 'Publicar libro' },
    { href: '/dashboard/escritor/pedidos',      label: 'Pedidos' },
    { href: '/dashboard/escritor/configuracion',label: 'Configuración' },
  ]

  const adminLinks = [
    { href: '/dashboard/admin',               label: 'Panel' },
    { href: '/dashboard/admin/pagos',         label: 'Cola de pagos' },
    { href: '/dashboard/admin/liquidaciones', label: 'Liquidaciones' },
    { href: '/dashboard/admin/moderacion',    label: 'Moderación' },
  ]

  const readerLinks = [
    { href: '/dashboard/lector',         label: 'Panel' },
    { href: '/dashboard/lector/pedidos', label: 'Mis pedidos' },
    { href: '/dashboard/lector/perfil',  label: 'Mis datos' },
  ]

  const sections: { label: string; links: typeof writerLinks }[] = []
  if (isAdmin)              sections.push({ label: 'Admin',    links: adminLinks })
  if (isWriter)             sections.push({ label: 'Escritor', links: writerLinks })
  if (!isAdmin && !isWriter) sections.push({ label: 'Lector',  links: readerLinks })

  const roleLabel = [isAdmin && 'Administrador', isWriter && 'Escritor']
    .filter(Boolean).join(' · ') || 'Lector'

  return (
    <div className="min-h-screen flex bg-stone-100">
      <DashboardSidebar
        fullName={profile?.full_name ?? ''}
        roleLabel={roleLabel}
        sections={sections}
      />

      {/* Spacer for mobile top bar */}
      <main className="flex-1 overflow-auto p-6 pt-20 md:pt-6">
        {children}
      </main>
    </div>
  )
}
