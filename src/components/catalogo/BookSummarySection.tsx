import { parseBookSummary, PART_STYLES } from '@/lib/bookSummary'

export default function BookSummarySection({ raw }: { raw: string | null | undefined }) {
  if (!raw?.trim()) return null

  const parts = parseBookSummary(raw)
  if (parts.length === 0) return null

  return (
    <div className="mt-10 space-y-10">
      <h3 className="text-stone-700 font-semibold text-lg">Resumen del libro</h3>

      {parts.map((part, i) => {
        const style = PART_STYLES[part.color] ?? PART_STYLES.rose
        return (
          <div key={i} className="space-y-5">
            {part.title && (
              <p className={`text-xs font-semibold uppercase tracking-wide ${style.label}`}>
                Parte {i + 1} · {part.title}
              </p>
            )}

            {part.chapters.map((chapter, j) => (
              <div key={j} className={`rounded-2xl border ${style.border} bg-white p-5`}>
                <div className="flex items-start gap-3">
                  <span className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${style.badge}`}>
                    {chapter.number}
                  </span>
                  <div>
                    <h4 className="font-semibold text-stone-900">{chapter.title}</h4>
                    {chapter.subtitle && (
                      <p className="text-sm text-stone-500 italic mt-0.5">{chapter.subtitle}</p>
                    )}
                  </div>
                </div>

                {chapter.cards.length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-3 mt-4">
                    {chapter.cards.map((card, k) => (
                      <div key={k} className="bg-stone-50 rounded-xl p-3">
                        {card.heading && (
                          <p className="text-sm font-medium text-stone-700 mb-1">{card.heading}</p>
                        )}
                        {card.body.map((line, m) => (
                          <p key={m} className="text-sm text-stone-600 leading-relaxed">{line}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {chapter.quote && (
                  <blockquote className={`mt-4 border-l-4 ${style.quote} pl-4 text-stone-600 italic text-sm`}>
                    {chapter.quote}
                  </blockquote>
                )}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}