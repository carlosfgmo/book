export type SummaryCard = {
  heading: string | null
  body: string[]
}

export type SummaryChapter = {
  number: string
  title: string
  subtitle: string | null
  cards: SummaryCard[]
  quote: string | null
}

export type SummaryPart = {
  title: string
  color: string
  chapters: SummaryChapter[]
}

const PART_COLORS = ['rose', 'violet', 'teal', 'emerald', 'amber', 'sky']

/**
 * Mini-sintaxis para el resumen detallado de un libro:
 *   ## Parte N: Título de la parte
 *   ### 01. Título del capítulo
 *   Subtítulo/tagline del capítulo (línea libre, opcional)
 *   - Encabezado de tarjeta: línea 1 | línea 2 | línea 3
 *   > Cita de cierre del capítulo
 */
export function parseBookSummary(raw: string): SummaryPart[] {
  const parts: SummaryPart[] = []
  let currentPart: SummaryPart | null = null
  let currentChapter: SummaryChapter | null = null
  let expectSubtitle = false
  let autoChapterNumber = 0

  for (const rawLine of raw.replace(/\r\n/g, '\n').split('\n')) {
    const line = rawLine.trim()
    if (!line) continue

    if (line.startsWith('## ')) {
      const title = line.slice(3).trim().replace(/^parte\s+\d+\s*[:.\-]\s*/i, '')
      currentPart = { title, color: PART_COLORS[parts.length % PART_COLORS.length], chapters: [] }
      parts.push(currentPart)
      currentChapter = null
      expectSubtitle = false
      continue
    }

    if (line.startsWith('### ')) {
      if (!currentPart) {
        currentPart = { title: '', color: PART_COLORS[parts.length % PART_COLORS.length], chapters: [] }
        parts.push(currentPart)
      }
      const heading = line.slice(4).trim()
      const match = heading.match(/^(\d+)\.\s*(.*)$/)
      autoChapterNumber += 1
      currentChapter = {
        number: match ? match[1].padStart(2, '0') : String(autoChapterNumber).padStart(2, '0'),
        title: match ? match[2] : heading,
        subtitle: null,
        cards: [],
        quote: null,
      }
      currentPart.chapters.push(currentChapter)
      expectSubtitle = true
      continue
    }

    if (!currentChapter) continue

    if (line.startsWith('> ')) {
      currentChapter.quote = line.slice(2).trim()
      expectSubtitle = false
      continue
    }

    if (line.startsWith('- ')) {
      const content = line.slice(2).trim()
      const colonIndex = content.indexOf(':')
      let heading: string | null = null
      let bodyRaw = content
      if (colonIndex > -1) {
        heading = content.slice(0, colonIndex).trim()
        bodyRaw = content.slice(colonIndex + 1).trim()
      }
      const body = bodyRaw.split('|').map((s) => s.trim()).filter(Boolean)
      currentChapter.cards.push({ heading, body })
      expectSubtitle = false
      continue
    }

    if (expectSubtitle) {
      currentChapter.subtitle = line
      expectSubtitle = false
    }
  }

  return parts.filter((p) => p.chapters.length > 0)
}

export const PART_STYLES: Record<string, { border: string; badge: string; label: string; quote: string }> = {
  rose:    { border: 'border-rose-200',    badge: 'bg-rose-50 text-rose-700',    label: 'text-rose-600',    quote: 'border-rose-300' },
  violet:  { border: 'border-violet-200',  badge: 'bg-violet-50 text-violet-700',  label: 'text-violet-600',  quote: 'border-violet-300' },
  teal:    { border: 'border-teal-200',    badge: 'bg-teal-50 text-teal-700',    label: 'text-teal-600',    quote: 'border-teal-300' },
  emerald: { border: 'border-emerald-200', badge: 'bg-emerald-50 text-emerald-700', label: 'text-emerald-600', quote: 'border-emerald-300' },
  amber:   { border: 'border-amber-200',   badge: 'bg-amber-50 text-amber-700',   label: 'text-amber-600',   quote: 'border-amber-300' },
  sky:     { border: 'border-sky-200',     badge: 'bg-sky-50 text-sky-700',     label: 'text-sky-600',     quote: 'border-sky-300' },
}