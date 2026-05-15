'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { login } from '../actions'
import PasswordInput from '../PasswordInput'

type State = { error?: string } | null

const inputClass =
  'w-full px-3 py-2 text-sm border border-stone-300 rounded-lg bg-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent transition'

export default function LoginForm({
  next,
  isCheckout,
  embedded = false,
}: {
  next: string
  isCheckout: boolean
  embedded?: boolean
}) {
  const [state, formAction, pending] = useActionState<State, FormData>(login, null)

  const header = embedded ? null : (
    <div className="text-center mb-8">
      <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
        <div className="text-5xl mb-3">📚</div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Achachaw Books</h1>
        <p className="text-stone-500 text-sm mt-1">Libros independientes del Perú</p>
      </Link>
    </div>
  )

  if (isCheckout) {
    return (
      <div className="w-full max-w-2xl">
        {header}
        <div className="grid sm:grid-cols-2 gap-4">

          {/* Login */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-7">
            <h2 className="text-base font-semibold text-stone-800 mb-4">Inicia sesión</h2>
            <form action={formAction} className="space-y-3">
              {next && <input type="hidden" name="next" value={next} />}
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tu@correo.com"
                className={inputClass}
              />
              <PasswordInput
                name="password"
                required
                autoComplete="current-password"
                placeholder="Contraseña"
              />
              {state?.error && (
                <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
              )}
              <Button type="submit" disabled={pending} className="w-full cursor-pointer">
                {pending ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </form>
            <p className="text-center text-xs text-stone-500 mt-4">
              ¿No tienes cuenta?{' '}
              <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-medium text-stone-800 hover:underline">
                Regístrate
              </Link>
            </p>
          </div>

          {/* Anonymous */}
          <div className="bg-stone-50 rounded-2xl border-2 border-dashed border-stone-300 p-7 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center text-2xl">
              🛒
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-800 mb-1">Comprar sin cuenta</h2>
              <p className="text-sm text-stone-500 leading-snug">
                Completa tu compra solo con tu correo y teléfono. Sin registro.
              </p>
            </div>
            <Link
              href={next}
              className="w-full py-2.5 bg-stone-900 text-white text-sm font-semibold rounded-xl hover:bg-stone-700 transition-colors text-center"
            >
              Continuar sin cuenta →
            </Link>
            <p className="text-xs text-stone-400">
              Si te registras después, tu historial de compras estará disponible.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const formContent = (
    <>
      {!embedded && <h2 className="text-lg font-semibold text-stone-800 mb-5">Iniciar sesión</h2>}
      <form action={formAction} className="space-y-4">
        {next && <input type="hidden" name="next" value={next} />}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-stone-700">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email"
            placeholder="tu@email.com" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-stone-700">Contraseña</label>
          <PasswordInput id="password" name="password" required autoComplete="current-password"
            placeholder="••••••••" />
        </div>
        {state?.error && (
          <div className="px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-sm text-red-600">{state.error}</p>
          </div>
        )}
        <Button type="submit" disabled={pending} className="w-full mt-1 cursor-pointer">
          {pending ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </form>
      <div className="mt-4 space-y-2 text-center text-sm text-stone-500">
        <p>
          <Link href="/forgot-password" className="hover:underline text-stone-600">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
        <p>
          ¿No tienes cuenta?{' '}
          <Link
            href={next ? `/register?next=${encodeURIComponent(next)}` : '/register'}
            className="font-medium text-stone-800 hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </>
  )

  if (embedded) {
    return <div className="w-full">{formContent}</div>
  }

  return (
    <div className="w-full max-w-sm">
      {header}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
        {formContent}
      </div>
    </div>
  )
}
