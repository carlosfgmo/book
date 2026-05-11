import { createClient } from '@/lib/supabase/server'
import ProfileForm from './ProfileForm'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('user')
    .select('full_name, phone, address')
    .eq('id', user!.id)
    .single()

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Mis datos</h1>
        <p className="text-stone-400 text-sm mt-0.5">Actualiza tu información personal</p>
      </div>

      <ProfileForm
        profile={{
          full_name: profile?.full_name ?? '',
          phone: profile?.phone ?? null,
          address: profile?.address ?? null,
        }}
      />
    </div>
  )
}
