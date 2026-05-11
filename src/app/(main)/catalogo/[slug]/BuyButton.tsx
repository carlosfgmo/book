'use client'

import { createOrder } from '@/app/(main)/actions'
import { useTransition } from 'react'

export default function BuyButton({ bookId }: { bookId: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => createOrder(bookId))}
      disabled={pending}
      className="w-full sm:w-auto px-8 py-3 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-60"
    >
      {pending ? 'Procesando...' : 'Comprar ahora'}
    </button>
  )
}
