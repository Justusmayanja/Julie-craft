import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Enhanced order creation schema
const createOrderSchema = z.object({
  customer_id: z.string().uuid().optional(),
  customer_email: z.string().email(),
  customer_name: z.string().min(1),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().min(1),
    unit_price: z.number().min(0)
  })).min(1),
  payment_method: z.string().optional(),
  shipping_address: z.object({
    name: z.string(),
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    country: z.string().default('Uganda')
  }),
  billing_address: z.object({
    name: z.string(),
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    country: z.string().default('Uganda')
  }).optional(),
  tax_amount: z.number().min(0).default(0),
  shipping_amount: z.number().min(0).default(0),
  discount_amount: z.number().min(0).default(0),
  currency: z.string().default('UGX'),
  notes: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  source: z.enum(['web', 'phone', 'email', 'walk_in', 'marketplace', 'admin']).default('admin'),
  reserve_inventory: z.boolean().default(true)
})

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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const payment_status = searchParams.get('payment_status')
    const fulfillment_status = searchParams.get('fulfillment_status')
    const priority = searchParams.get('priority')
    const source = searchParams.get('source')
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')
    const sort_by = searchParams.get('sort_by') || 'order_date'
    const sort_order = searchParams.get('sort_order') || 'desc'

    // Build query
    let query = supabase
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
          change_reason,
          created_at
        ),
        order_notes(
          id,
          note_type,
          content,
          is_internal,
          created_at
        ),
        order_tasks(
          id,
          task_type,
          title,
          status,
          priority,
          due_date,
          assigned_to
        )
      `)

    // Apply filters
    if (search) {
      query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`)
    }
    if (status) query = query.eq('status', status)
    if (payment_status) query = query.eq('payment_status', payment_status)
    if (fulfillment_status) query = query.eq('fulfillment_status', fulfillment_status)
    if (priority) query = query.eq('priority', priority)
    if (source) query = query.eq('source', source)
    if (date_from) query = query.gte('order_date', date_from)
    if (date_to) query = query.lte('order_date', date_to)

    // Apply sorting and pagination
    query = query.order(sort_by, { ascending: sort_order === 'asc' })
    query = query.range(offset, offset + limit - 1)

    const { data: orders, error: ordersError } = await query

    if (ordersError) {
      throw new Error(`Failed to fetch orders: ${ordersError.message}`)
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      throw new Error(`Failed to count orders: ${countError.message}`)
    }

    // Get order statistics
    const { data: stats, error: statsError } = await supabase
      .from('orders')
      .select('status, payment_status, fulfillment_status, total_amount, priority')

    if (statsError) {
      throw new Error(`Failed to fetch order statistics: ${statsError.message}`)
    }

    const orderStats = {
      totalOrders: count || 0,
      totalRevenue: stats?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0,
      pendingOrders: stats?.filter(o => o.status === 'pending').length || 0,
      processingOrders: stats?.filter(o => o.status === 'processing').length || 0,
      shippedOrders: stats?.filter(o => o.status === 'shipped').length || 0,
      deliveredOrders: stats?.filter(o => o.status === 'delivered').length || 0,
      cancelledOrders: stats?.filter(o => o.status === 'cancelled').length || 0,
      paidOrders: stats?.filter(o => o.payment_status === 'paid').length || 0,
      unfulfilledOrders: stats?.filter(o => o.fulfillment_status === 'unfulfilled').length || 0,
      urgentOrders: stats?.filter(o => o.priority === 'urgent').length || 0
    }

    return NextResponse.json({
      orders: orders || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      stats: orderStats
    })

  } catch (error: any) {
    console.error('Enhanced orders GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createOrderSchema.parse(body)

    // Start transaction
    const { data: orderData, error: orderError } = await supabase.rpc('exec', {
      sql: 'BEGIN;'
    })

    if (orderError) {
      throw new Error('Failed to start transaction')
    }

    // Generate order number
    const orderNumber = `JC-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Calculate totals
    const subtotal = validatedData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    const totalAmount = subtotal + validatedData.tax_amount + validatedData.shipping_amount - validatedData.discount_amount

    // Create order
    const { data: order, error: createOrderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: validatedData.customer_id || null,
        customer_email: validatedData.customer_email,
        customer_name: validatedData.customer_name,
        status: 'pending',
        payment_status: 'pending',
        fulfillment_status: 'unfulfilled',
        payment_method: validatedData.payment_method,
        subtotal,
        tax_amount: validatedData.tax_amount,
        shipping_amount: validatedData.shipping_amount,
        discount_amount: validatedData.discount_amount,
        total_amount: totalAmount,
        currency: validatedData.currency,
        shipping_address: validatedData.shipping_address,
        billing_address: validatedData.billing_address || validatedData.shipping_address,
        notes: validatedData.notes,
        priority: validatedData.priority,
        source: validatedData.source,
        order_date: new Date().toISOString()
      })
      .select()
      .single()

    if (createOrderError) {
      await supabase.rpc('exec', { sql: 'ROLLBACK;' })
      throw new Error(`Failed to create order: ${createOrderError.message}`)
    }

    // Create order items
    const orderItems = validatedData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      await supabase.rpc('exec', { sql: 'ROLLBACK;' })
      throw new Error(`Failed to create order items: ${itemsError.message}`)
    }

    // Reserve inventory if requested
    if (validatedData.reserve_inventory) {
      const { data: reservationResult, error: reservationError } = await supabase.rpc('reserve_order_inventory', {
        order_uuid: order.id
      })

      if (reservationError) {
        await supabase.rpc('exec', { sql: 'ROLLBACK;' })
        throw new Error(`Failed to reserve inventory: ${reservationError.message}`)
      }

      if (!reservationResult?.success) {
        await supabase.rpc('exec', { sql: 'ROLLBACK;' })
        return NextResponse.json({
          error: 'Insufficient inventory',
          details: reservationResult?.details
        }, { status: 400 })
      }
    }

    // Create initial status history entry
    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert({
        order_id: order.id,
        new_status: 'pending',
        new_payment_status: 'pending',
        changed_by: user.id,
        change_reason: 'Order created'
      })

    if (historyError) {
      console.warn('Failed to create status history:', historyError.message)
    }

    // Create default tasks
    const defaultTasks = [
      {
        order_id: order.id,
        task_type: 'inventory_check',
        title: 'Verify inventory availability',
        description: 'Check that all items are available and reserved',
        status: validatedData.reserve_inventory ? 'completed' : 'pending',
        priority: validatedData.priority
      },
      {
        order_id: order.id,
        task_type: 'payment_verification',
        title: 'Verify payment',
        description: 'Confirm payment has been received',
        status: 'pending',
        priority: validatedData.priority
      },
      {
        order_id: order.id,
        task_type: 'shipping_preparation',
        title: 'Prepare for shipping',
        description: 'Package items and prepare shipping labels',
        status: 'pending',
        priority: validatedData.priority
      }
    ]

    const { error: tasksError } = await supabase
      .from('order_tasks')
      .insert(defaultTasks)

    if (tasksError) {
      console.warn('Failed to create default tasks:', tasksError.message)
    }

    // Commit transaction
    await supabase.rpc('exec', { sql: 'COMMIT;' })

    // Fetch complete order with relationships
    const { data: completeOrder, error: fetchError } = await supabase
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
          change_reason,
          created_at
        ),
        order_tasks(
          id,
          task_type,
          title,
          status,
          priority,
          due_date
        )
      `)
      .eq('id', order.id)
      .single()

    if (fetchError) {
      console.warn('Failed to fetch complete order:', fetchError.message)
    }

    return NextResponse.json({
      success: true,
      order: completeOrder || order,
      message: 'Order created successfully'
    })

  } catch (error: any) {
    console.error('Enhanced order creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
