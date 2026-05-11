'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { register } from '../actions'

type State = { error?: string; success?: string } | null

const inputClass =
  'w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent transition'

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState<State, FormData>(register, null)

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">📚</div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Achachaw Books</h1>
        <p className="text-stone-500 text-sm mt-1">Libros independientes del Perú</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
        <h2 className="text-lg font-semibold text-stone-800 mb-5">Crear cuenta</h2>

        {state?.success ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">✉️</div>
            <p className="text-stone-800 font-medium">Revisa tu correo</p>
            <p className="text-stone-500 text-sm mt-1">{state.success}</p>
            <Link
              href="/login"
              className="inline-block mt-5 text-sm font-medium text-stone-800 hover:underline"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="full_name" className="block text-sm font-medium text-stone-700">
                Nombre completo
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                autoComplete="name"
                placeholder="Tu nombre"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-stone-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tu@email.com"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-stone-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                className={inputClass}
              />
            </div>

            {/* Opción escritor */}
            <div className="border border-stone-200 rounded-xl p-4 bg-stone-50">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_writer"
                  value="true"
                  className="mt-0.5 accent-stone-800"
                />
                <div>
                  <p className="text-sm font-medium text-stone-800">Quiero publicar libros</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Activa el rol de escritor para publicar y gestionar tus libros.
                  </p>
                </div>
              </label>
            </div>

            {state?.error && (
              <div className="px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-sm text-red-600">{state.error}</p>
              </div>
            )}

            <Button type="submit" disabled={pending} className="w-full mt-1 cursor-pointer">
              {pending ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </form>
        )}

        {!state?.success && (
          <p className="text-center text-sm text-stone-500 mt-5">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-medium text-stone-800 hover:underline">
              Inicia sesión
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
