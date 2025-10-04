import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const filters = {
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' || undefined,
      payment_status: searchParams.get('payment_status') as 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded' || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      customer_id: searchParams.get('customer_id') || undefined,
      sort_by: searchParams.get('sort_by') as 'order_date' | 'total_amount' | 'status' | 'customer_name' || 'order_date',
      sort_order: searchParams.get('sort_order') as 'asc' | 'desc' || 'desc',
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
      offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : 0,
    }

    // Build query
    let query = supabase
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
      `, { count: 'exact' })

    // Apply filters
    if (filters.search) {
      query = query.or(`order_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.payment_status) {
      query = query.eq('payment_status', filters.payment_status)
    }

    if (filters.date_from) {
      query = query.gte('order_date', filters.date_from)
    }

    if (filters.date_to) {
      query = query.lte('order_date', filters.date_to)
    }

    if (filters.customer_id) {
      query = query.eq('customer_id', filters.customer_id)
    }

    // Apply sorting
    query = query.order(filters.sort_by, { ascending: filters.sort_order === 'asc' })

    // Apply pagination
    query = query.range(filters.offset, filters.offset + filters.limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    // Calculate order statistics
    const totalOrders = count || 0
    const totalRevenue = data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0
    const pendingOrders = data?.filter(order => order.status === 'pending').length || 0
    const completedOrders = data?.filter(order => order.status === 'delivered').length || 0

    return NextResponse.json({
      orders: data || [],
      total: totalOrders,
      limit: filters.limit,
      offset: filters.offset,
      stats: {
        totalOrders,
        totalRevenue,
        pendingOrders,
        completedOrders
      }
    })

  } catch (error) {
    console.error('Orders API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
    
    // Validate required fields
    if (!body.customer_id && !body.customer_email) {
      return NextResponse.json({ error: 'Customer ID or email is required' }, { status: 400 })
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Order items are required' }, { status: 400 })
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Calculate totals
    const subtotal = body.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0)
    const taxAmount = body.tax_amount || 0
    const shippingAmount = body.shipping_amount || 0
    const discountAmount = body.discount_amount || 0
    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount

    // Create order
    const orderData = {
      order_number: orderNumber,
      customer_id: body.customer_id || null,
      customer_email: body.customer_email,
      customer_name: body.customer_name,
      status: body.status || 'pending',
      payment_status: body.payment_status || 'pending',
      payment_method: body.payment_method,
      subtotal,
      tax_amount: taxAmount,
      shipping_amount: shippingAmount,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      currency: body.currency || 'USD',
      shipping_address: body.shipping_address,
      billing_address: body.billing_address,
      notes: body.notes,
      order_date: new Date().toISOString()
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) {
      console.error('Database error:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Create order items
    const orderItems = body.items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id || null,
      product_name: item.product_name,
      product_sku: item.product_sku,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Database error:', itemsError)
      // Rollback order creation
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 })
    }

    // Update customer metrics
    if (body.customer_id) {
      await supabase.rpc('update_customer_metrics', {
        customer_id: body.customer_id,
        order_amount: totalAmount
      })
    }

    // Fetch complete order with items
    const { data: completeOrder, error: fetchError } = await supabase
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
      .eq('id', order.id)
      .single()

    if (fetchError) {
      console.error('Database error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch created order' }, { status: 500 })
    }

    return NextResponse.json(completeOrder, { status: 201 })

  } catch (error) {
    console.error('Orders API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
