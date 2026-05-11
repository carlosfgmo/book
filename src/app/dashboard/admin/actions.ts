'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function verifyPayment(paymentId: string, orderId: string, approved: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

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
    // Activar entrega de ítems
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
  const admin = createAdminClient()
  await admin.from('comment').update({ is_visible: visible }).eq('id', commentId)
  revalidatePath('/dashboard/admin/moderacion')
}

export async function setUserRole(userId: string, role: string, add: boolean) {
  const admin = createAdminClient()
  const { data: user } = await admin.from('user').select('role').eq('id', userId).single()
  if (!user) return

  const roles: string[] = user.role ?? []
  const updated = add
    ? [...new Set([...roles, role])]
    : roles.filter((r: string) => r !== role)

  await admin.from('user').update({ role: updated }).eq('id', userId)
  revalidatePath('/dashboard/admin')
}
