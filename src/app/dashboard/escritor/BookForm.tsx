'use client'

import { useActionState, useState } from 'react'
import { createBook, updateBook } from './actions'
import { createClient } from '@/lib/supabase/client'
import type { Book, Category } from '@/types'

const inputClass =
  'w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400'

type Props = {
  categories: Pick<Category, 'id' | 'name'>[]
  book?: Book
}

export default function BookForm({ categories, book }: Props) {
  const action = book ? updateBook : createBook
  const [state, formAction, pending] = useActionState(action, null)

  const [coverUrl, setCoverUrl] = useState(book?.cover_url ?? '')
  const [pdfUrl, setPdfUrl] = useState(book?.pdf_url ?? '')
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const [deliveryType, setDeliveryType] = useState(book?.delivery_type ?? 'pdf')
  const [status, setStatus] = useState(book?.status ?? 'draft')

  const uploadFile = async (
    file: File,
    bucket: string,
    setSrc: (url: string) => void,
    setLoading: (v: boolean) => void
  ) => {
    setLoading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { data, error } = await supabase.storage.from(bucket).upload(path, file)
    if (!error && data) {
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
      setSrc(urlData.publicUrl)
    }
    setLoading(false)
  }

  return (
    <form action={formAction} className="space-y-5 bg-white rounded-xl border border-stone-200 p-6">
      {book && <input type="hidden" name="id" value={book.id} />}
      <input type="hidden" name="cover_url" value={coverUrl} />
      <input type="hidden" name="pdf_url" value={pdfUrl} />

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-stone-700 mb-1">Título *</label>
          <input name="title" required defaultValue={book?.title} className={inputClass} placeholder="Título del libro" />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-stone-700 mb-1">Slug (URL)</label>
          <input name="slug" defaultValue={book?.slug} className={inputClass} placeholder="se-genera-automaticamente" />
          <p className="text-xs text-stone-400 mt-0.5">Deja vacío para generar desde el título</p>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-stone-700 mb-1">Sinopsis *</label>
          <textarea
            name="description"
            required
            rows={4}
            defaultValue={book?.description}
            className={`${inputClass} resize-none`}
            placeholder="Descripción del libro..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Categoría</label>
          <select name="category_id" defaultValue={book?.category_id ?? ''} className={inputClass}>
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Tipo de entrega *</label>
          <select
            name="delivery_type"
            value={deliveryType}
            onChange={(e) => setDeliveryType(e.target.value as any)}
            className={inputClass}
          >
            <option value="pdf">PDF</option>
            <option value="physical">Físico</option>
            <option value="both">PDF + Físico</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Precio (S/) *</label>
          <input name="price" type="number" step="0.01" min="0" required defaultValue={book?.price} className={inputClass} placeholder="0.00" />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Precio pre-venta (S/)</label>
          <input name="presale_price" type="number" step="0.01" min="0" defaultValue={book?.presale_price ?? ''} className={inputClass} placeholder="Opcional" />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Estado *</label>
          <select
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className={inputClass}
          >
            <option value="draft">Borrador</option>
            <option value="presale">Pre-venta</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>
        </div>

        {(deliveryType === 'physical' || deliveryType === 'both') && (
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Stock físico</label>
            <input name="stock" type="number" min="0" defaultValue={book?.stock ?? ''} className={inputClass} placeholder="Ej. 50" />
          </div>
        )}

        {status === 'presale' && (
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Fecha de lanzamiento</label>
            <input name="release_date" type="date" defaultValue={book?.release_date ?? ''} min={new Date().toISOString().split('T')[0]} className={inputClass} />
          </div>
        )}

        {/* Portada */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-stone-700 mb-1">Portada</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) uploadFile(f, 'covers', setCoverUrl, setUploadingCover)
            }}
            className="w-full text-sm text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200"
          />
          {uploadingCover && <p className="text-xs text-stone-400 mt-1">Subiendo portada...</p>}
          {coverUrl && <p className="text-xs text-green-600 mt-1">✓ Portada cargada</p>}
        </div>

        {/* PDF */}
        {(deliveryType === 'pdf' || deliveryType === 'both') && (
          <div className="col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-1">Archivo PDF</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) uploadFile(f, 'pdfs', setPdfUrl, setUploadingPdf)
              }}
              className="w-full text-sm text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200"
            />
            {uploadingPdf && <p className="text-xs text-stone-400 mt-1">Subiendo PDF...</p>}
            {pdfUrl && <p className="text-xs text-green-600 mt-1">✓ PDF cargado</p>}
          </div>
        )}
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending || uploadingCover || uploadingPdf}
        className="w-full py-2.5 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-60"
      >
        {pending ? 'Guardando...' : book ? 'Guardar cambios' : 'Publicar libro'}
      </button>
    </form>
  )
}
