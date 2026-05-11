'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    return { error: 'Email o contraseña incorrectos.' }
  }

  redirect('/dashboard')
}

export async function register(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
) {
  const supabase = await createClient()

  const isWriter = formData.get('is_writer') === 'true'

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('full_name') as string,
        is_writer: isWriter,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Te enviamos un link de confirmación a tu correo.' }
}
