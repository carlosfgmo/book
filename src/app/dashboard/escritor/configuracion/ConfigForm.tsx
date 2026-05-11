'use client'

import { useActionState } from 'react'
import { updateWriterProfile } from '../actions'

const inputClass =
  'w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400'

type Profile = {
  full_name: string
  phone: string | null
  address: string | null
  delivery_preference: string
} | null

export default function ConfigForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(updateWriterProfile, null)

  return (
    <form action={formAction} className="bg-white rounded-xl border border-stone-200 p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Nombre completo</label>
        <input name="full_name" required defaultValue={profile?.full_name ?? ''} className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Teléfono / Yape</label>
        <input name="phone" defaultValue={profile?.phone ?? ''} className={inputClass} placeholder="Ej. 999-000-111" />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Dirección de despacho</label>
        <input name="address" defaultValue={profile?.address ?? ''} className={inputClass} placeholder="Para envíos físicos" />
      </div>

      <div className="border-t border-stone-100 pt-5">
        <label className="block text-sm font-semibold text-stone-800 mb-1">
          Modo de entrega
        </label>
        <p className="text-xs text-stone-400 mb-3">
          Define cómo gestionarás los pedidos de tus libros físicos.
        </p>
        <div className="space-y-2">
          <label className="flex items-start gap-3 p-3 rounded-lg border border-stone-200 cursor-pointer hover:bg-stone-50">
            <input
              type="radio"
              name="delivery_preference"
              value="platform"
              defaultChecked={!profile?.delivery_preference || profile.delivery_preference === 'platform'}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-stone-800">La plataforma gestiona la entrega</p>
              <p className="text-xs text-stone-400 mt-0.5">
                Achachaw Books coordina el envío al lector. Tú debes entregar los libros al courier.
              </p>
            </div>
          </label>
          <label className="flex items-start gap-3 p-3 rounded-lg border border-stone-200 cursor-pointer hover:bg-stone-50">
            <input
              type="radio"
              name="delivery_preference"
              value="direct"
              defaultChecked={profile?.delivery_preference === 'direct'}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-stone-800">Gestiono yo mismo los pedidos</p>
              <p className="text-xs text-stone-400 mt-0.5">
                Tú contactas directamente al lector y coordinas el envío por tu cuenta.
              </p>
            </div>
          </label>
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">{state.success}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-60"
      >
        {pending ? 'Guardando...' : 'Guardar configuración'}
      </button>
    </form>
  )
}
