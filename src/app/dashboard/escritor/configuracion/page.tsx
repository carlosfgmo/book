import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ConfigForm from './ConfigForm'

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user')
    .select('full_name, phone, address, delivery_preference')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Configuración</h1>
      <ConfigForm profile={profile} />
    </div>
  )
}
