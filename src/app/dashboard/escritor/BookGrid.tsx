'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { reorderBooks } from './actions'

type Book = {
  id: string
  title: string
  price: number
  presale_price: number | null
  cover_url: string | null
  status: string
  sort_order?: number | null
  release_date?: string | null
}

const statusBadge: Record<string, { label: string; color: string }> = {
  draft:     { label: 'Borrador',  color: 'bg-stone-100 text-stone-500' },
  presale:   { label: 'Pre-venta', color: 'bg-amber-50 text-amber-700' },
  published: { label: 'Publicado', color: 'bg-green-50 text-green-700' },
  archived:  { label: 'Archivado', color: 'bg-red-50 text-red-600' },
}

export default function BookGrid({ initialBooks }: { initialBooks: Book[] }) {
  const [books, setBooks]     = useState(initialBooks)
  const [dragging, setDragging] = useState<string | null>(null)
  const [, startTransition]   = useTransition()
  const dragIdx               = useRef<number | null>(null)

  function onDragStart(e: React.DragEvent, index: number) {
    dragIdx.current = index
    setDragging(books[index].id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function onDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragIdx.current === null || dragIdx.current === index) return
    const next = [...books]
    const [moved] = next.splice(dragIdx.current, 1)
    next.splice(index, 0, moved)
    dragIdx.current = index
    setBooks(next)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
  }

  function onDragEnd() {
    setDragging(null)
    dragIdx.current = null
    startTransition(() => {
      reorderBooks(books.map((b, i) => ({ id: b.id, sort_order: i })))
    })
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      {books.map((book, index) => {
        const badge = statusBadge[book.status] ?? statusBadge.draft
        const isDragging = dragging === book.id
        return (
          <div
            key={book.id}
            draggable
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={(e) => onDragOver(e, index)}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            className={`group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm transition-all select-none cursor-grab active:cursor-grabbing ${
              isDragging ? 'opacity-40 scale-95 shadow-none' : 'hover:shadow-md hover:-translate-y-0.5'
            }`}
          >
            {/* Cover */}
            <div className="relative aspect-[2/3] bg-stone-100 overflow-hidden">
              {book.cover_url ? (
                <Image
                  src={book.cover_url}
                  alt={book.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">📖</div>
              )}

              {/* Drag handle hint */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-lg p-1.5">
                <svg className="w-4 h-4 text-stone-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 2a2 2 0 110 4 2 2 0 010-4zm6 0a2 2 0 110 4 2 2 0 010-4zM7 8a2 2 0 110 4 2 2 0 010-4zm6 0a2 2 0 110 4 2 2 0 010-4zM7 14a2 2 0 110 4 2 2 0 010-4zm6 0a2 2 0 110 4 2 2 0 010-4z" />
                </svg>
              </div>

              {/* Status badge overlay */}
              <div className="absolute top-2 left-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="text-sm font-semibold text-stone-900 leading-snug line-clamp-2 mb-1">
                {book.title}
              </p>
              <p className="text-xs text-stone-400 mb-1">
                S/ {Number(book.price).toFixed(2)}
                {book.presale_price && (
                  <span className="ml-1 text-amber-600">→ S/ {Number(book.presale_price).toFixed(2)}</span>
                )}
              </p>
              {book.status === 'presale' && book.release_date && (() => {
                const release = new Date(book.release_date)
                const today   = new Date()
                today.setHours(0, 0, 0, 0)
                release.setHours(0, 0, 0, 0)
                const days = Math.ceil((release.getTime() - today.getTime()) / 86_400_000)
                return (
                  <div className="mb-2">
                    <p className="text-xs text-amber-600">
                      {new Date(book.release_date).toLocaleDateString('es-PE', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                    {days > 0 && (
                      <span className="inline-block mt-0.5 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        {days === 1 ? 'mañana' : `${days} días`}
                      </span>
                    )}
                  </div>
                )
              })()}
              <Link
                href={`/dashboard/escritor/libros/${book.id}/editar`}
                onClick={(e) => e.stopPropagation()}
                className="block w-full text-center text-xs py-1.5 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 hover:border-stone-400 transition-colors"
              >
                Editar
              </Link>
            </div>
          </div>
        )
      })}

      {/* New book card */}
      <Link
        href="/dashboard/escritor/libros/nuevo"
        className="flex flex-col items-center justify-center aspect-[2/3] rounded-2xl border-2 border-dashed border-stone-200 text-stone-400 hover:border-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-all"
      >
        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
        <span className="text-xs font-medium">Publicar libro</span>
      </Link>
    </div>
  )
}
