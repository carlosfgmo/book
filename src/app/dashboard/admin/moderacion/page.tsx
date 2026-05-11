import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ModerationToggle from './ModerationToggle'

export default async function ModeracionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('user').select('role').eq('id', user.id).single()
  if (!profile?.role?.includes('admin')) redirect('/')

  const admin = createAdminClient()
  const { data: comments } = await admin
    .from('comment')
    .select('id, content, rating, is_visible, created_at, user:user(full_name), book(title, slug)')
    .order('created_at', { ascending: false })
    .limit(50)

  const visible = comments?.filter((c) => c.is_visible) ?? []
  const hidden  = comments?.filter((c) => !c.is_visible) ?? []

  const renderList = (items: typeof comments, label: string) => (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-stone-100">
        <h2 className="font-semibold text-stone-800">{label} ({items?.length})</h2>
      </div>
      {!items?.length ? (
        <div className="p-6 text-center text-stone-400 text-sm">Sin comentarios.</div>
      ) : (
        <div className="divide-y divide-stone-50">
          {items?.map((c: any) => (
            <div key={c.id} className="px-5 py-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-stone-800">{c.user?.full_name}</span>
                  {c.rating && (
                    <span className="text-amber-400 text-xs">{'★'.repeat(c.rating)}</span>
                  )}
                  <span className="text-xs text-stone-400">en</span>
                  <span className="text-xs text-stone-600 font-medium">{c.book?.title}</span>
                </div>
                <p className="text-sm text-stone-600">{c.content}</p>
                <p className="text-xs text-stone-400 mt-1">
                  {new Date(c.created_at).toLocaleDateString('es-PE')}
                </p>
              </div>
              <ModerationToggle commentId={c.id} isVisible={c.is_visible} />
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Moderación de contenido</h1>
      {renderList(hidden, 'Ocultos / Por revisar')}
      {renderList(visible, 'Comentarios visibles')}
    </div>
  )
}
