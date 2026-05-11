'use client'

import { useActionState } from 'react'
import { updateProfile } from '../actions'

const inputClass =
  'w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400'

type Props = {
  profile: {
    full_name: string
    phone: string | null
    address: string | null
  }
}

export default function ProfileForm({ profile }: Props) {
  const [state, formAction, pending] = useActionState(updateProfile, null)

  return (
    <form action={formAction} className="space-y-5 bg-white rounded-xl border border-stone-200 p-6">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Nombre completo *</label>
        <input
          name="full_name"
          required
          defaultValue={profile.full_name}
          className={inputClass}
          placeholder="Tu nombre"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Teléfono / Yape</label>
        <input
          name="phone"
          defaultValue={profile.phone ?? ''}
          className={inputClass}
          placeholder="Ej. 999-000-111"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Dirección de envío</label>
        <textarea
          name="address"
          rows={2}
          defaultValue={profile.address ?? ''}
          className={`${inputClass} resize-none`}
          placeholder="Para envíos físicos (distrito, ciudad)"
        />
        <p className="text-xs text-stone-400 mt-0.5">Se usará por defecto en tus pedidos físicos</p>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
          ✓ Datos actualizados correctamente
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-60"
      >
        {pending ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
