import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Order update schema
const updateOrderSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded', 'partially_refunded']).optional(),
  fulfillment_status: z.enum(['unfulfilled', 'partially_fulfilled', 'fulfilled', 'shipped', 'delivered']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  tracking_number: z.string().optional(),
  processing_notes: z.string().optional(),
  notes: z.string().optional(),
  version: z.number().int().min(1) // For optimistic locking
})

export async function GET(
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

    // Fetch complete order with all relationships
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          id,
          product_id,
          product_name,
          product_sku,
          quantity,
          unit_price,
          total_price
        ),
        order_status_history(
          id,
          previous_status,
          new_status,
          previous_payment_status,
          new_payment_status,
          changed_by,
          change_reason,
          notes,
          created_at
        ),
        order_notes(
          id,
          note_type,
          content,
          is_internal,
          created_by,
          created_at
        ),
        order_tasks(
          id,
          task_type,
          title,
          description,
          assigned_to,
          status,
          priority,
          due_date,
          completed_at,
          completion_notes,
          created_at,
          updated_at
        ),
        order_item_reservations(
          id,
          order_item_id,
          product_id,
          reserved_quantity,
          reserved_at,
          released_at,
          status
        ),
        order_fulfillment(
          id,
          order_item_id,
          product_id,
          fulfilled_quantity,
          fulfillment_date,
          fulfilled_by,
          fulfillment_method,
          notes
        )
      `)
      .eq('id', id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })

  } catch (error: any) {
    console.error('Enhanced order GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(
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

    const body = await request.json()
    const validatedData = updateOrderSchema.parse(body)

    // Get current order for optimistic locking and status checks
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('version, shipped_date, delivered_date, fulfilled_at')
      .eq('id', id)
      .single()

    if (fetchError || !currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check version for optimistic locking
    if (validatedData.version && validatedData.version !== currentOrder.version) {
      return NextResponse.json({
        error: 'Order has been modified by another user. Please refresh and try again.',
        currentVersion: currentOrder.version,
        providedVersion: validatedData.version
      }, { status: 409 })
    }

    // Prepare update data
    const updateData: any = {}
    
    if (validatedData.status !== undefined) updateData.status = validatedData.status
    if (validatedData.payment_status !== undefined) updateData.payment_status = validatedData.payment_status
    if (validatedData.fulfillment_status !== undefined) updateData.fulfillment_status = validatedData.fulfillment_status
    if (validatedData.priority !== undefined) updateData.priority = validatedData.priority
    if (validatedData.tracking_number !== undefined) updateData.tracking_number = validatedData.tracking_number
    if (validatedData.processing_notes !== undefined) updateData.processing_notes = validatedData.processing_notes
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes

    // Handle status-specific updates
    if (validatedData.status === 'shipped' && !currentOrder.shipped_date) {
      updateData.shipped_date = new Date().toISOString()
    }

    if (validatedData.status === 'delivered' && !currentOrder.delivered_date) {
      updateData.delivered_date = new Date().toISOString()
    }

    if (validatedData.fulfillment_status === 'fulfilled' && !currentOrder.fulfilled_at) {
      updateData.fulfilled_at = new Date().toISOString()
    }

    // Update order
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to update order: ${updateError.message}`)
    }

    // Fetch complete updated order
    const { data: completeOrder, error: fetchCompleteError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          id,
          product_id,
          product_name,
          product_sku,
          quantity,
          unit_price,
          total_price
        ),
        order_status_history(
          id,
          previous_status,
          new_status,
          previous_payment_status,
          new_payment_status,
          changed_by,
          change_reason,
          notes,
          created_at
        ),
        order_tasks(
          id,
          task_type,
          title,
          description,
          assigned_to,
          status,
          priority,
          due_date,
          completed_at,
          completion_notes,
          created_at,
          updated_at
        )
      `)
      .eq('id', id)
      .single()

    if (fetchCompleteError) {
      console.warn('Failed to fetch complete order after update:', fetchCompleteError.message)
    }

    return NextResponse.json({
      success: true,
      order: completeOrder || updatedOrder,
      message: 'Order updated successfully'
    })

  } catch (error: any) {
    console.error('Enhanced order update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
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
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, status, inventory_reserved')
      .eq('id', id)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Only allow deletion of pending orders
    if (order.status !== 'pending') {
      return NextResponse.json({
        error: 'Only pending orders can be deleted'
      }, { status: 400 })
    }

    // Release inventory if reserved
    if (order.inventory_reserved) {
      const { error: releaseError } = await supabase.rpc('release_order_inventory', {
        order_uuid: id
      })

      if (releaseError) {
        console.warn('Failed to release inventory:', releaseError.message)
      }
    }

    // Delete order (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw new Error(`Failed to delete order: ${deleteError.message}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    })

  } catch (error: any) {
    console.error('Enhanced order delete error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
