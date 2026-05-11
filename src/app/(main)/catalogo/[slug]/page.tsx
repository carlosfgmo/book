import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BuyButton from './BuyButton'
import CommentForm from './CommentForm'
import CoverZoom from './CoverZoom'

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: book } = await supabase
    .from('book')
    .select('*, author:user(id, full_name, avatar_url, phone), category(name)')
    .eq('slug', slug)
    .in('status', ['published', 'presale'])
    .single()

  if (!book) notFound()

  const { data: comments } = await supabase
    .from('comment')
    .select('*, user:user(full_name)')
    .eq('book_id', book.id)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })

  const { data: rating } = await supabase
    .from('book_rating')
    .select('avg_rating, total_ratings')
    .eq('book_id', book.id)
    .single()

  const price =
    book.status === 'presale' && book.presale_price ? book.presale_price : book.price

  const deliveryLabel: Record<string, string> = {
    pdf: 'Descarga PDF',
    physical: 'Libro físico',
    both: 'PDF + Físico',
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-[280px_1fr] gap-8">
        {/* Portada */}
        <div>
          {book.cover_url ? (
            <CoverZoom src={book.cover_url} alt={book.title} />
          ) : (
            <div className="aspect-[2/3] rounded-xl overflow-hidden bg-stone-100 relative shadow-md flex items-center justify-center text-7xl">
              📖
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {book.status === 'presale' && (
            <span className="inline-block bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium mb-3">
              Pre venta
            </span>
          )}
          <h1 className="text-2xl font-bold text-stone-900">{book.title}</h1>
          <p className="text-stone-500 mt-1">{(book.author as any)?.full_name}</p>

          {book.category && (
            <span className="inline-block mt-2 text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
              {(book.category as any)?.name}
            </span>
          )}

          {rating && (
            <div className="flex items-center gap-1.5 mt-3">
              <span className="text-amber-400 text-sm">{'★'.repeat(Math.round(rating.avg_rating))}</span>
              <span className="text-stone-500 text-sm">
                {Number(rating.avg_rating).toFixed(1)} ({rating.total_ratings} reseñas)
              </span>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl font-bold text-stone-900">S/ {Number(price).toFixed(2)}</span>
            {book.status === 'presale' && book.presale_price && (
              <span className="text-stone-400 line-through text-lg">
                S/ {Number(book.price).toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex gap-2 mt-3">
            <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-lg">
              {deliveryLabel[book.delivery_type]}
            </span>
            {book.stock !== null && book.delivery_type !== 'pdf' && (
              <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-lg">
                Stock: {book.stock}
              </span>
            )}
          </div>

          {book.release_date && (() => {
            const release = new Date(book.release_date)
            const today   = new Date()
            today.setHours(0, 0, 0, 0)
            release.setHours(0, 0, 0, 0)
            const days = Math.ceil((release.getTime() - today.getTime()) / 86_400_000)
            return (
              <p className="text-stone-400 text-sm mt-2">
                Lanzamiento:{' '}
                {new Date(book.release_date).toLocaleDateString('es-PE', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
                {days > 0 && (
                  <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                    {days === 1 ? 'mañana' : `se publica en ${days} días`}
                  </span>
                )}
              </p>
            )
          })()}

          <div className="mt-6">
            <BuyButton bookId={book.id} />
          </div>

          <div className="mt-6 prose prose-stone prose-sm max-w-none">
            <h3 className="text-stone-700 font-semibold mb-2">Sinopsis</h3>
            <p className="text-stone-600 leading-relaxed whitespace-pre-line">
              {book.description}
            </p>
          </div>
        </div>
      </div>

      {/* Comentarios */}
      <div className="mt-12 border-t border-stone-200 pt-8">
        <h2 className="text-xl font-bold text-stone-900 mb-6">
          Reseñas y comentarios
        </h2>

        <CommentForm bookId={book.id} />

        <div className="mt-8 space-y-4">
          {comments?.length === 0 && (
            <p className="text-stone-400 text-sm">Aún no hay comentarios. ¡Sé el primero!</p>
          )}
          {comments?.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-stone-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-stone-800 text-sm">
                    {(c.user as any)?.full_name}
                  </span>
                  {c.is_verified_purchase && (
                    <span className="ml-2 text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                      Compra verificada
                    </span>
                  )}
                </div>
                {c.rating && (
                  <span className="text-amber-400 text-sm">{'★'.repeat(c.rating)}</span>
                )}
              </div>
              <p className="text-stone-600 text-sm mt-2">{c.content}</p>
              <p className="text-stone-400 text-xs mt-2">
                {new Date(c.created_at).toLocaleDateString('es-PE')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
