import Link from 'next/link'
import Image from 'next/image'
import type { Book, User, Category } from '@/types'

type Props = {
  book: Book & {
    author: Pick<User, 'full_name'>
    category: Pick<Category, 'name'> | null
  }
  priority?: boolean
}

const statusLabel: Record<string, string> = {
  presale: 'Pre-venta',
}

export default function BookCard({ book, priority = false }: Props) {
  const price =
    book.status === 'presale' && book.presale_price ? book.presale_price : book.price

  return (
    <Link href={`/catalogo/${book.slug}`} className="group">
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-md hover:border-stone-300 transition-all">
        <div className="aspect-[2/3] bg-stone-100 relative overflow-hidden">
          {book.cover_url ? (
            <Image
              src={book.cover_url}
              alt={book.title}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl text-stone-300">
              📖
            </div>
          )}
          {statusLabel[book.status] && (
            <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              {statusLabel[book.status]}
            </span>
          )}
          {book.delivery_type === 'pdf' && (
            <span className="absolute top-2 right-2 bg-stone-800/70 text-white text-xs px-1.5 py-0.5 rounded font-medium">
              PDF
            </span>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2">
            {book.title}
          </h3>
          <p className="text-stone-400 text-xs mt-0.5 truncate">{book.author.full_name}</p>
          <p className="text-stone-900 font-bold mt-2 text-sm">
            S/{' '}
            {Number(price).toFixed(2)}
          </p>
          {book.status === 'presale' && book.release_date && (() => {
            const release = new Date(book.release_date)
            const today   = new Date()
            today.setHours(0, 0, 0, 0)
            release.setHours(0, 0, 0, 0)
            const days = Math.ceil((release.getTime() - today.getTime()) / 86_400_000)
            return (
              <div className="mt-1.5">
                <p className="text-amber-600 text-xs">
                  Lanzamiento:{' '}
                  {new Date(book.release_date).toLocaleDateString('es-PE', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>
                {days > 0 && (
                  <span className="inline-block mt-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                    {days === 1 ? 'mañana' : `${days} días`}
                  </span>
                )}
              </div>
            )
          })()}
        </div>
      </div>
    </Link>
  )
}
