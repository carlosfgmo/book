'use client'

import { useActionState } from 'react'
import { addComment } from '@/app/(main)/actions'

export default function CommentForm({ bookId }: { bookId: string }) {
  const [state, formAction, pending] = useActionState(addComment, null)

  return (
    <form action={formAction} className="bg-white rounded-xl border border-stone-200 p-4">
      <h3 className="text-sm font-semibold text-stone-700 mb-3">Dejar una reseña</h3>
      <input type="hidden" name="book_id" value={bookId} />

      <div className="mb-3">
        <label className="block text-xs font-medium text-stone-600 mb-1">
          Calificación (opcional)
        </label>
        <select
          name="rating"
          className="w-full sm:w-40 px-2 py-1.5 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400"
        >
          <option value="">Sin calificación</option>
          <option value="5">★★★★★ Excelente</option>
          <option value="4">★★★★ Muy bueno</option>
          <option value="3">★★★ Regular</option>
          <option value="2">★★ Malo</option>
          <option value="1">★ Pésimo</option>
        </select>
      </div>

      <textarea
        name="content"
        required
        rows={3}
        placeholder="Escribe tu comentario..."
        className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none"
      />

      {state?.error && (
        <p className="text-xs text-red-600 mt-2">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-3 px-4 py-2 text-sm bg-stone-900 text-white rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-60"
      >
        {pending ? 'Enviando...' : 'Publicar comentario'}
      </button>
    </form>
  )
}
