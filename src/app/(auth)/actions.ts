'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

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

  const next = formData.get('next') as string
  // Allow only relative internal paths; block open redirects like //evil.com
  const safeNext =
    next &&
    next.startsWith('/') &&
    !next.startsWith('//') &&
    !next.includes('://')
      ? next
      : '/dashboard'
  redirect(safeNext)
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
    return { error: 'No se pudo crear la cuenta. Verifica los datos e inténtalo de nuevo.' }
  }

  return { success: 'Te enviamos un link de confirmación a tu correo.' }
}

export async function forgotPassword(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const supabase = await createClient()
  const email = (formData.get('email') as string).trim()
  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const proto = headersList.get('x-forwarded-proto') ?? 'http'
  const origin = `${proto}://${host}`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/api/auth/callback?next=/reset-password`,
  })

  if (error) return { error: 'No se pudo procesar la solicitud.' }
  return { success: true }
}

export async function resetPassword(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirm  = formData.get('confirm') as string

  if (password !== confirm) return { error: 'Las contraseñas no coinciden.' }
  if (password.length < 8)  return { error: 'La contraseña debe tener al menos 8 caracteres.' }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: 'No se pudo actualizar la contraseña.' }

  redirect('/dashboard')
}
