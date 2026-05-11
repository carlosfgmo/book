import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role?.includes('admin')) redirect('/dashboard/admin')
  if (profile?.role?.includes('writer')) redirect('/dashboard/escritor')
  redirect('/')
}
