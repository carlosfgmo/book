'use client'

import { useState, useCallback, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

type Props = {
  url: string
  title: string
}

export default function PdfReader({ url, title }: Props) {
  const [numPages, setNumPages] = useState<number>(0)
  const [page, setPage] = useState(1)
  const [scale, setScale] = useState(1.2)
  const [containerWidth, setContainerWidth] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return
    const ro = new ResizeObserver(() => setContainerWidth(node.clientWidth))
    ro.observe(node)
    setContainerWidth(node.clientWidth)
    return () => ro.disconnect()
  }, [])

  // Disable right-click on the PDF area
  useEffect(() => {
    const prevent = (e: MouseEvent) => e.preventDefault()
    document.addEventListener('contextmenu', prevent)
    return () => document.removeEventListener('contextmenu', prevent)
  }, [])

  function onDocumentLoad({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setLoading(false)
  }

  const pageWidth = containerWidth
    ? Math.min(containerWidth - 32, 900) * scale
    : undefined

  const canPrev = page > 1
  const canNext = page < numPages

  return (
    <div className="flex flex-col h-screen bg-stone-800 select-none">

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-stone-900 text-white shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <a href="/pedidos" className="text-stone-400 hover:text-white transition-colors text-sm shrink-0">
            ← Mis pedidos
          </a>
          <span className="text-stone-600 hidden sm:block">|</span>
          <span className="text-sm font-medium truncate hidden sm:block">{title}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Zoom */}
          <button
            onClick={() => setScale(s => Math.max(0.5, +(s - 0.2).toFixed(1)))}
            className="w-8 h-8 rounded-lg bg-stone-700 hover:bg-stone-600 flex items-center justify-center text-white transition-colors"
            aria-label="Reducir zoom"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-xs text-stone-400 w-10 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale(s => Math.min(3, +(s + 0.2).toFixed(1)))}
            className="w-8 h-8 rounded-lg bg-stone-700 hover:bg-stone-600 flex items-center justify-center text-white transition-colors"
            aria-label="Aumentar zoom"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16M4 12h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* PDF area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto"
        style={{ scrollbarColor: '#57534e #292524' }}
      >
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-stone-400 gap-3">
            <span className="text-5xl">📄</span>
            <p className="text-sm">No se pudo cargar el libro. Intenta de nuevo más tarde.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 gap-4">
            {loading && (
              <div className="text-stone-400 text-sm mt-20 flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Cargando libro...
              </div>
            )}
            <Document
              file={url}
              onLoadSuccess={onDocumentLoad}
              onLoadError={() => { setError(true); setLoading(false) }}
              loading={null}
              className="flex flex-col items-center gap-4"
            >
              <Page
                pageNumber={page}
                width={pageWidth}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                className="shadow-2xl"
              />
            </Document>
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      {numPages > 0 && (
        <div className="flex items-center justify-center gap-4 px-4 py-3 bg-stone-900 shrink-0">
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={!canPrev}
            className="px-4 py-1.5 bg-stone-700 hover:bg-stone-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
          >
            ← Anterior
          </button>

          <span className="text-stone-400 text-sm min-w-[90px] text-center">
            {page} / {numPages}
          </span>

          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!canNext}
            className="px-4 py-1.5 bg-stone-700 hover:bg-stone-600 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Print blocker */}
      <style>{`@media print { body { display: none !important; } }`}</style>
    </div>
  )
}
