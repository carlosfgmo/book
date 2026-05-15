'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const VALID_ROLES = ['reader', 'writer', 'admin'] as const

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: profile } = await supabase
    .from('user')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile?.role?.includes('admin')) throw new Error('No autorizado')
  return user
}

export async function verifyPayment(paymentId: string, orderId: string, approved: boolean) {
  const user = await requireAdmin()
  const admin = createAdminClient()

  await admin
    .from('payment')
    .update({
      status: approved ? 'verified' : 'rejected',
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    })
    .eq('id', paymentId)

  if (approved) {
    await admin
      .from('order_item')
      .update({ delivery_status: 'processing' })
      .eq('order_id', orderId)

    await admin
      .from('order')
      .update({ status: 'processing' })
      .eq('id', orderId)
  } else {
    await admin
      .from('order')
      .update({ status: 'pending' })
      .eq('id', orderId)
  }

  revalidatePath('/dashboard/admin/pagos')
}

export async function toggleCommentVisibility(commentId: string, visible: boolean) {
  await requireAdmin()
  const admin = createAdminClient()
  await admin.from('comment').update({ is_visible: visible }).eq('id', commentId)
  revalidatePath('/dashboard/admin/moderacion')
}

export async function markWriterLiquidated(paymentIds: string[]) {
  await requireAdmin()
  if (!paymentIds.length) return

  const admin = createAdminClient()
  await admin
    .from('payment')
    .update({ writer_paid: true, writer_paid_at: new Date().toISOString() })
    .in('id', paymentIds)
    .eq('status', 'verified')
    .eq('writer_paid', false)

  revalidatePath('/dashboard/admin/liquidaciones')
}

export async function setUserRole(userId: string, role: string, add: boolean) {
  await requireAdmin()

  if (!VALID_ROLES.includes(role as typeof VALID_ROLES[number])) {
    throw new Error('Rol inválido')
  }

  const admin = createAdminClient()
  const { data: target } = await admin.from('user').select('role').eq('id', userId).single()
  if (!target) return

  const roles: string[] = target.role ?? []
  const updated = add
    ? [...new Set([...roles, role])]
    : roles.filter((r: string) => r !== role)

  await admin.from('user').update({ role: updated }).eq('id', userId)
  revalidatePath('/dashboard/admin')
}
