'use client'

import { createOrder } from '@/app/(main)/actions'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function BuyButton({
  bookId,
  isAuthenticated,
}: {
  bookId: string
  isAuthenticated: boolean
}) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handleBuy() {
    if (isAuthenticated) {
      startTransition(() => createOrder(bookId))
    } else {
      router.push(`/comprar/${bookId}`)
    }
  }

  return (
    <button
      onClick={handleBuy}
      disabled={pending}
      className="w-full sm:w-auto px-8 py-3 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-60"
    >
      {pending ? 'Procesando...' : 'Comprar ahora'}
    </button>
  )
}
