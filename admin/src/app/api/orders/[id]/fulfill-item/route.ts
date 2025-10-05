import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const fulfillItemSchema = z.object({
  order_item_id: z.string().uuid(),
  fulfilled_quantity: z.number().int().min(1),
  fulfillment_method: z.enum(['manual', 'automated']).default('manual'),
  notes: z.string().optional()
})

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

    const body = await request.json()
    const validatedData = fulfillItemSchema.parse(body)

    // Check if order exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, fulfillment_status')
      .eq('id', id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Only allow fulfillment for processing orders
    if (!['processing', 'shipped'].includes(order.status)) {
      return NextResponse.json({
        error: 'Can only fulfill items for processing or shipped orders'
      }, { status: 400 })
    }

    // Fulfill order item using the database function
    const { data: fulfillResult, error: fulfillError } = await supabase.rpc('fulfill_order_item', {
      order_uuid: id,
      item_uuid: validatedData.order_item_id,
      fulfilled_qty: validatedData.fulfilled_quantity,
      fulfilled_by_user: user.id
    })

    if (fulfillError) {
      throw new Error(`Failed to fulfill order item: ${fulfillError.message}`)
    }

    if (!fulfillResult?.success) {
      return NextResponse.json({
        error: fulfillResult?.error || 'Failed to fulfill order item'
      }, { status: 400 })
    }

    // Update inventory - decrement physical stock
    const { data: orderItem, error: itemError } = await supabase
      .from('order_items')
      .select('product_id')
      .eq('id', validatedData.order_item_id)
      .eq('order_id', id)
      .single()

    if (itemError || !orderItem) {
      console.warn('Failed to fetch order item for inventory update:', itemError?.message)
    } else {
      // Update product physical stock
      const { error: stockError } = await supabase.rpc('exec', {
        sql: `
          UPDATE products 
          SET 
            physical_stock = GREATEST(0, physical_stock - $1),
            last_stock_update = NOW(),
            version = version + 1
          WHERE id = $2
        `,
        params: [validatedData.fulfilled_quantity, orderItem.product_id]
      })

      if (stockError) {
        console.warn('Failed to update product stock:', stockError.message)
      }
    }

    // Check if order is fully fulfilled and update status
    const { data: fulfillmentSummary, error: summaryError } = await supabase
      .from('order_fulfillment')
      .select(`
        order_item_id,
        fulfilled_quantity,
        order_items!inner(quantity)
      `)
      .eq('order_id', id)

    if (!summaryError && fulfillmentSummary) {
      // Calculate fulfillment status for each item
      const itemFulfillment = fulfillmentSummary.reduce((acc: any, fulfillment: any) => {
        const itemId = fulfillment.order_item_id
        if (!acc[itemId]) {
          acc[itemId] = {
            total_quantity: fulfillment.order_items.quantity,
            fulfilled_quantity: 0
          }
        }
        acc[itemId].fulfilled_quantity += fulfillment.fulfilled_quantity
        return acc
      }, {})

      const allItemsFulfilled = Object.values(itemFulfillment).every((item: any) => 
        item.fulfilled_quantity >= item.total_quantity
      )

      if (allItemsFulfilled) {
        // Update order fulfillment status
        await supabase
          .from('orders')
          .update({
            fulfillment_status: 'fulfilled',
            fulfilled_at: new Date().toISOString()
          })
          .eq('id', id)

        // Log the status change
        await supabase
          .from('order_status_history')
          .insert({
            order_id: id,
            new_status: order.status,
            new_payment_status: 'pending',
            changed_by: user.id,
            change_reason: 'Order fully fulfilled'
          })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order item fulfilled successfully',
      details: fulfillResult
    })

  } catch (error: any) {
    console.error('Fulfill item error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
