import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import LoginForm from '@/app/(auth)/login/LoginForm'
import BuyAnonButton from './BuyAnonButton'
import { createOrder } from '@/app/(main)/actions'

export default async function ComprarPage({
  params,
}: {
  params: Promise<{ bookId: string }>
}) {
  const { bookId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!(user?.email)

  // Logged-in users don't need this choice page — create order directly
  if (isAuthenticated) {
    await createOrder(bookId)
  }

  const { data: book } = await supabase
    .from('book')
    .select('id, title, price, presale_price, status, cover_url')
    .eq('id', bookId)
    .single()

  if (!book) notFound()

  const price =
    book.status === 'presale' && book.presale_price ? book.presale_price : book.price

  const returnUrl = `/comprar/${bookId}`

  return (
    <main className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 py-12">

      {/* Book summary */}
      <div className="flex items-center gap-4 mb-8">
        {book.cover_url ? (
          <div className="relative w-14 h-20 rounded-lg overflow-hidden shadow-sm shrink-0">
            <Image src={book.cover_url} alt={book.title} fill sizes="56px" className="object-cover" />
          </div>
        ) : (
          <div className="w-14 h-20 rounded-lg bg-stone-200 flex items-center justify-center text-2xl shrink-0">
            📖
          </div>
        )}
        <div>
          <p className="text-stone-500 text-xs uppercase tracking-wide font-medium mb-0.5">Comprando</p>
          <h1 className="text-lg font-bold text-stone-900 leading-snug">{book.title}</h1>
          <p className="text-2xl font-bold text-stone-900 mt-0.5">
            S/ {Number(price).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Two-column choice */}
      <div className="w-full max-w-2xl grid sm:grid-cols-2 gap-4">

        {/* Left — Login / Register */}
        <div className="bg-white rounded-2xl border border-stone-200 p-7 flex flex-col">
          <div className="mb-5">
            <h2 className="text-base font-bold text-stone-900">Con cuenta</h2>
            <p className="text-sm text-stone-500 mt-1">Inicia sesión o regístrate para ver tu historial de pedidos</p>
          </div>
          <LoginForm next={returnUrl} isCheckout={false} embedded />
        </div>

        {/* Right — Anonymous */}
        <div className="bg-stone-50 rounded-2xl border-2 border-dashed border-stone-300 p-7 flex flex-col items-center justify-center text-center gap-5">
          <div className="w-14 h-14 rounded-full bg-stone-200 flex items-center justify-center text-3xl">
            🛒
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900">Sin cuenta</h2>
            <p className="text-sm text-stone-500 mt-1 leading-snug">
              Compra rápida solo con tu correo y teléfono. Sin registro requerido.
            </p>
          </div>
          <BuyAnonButton bookId={bookId} />
          <p className="text-xs text-stone-400">
            Puedes crear una cuenta después para ver tu historial
          </p>
        </div>
      </div>
    </main>
  )
}
