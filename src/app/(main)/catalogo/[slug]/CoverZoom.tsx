'use client'

import Image from 'next/image'
import { useRef, useState, useEffect } from 'react'

type Props = { src: string; alt: string }

const SCALE = 2.5

export default function CoverZoom({ src, alt }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [origin, setOrigin]   = useState('50% 50%')
  const [active, setActive]   = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const [zoomed, setZoomed]   = useState(false)   // segunda capa de zoom dentro del lightbox

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current!.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin(`${x.toFixed(1)}% ${y.toFixed(1)}%`)
  }

  function openLightbox() {
    setZoomed(false)
    setLightbox(true)
  }

  function closeLightbox() {
    setLightbox(false)
    setZoomed(false)
  }

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeLightbox() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  useEffect(() => {
    document.body.style.overflow = lightbox ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightbox])

  return (
    <>
      {/* Thumbnail con zoom de hover */}
      <div
        ref={ref}
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        onMouseMove={handleMove}
        className="aspect-[2/3] rounded-xl overflow-hidden bg-stone-100 relative shadow-md cursor-crosshair select-none"
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 280px"
          draggable={false}
          className="object-contain"
          style={{
            transform: active ? `scale(${SCALE})` : 'scale(1)',
            transformOrigin: origin,
            transition: active ? 'transform 0.25s ease' : 'transform 0.3s ease',
            willChange: 'transform',
          }}
        />
      </div>

      {/* Link Ver portada */}
      <button
        onClick={openLightbox}
        className="mt-2 w-full text-xs text-stone-400 hover:text-stone-700 transition-colors text-center"
      >
        VER PORTADA COMPLETA ↗
      </button>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          {/* Barra superior */}
          <div className="flex items-center justify-between px-5 py-3 shrink-0">
            <span className="text-white/50 text-xs">
              {zoomed ? 'Haz clic para reducir · Scroll para desplazarte' : 'Haz clic en la imagen para ampliar más'}
            </span>
            <button
              onClick={closeLightbox}
              className="text-white/60 hover:text-white transition-colors"
              aria-label="Cerrar"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Área de imagen */}
          <div
            className={`flex-1 ${zoomed ? 'overflow-y-auto overflow-x-hidden' : 'overflow-hidden flex items-center justify-center'}`}
            onClick={zoomed ? undefined : closeLightbox}
          >
            {zoomed ? (
              /* Vista ampliada + scroll */
              <div className="flex justify-center py-6 min-h-full">
                <Image
                  src={src}
                  alt={alt}
                  width={800}
                  height={1200}
                  style={{ width: '92vw', maxWidth: '600px', height: 'auto' }}
                  className="cursor-zoom-out rounded-lg shadow-2xl"
                  onClick={() => setZoomed(false)}
                  draggable={false}
                  priority
                />
              </div>
            ) : (
              /* Vista encuadrada */
              <div
                className="relative w-full h-full max-w-xl mx-4 cursor-zoom-in"
                onClick={(e) => { e.stopPropagation(); setZoomed(true) }}
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 576px"
                  className="object-contain"
                  priority
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
