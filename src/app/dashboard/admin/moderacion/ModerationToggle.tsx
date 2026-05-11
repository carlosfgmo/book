'use client'

import { useTransition } from 'react'
import { toggleCommentVisibility } from '../actions'

export default function ModerationToggle({
  commentId,
  isVisible,
}: {
  commentId: string
  isVisible: boolean
}) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => toggleCommentVisibility(commentId, !isVisible))}
      className={`shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-60 ${
        isVisible
          ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
          : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
      }`}
    >
      {pending ? '...' : isVisible ? 'Ocultar' : 'Mostrar'}
    </button>
  )
}
