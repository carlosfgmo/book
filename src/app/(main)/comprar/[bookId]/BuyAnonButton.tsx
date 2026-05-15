'use client'

import { useTransition } from 'react'
import { createOrder } from '@/app/(main)/actions'

export default function BuyAnonButton({ bookId }: { bookId: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => createOrder(bookId))}
      className="w-full py-3 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-60 text-sm"
    >
      {pending ? 'Procesando...' : 'Continuar sin cuenta →'}
    </button>
  )
}
