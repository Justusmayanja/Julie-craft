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

    // Check if already reserved
    if (order.inventory_reserved) {
      return NextResponse.json({
        success: true,
        message: 'Inventory already reserved for this order'
      })
    }

    // Only allow reservation for pending or processing orders
    if (!['pending', 'processing'].includes(order.status)) {
      return NextResponse.json({
        error: 'Can only reserve inventory for pending or processing orders'
      }, { status: 400 })
    }

    // Reserve inventory using the database function
    const { data: reservationResult, error: reservationError } = await supabase.rpc('reserve_order_inventory', {
      order_uuid: id
    })

    if (reservationError) {
      throw new Error(`Failed to reserve inventory: ${reservationError.message}`)
    }

    if (!reservationResult?.success) {
      return NextResponse.json({
        error: reservationResult?.error || 'Failed to reserve inventory',
        details: reservationResult?.details
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
        change_reason: 'Inventory reserved'
      })

    if (historyError) {
      console.warn('Failed to log status history:', historyError.message)
    }

    return NextResponse.json({
      success: true,
      message: 'Inventory reserved successfully',
      details: reservationResult.details
    })

  } catch (error: any) {
    console.error('Reserve inventory error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
