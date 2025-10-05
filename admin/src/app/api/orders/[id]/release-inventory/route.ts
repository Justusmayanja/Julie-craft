import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if order exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, inventory_reserved')
      .eq('id', id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if inventory is reserved
    if (!order.inventory_reserved) {
      return NextResponse.json({
        success: true,
        message: 'No inventory reserved for this order'
      })
    }

    // Release inventory using the database function
    const { data: releaseResult, error: releaseError } = await supabase.rpc('release_order_inventory', {
      order_uuid: id
    })

    if (releaseError) {
      throw new Error(`Failed to release inventory: ${releaseError.message}`)
    }

    if (!releaseResult?.success) {
      return NextResponse.json({
        error: releaseResult?.error || 'Failed to release inventory'
      }, { status: 400 })
    }

    // Log the action
    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert({
        order_id: id,
        new_status: order.status,
        new_payment_status: 'pending', // Keep current payment status
        changed_by: user.id,
        change_reason: 'Inventory reservations released'
      })

    if (historyError) {
      console.warn('Failed to log status history:', historyError.message)
    }

    return NextResponse.json({
      success: true,
      message: 'Inventory reservations released successfully'
    })

  } catch (error: any) {
    console.error('Release inventory error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
