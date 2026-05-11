import { createClient } from '@/lib/supabase/server'
import BookCard from '@/components/catalogo/BookCard'
import SortSelect from '@/components/catalogo/SortSelect'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const revalidate = 60

const sectionIcons: Record<string, string> = {
  nuevas:      '✦',
  bestsellers: '★',
  preventa:    '◈',
  generos:     '❧',
}

const categoryIcons: Record<string, string> = {
  'novela':         '📖',
  'poesía':         '🪶',
  'cuento':         '📜',
  'ensayo':         '✍️',
  'infantil':       '🎨',
  'ciencia ficción':'🚀',
  'thriller':       '🔪',
  'romance':        '💗',
  'historia':       '🏛️',
  'autoayuda':      '🌱',
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; buscar?: string; seccion?: string; orden?: string; precio_max?: string }>
}) {
  const { categoria, buscar, seccion, orden, precio_max } = await searchParams

  // Página raíz sin filtros → mostrar Nuevas llegadas por defecto
  if (!seccion && !categoria && !buscar) redirect('/?seccion=nuevas')

  const supabase = await createClient()

  function buildBooksQuery(withSortOrder: boolean) {
    let q = supabase
      .from('book')
      .select('*, author:user(full_name), category(name, slug)')
      .in('status', ['published', 'presale'])

    if (categoria)  q = q.eq('category.slug', categoria)
    if (buscar)     q = q.ilike('title', `%${buscar}%`)
    if (precio_max) q = q.lte('price', Number(precio_max))
    if (seccion === 'preventa') q = q.eq('status', 'presale')

    if (!orden) {
      if (withSortOrder) q = q.order('sort_order', { ascending: true })
      q = q.order('created_at', { ascending: false })
    }
    if (orden === 'precio_asc')  q = q.order('price', { ascending: true })
    if (orden === 'precio_desc') q = q.order('price', { ascending: false })
    if (orden === 'titulo')      q = q.order('title', { ascending: true })

    return q
  }

  const [{ data: categories }, primaryBooks] = await Promise.all([
    supabase.from('category').select('id, name, slug').is('parent_id', null).order('name'),
    buildBooksQuery(true),
  ])

  // If sort_order column doesn't exist yet, fall back to created_at only
  const allBooks = primaryBooks.data ?? (
    primaryBooks.error
      ? (await buildBooksQuery(false)).data ?? []
      : []
  )

  // Split into groups when no specific section / category / search filter active
  const showGroups = !seccion && !categoria && !buscar
  const nuevas      = allBooks.filter(b => b.status === 'published').slice(0, 8)
  const presale     = allBooks.filter(b => b.status === 'presale').slice(0, 4)
  const byCategory  = (categories ?? []).map(cat => ({
    cat,
    books: allBooks.filter(b => (b.category as any)?.slug === cat.slug).slice(0, 4),
  })).filter(g => g.books.length > 0)

  const sectionTitle =
    seccion === 'nuevas'      ? 'Nuevas llegadas'  :
    seccion === 'bestsellers' ? 'Best Sellers'      :
    seccion === 'preventa'    ? 'Pre ventas'        :
    seccion === 'generos'     ? 'Por géneros'       :
    buscar                    ? `Búsqueda: "${buscar}"` :
    categoria                 ? (categories?.find(c => c.slug === categoria)?.name ?? 'Categoría') :
    null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex gap-8">

        {/* ── Sidebar ─────────────────────────────── */}
        <aside className="hidden lg:flex flex-col gap-8 w-56 shrink-0">

          {/* Secciones */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3"
            >
              Explorar
            </h3>
            <nav className="flex flex-col gap-0.5">
              {[
                { href: '/?seccion=nuevas',      label: 'Nuevas llegadas',  icon: sectionIcons.nuevas },
                { href: '/?seccion=bestsellers', label: 'Best Sellers',     icon: sectionIcons.bestsellers },
                { href: '/?seccion=preventa',    label: 'Pre ventas',       icon: sectionIcons.preventa },
                { href: '/?seccion=generos',     label: 'Por géneros',      icon: sectionIcons.generos },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    seccion && item.href.includes(seccion)
                      ? 'bg-stone-900 text-white font-medium'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Categorías */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3"
            >
              Géneros
            </h3>
            <nav className="flex flex-col gap-0.5">
              <Link
                href="/"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  !categoria && !seccion && !buscar
                    ? 'bg-stone-100 text-stone-900 font-medium'
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                Todos los géneros
              </Link>
              {categories?.map(cat => {
                const icon = categoryIcons[cat.name.toLowerCase()] ?? '📚'
                return (
                  <Link
                    key={cat.id}
                    href={`/?categoria=${cat.slug}`}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      categoria === cat.slug
                        ? 'bg-stone-900 text-white font-medium'
                        : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <span>{icon}</span>
                    {cat.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Precio */}
          <div>
            <h3
              className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3"
            >
              Precio máximo
            </h3>
            <form className="flex flex-col gap-2">
              {seccion    && <input type="hidden" name="seccion"   value={seccion} />}
              {categoria  && <input type="hidden" name="categoria" value={categoria} />}
              {buscar     && <input type="hidden" name="buscar"    value={buscar} />}
              <div className="flex items-center gap-2">
                <span className="text-sm text-stone-500">S/</span>
                <input
                  name="precio_max"
                  type="number"
                  min="0"
                  step="5"
                  defaultValue={precio_max ?? ''}
                  placeholder="Sin límite"
                  className="w-full px-2 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 text-xs bg-stone-900 text-white rounded-lg hover:bg-stone-700 transition-colors"
              >
                Aplicar
              </button>
              {precio_max && (
                <Link
                  href={seccion ? `/?seccion=${seccion}` : categoria ? `/?categoria=${categoria}` : '/'}
                  className="text-xs text-stone-400 hover:text-stone-600 text-center"
                >
                  Quitar filtro
                </Link>
              )}
            </form>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Hero banner (only on home) */}
          {!seccion && !categoria && !buscar && (
            <div
              className="relative rounded-2xl overflow-hidden mb-10 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-700 text-white px-8 py-10 flex flex-col justify-end min-h-[200px]"
            >
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
              />
              <p className="text-stone-300 text-sm uppercase tracking-widest mb-2">Literatura independiente del Perú</p>
              <h2
                className="text-3xl sm:text-4xl font-bold leading-snug"
                >
                Descubre voces<br />que inspiran
              </h2>
              <p className="text-stone-300 mt-3 max-w-md text-sm">
                Apoya a escritores independientes peruanos. Cada compra financia una nueva historia.
              </p>
            </div>
          )}

          {/* Section header + sort bar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              {sectionTitle ? (
                <h2
                  className="text-xl font-bold text-stone-900"
                    >
                  {sectionTitle}
                </h2>
              ) : (
                <h2
                  className="text-xl font-bold text-stone-900"
                    >
                  Catálogo
                </h2>
              )}
              <p className="text-stone-400 text-xs mt-0.5">{allBooks.length} título{allBooks.length !== 1 ? 's' : ''}</p>
            </div>
            <SortSelect
              current={orden}
              hiddenFields={{
                ...(seccion    ? { seccion }    : {}),
                ...(categoria  ? { categoria }  : {}),
                ...(buscar     ? { buscar }     : {}),
                ...(precio_max ? { precio_max } : {}),
              }}
            />
          </div>

          {/* Grouped view */}
          {showGroups ? (
            <div className="space-y-12">

              {/* Nuevas llegadas */}
              {nuevas.length > 0 && (
                <section>
                  <div className="flex items-baseline justify-between mb-4">
                    <h3
                      className="text-lg font-semibold text-stone-900"
                            >
                      ✦ Nuevas llegadas
                    </h3>
                    <Link href="/?seccion=nuevas" className="text-xs text-stone-400 hover:text-stone-700 transition-colors">
                      Ver todas →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {nuevas.map((book, i) => <BookCard key={book.id} book={book as any} priority={i < 2} />)}
                  </div>
                </section>
              )}

              {/* Pre-ventas */}
              {presale.length > 0 && (
                <section>
                  <div className="flex items-baseline justify-between mb-4">
                    <h3
                      className="text-lg font-semibold text-stone-900"
                            >
                      ◈ Pre ventas
                    </h3>
                    <Link href="/?seccion=preventa" className="text-xs text-stone-400 hover:text-stone-700 transition-colors">
                      Ver todas →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {presale.map(book => <BookCard key={book.id} book={book as any} />)}
                  </div>
                </section>
              )}

              {/* Por géneros */}
              {byCategory.map(({ cat, books: catBooks }) => (
                <section key={cat.id}>
                  <div className="flex items-baseline justify-between mb-4">
                    <h3
                      className="text-lg font-semibold text-stone-900"
                            >
                      {categoryIcons[cat.name.toLowerCase()] ?? '📚'} {cat.name}
                    </h3>
                    <Link href={`/?categoria=${cat.slug}`} className="text-xs text-stone-400 hover:text-stone-700 transition-colors">
                      Ver todos →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {catBooks.map(book => <BookCard key={book.id} book={book as any} />)}
                  </div>
                </section>
              ))}

              {allBooks.length === 0 && (
                <div className="text-center py-20 text-stone-400">
                  <p className="text-5xl mb-4">📭</p>
                  <p className="text-lg">El catálogo está vacío por ahora.</p>
                  <p className="text-sm mt-1">¡Pronto habrá nuevos títulos!</p>
                </div>
              )}
            </div>
          ) : (
            /* Flat filtered grid */
            <>
              {allBooks.length === 0 ? (
                <div className="text-center py-20 text-stone-400">
                  <p className="text-5xl mb-4">🔍</p>
                  <p className="text-lg">No se encontraron libros</p>
                  <Link href="/" className="inline-block mt-4 text-sm text-stone-600 underline hover:text-stone-900">
                    Ver todo el catálogo
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {allBooks.map((book, i) => <BookCard key={book.id} book={book as any} priority={i < 2} />)}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
