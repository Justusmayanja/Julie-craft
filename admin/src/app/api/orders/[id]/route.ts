import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_name,
          product_sku,
          quantity,
          unit_price,
          total_price
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)

  } catch (error) {
    console.error('Order API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Check if order exists
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}
    
    if (body.status !== undefined) updateData.status = body.status
    if (body.payment_status !== undefined) updateData.payment_status = body.payment_status
    if (body.payment_method !== undefined) updateData.payment_method = body.payment_method
    if (body.shipping_address !== undefined) updateData.shipping_address = body.shipping_address
    if (body.billing_address !== undefined) updateData.billing_address = body.billing_address
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.tracking_number !== undefined) updateData.tracking_number = body.tracking_number

    // Handle status-specific updates
    if (body.status === 'shipped' && !existingOrder.shipped_date) {
      updateData.shipped_date = new Date().toISOString()
    }

    if (body.status === 'delivered' && !existingOrder.delivered_date) {
      updateData.delivered_date = new Date().toISOString()
    }

    // Update order
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        *,
        order_items (
          id,
          product_name,
          product_sku,
          quantity,
          unit_price,
          total_price
        )
      `)
      .single()

    if (updateError) {
      console.error('Database error:', updateError)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    return NextResponse.json(updatedOrder)

  } catch (error) {
    console.error('Order API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if order exists
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if order can be deleted (only pending orders)
    if (existingOrder.status !== 'pending') {
      return NextResponse.json({ error: 'Only pending orders can be deleted' }, { status: 400 })
    }

    // Delete order (order_items will be deleted automatically due to CASCADE)
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Database error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Order deleted successfully' })

  } catch (error) {
    console.error('Order API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
