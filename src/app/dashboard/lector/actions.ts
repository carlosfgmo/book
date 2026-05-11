'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const full_name = (formData.get('full_name') as string).trim()
  const phone     = (formData.get('phone') as string).trim() || null
  const address   = (formData.get('address') as string).trim() || null

  if (!full_name) return { error: 'El nombre es obligatorio' }

  const { error } = await supabase
    .from('user')
    .update({ full_name, phone, address })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/lector/perfil')
  return { success: true }
}
