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
    const timeRange = searchParams.get('timeRange') || '30days'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculate date range
    let dateFrom: Date
    let dateTo: Date = new Date()

    if (startDate && endDate) {
      dateFrom = new Date(startDate)
      dateTo = new Date(endDate)
    } else {
      switch (timeRange) {
        case '7days':
          dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30days':
          dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          break
        case '3months':
          dateFrom = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          break
        case '6months':
          dateFrom = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
          break
        case '1year':
          dateFrom = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
          break
        default:
          dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    }

    // Get order statistics
    const [
      totalOrdersResult,
      totalRevenueResult,
      statusBreakdownResult,
      paymentStatusBreakdownResult,
      recentOrdersResult,
      topCustomersResult
    ] = await Promise.all([
      // Total orders count
      supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .gte('order_date', dateFrom.toISOString())
        .lte('order_date', dateTo.toISOString()),

      // Total revenue
      supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'delivered')
        .gte('order_date', dateFrom.toISOString())
        .lte('order_date', dateTo.toISOString()),

      // Status breakdown
      supabase
        .from('orders')
        .select('status')
        .gte('order_date', dateFrom.toISOString())
        .lte('order_date', dateTo.toISOString()),

      // Payment status breakdown
      supabase
        .from('orders')
        .select('payment_status')
        .gte('order_date', dateFrom.toISOString())
        .lte('order_date', dateTo.toISOString()),

      // Recent orders
      supabase
        .from('orders')
        .select(`
          id,
          order_number,
          customer_name,
          customer_email,
          total_amount,
          status,
          payment_status,
          order_date
        `)
        .gte('order_date', dateFrom.toISOString())
        .lte('order_date', dateTo.toISOString())
        .order('order_date', { ascending: false })
        .limit(10),

      // Top customers by order value
      supabase
        .from('orders')
        .select('customer_id, customer_name, customer_email, total_amount')
        .eq('status', 'delivered')
        .gte('order_date', dateFrom.toISOString())
        .lte('order_date', dateTo.toISOString())
    ])

    // Calculate total revenue
    const totalRevenue = totalRevenueResult.data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0

    // Calculate status breakdown
    const statusCounts = new Map<string, number>()
    statusBreakdownResult.data?.forEach(order => {
      statusCounts.set(order.status, (statusCounts.get(order.status) || 0) + 1)
    })

    const statusBreakdown = Array.from(statusCounts.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: totalOrdersResult.count ? (count / totalOrdersResult.count) * 100 : 0
    }))

    // Calculate payment status breakdown
    const paymentStatusCounts = new Map<string, number>()
    paymentStatusBreakdownResult.data?.forEach(order => {
      paymentStatusCounts.set(order.payment_status, (paymentStatusCounts.get(order.payment_status) || 0) + 1)
    })

    const paymentStatusBreakdown = Array.from(paymentStatusCounts.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: totalOrdersResult.count ? (count / totalOrdersResult.count) * 100 : 0
    }))

    // Calculate top customers
    const customerTotals = new Map<string, { name: string; email: string; total: number; orders: number }>()
    topCustomersResult.data?.forEach(order => {
      const key = order.customer_id || order.customer_email
      if (customerTotals.has(key)) {
        const existing = customerTotals.get(key)!
        existing.total += Number(order.total_amount)
        existing.orders += 1
      } else {
        customerTotals.set(key, {
          name: order.customer_name || 'Unknown',
          email: order.customer_email || '',
          total: Number(order.total_amount),
          orders: 1
        })
      }
    })

    const topCustomers = Array.from(customerTotals.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    // Calculate average order value
    const avgOrderValue = totalOrdersResult.count ? totalRevenue / totalOrdersResult.count : 0

    // Calculate pending orders
    const pendingOrders = statusCounts.get('pending') || 0
    const completedOrders = statusCounts.get('delivered') || 0

    const stats = {
      totalOrders: totalOrdersResult.count || 0,
      totalRevenue,
      avgOrderValue,
      pendingOrders,
      completedOrders,
      statusBreakdown,
      paymentStatusBreakdown,
      recentOrders: recentOrdersResult.data || [],
      topCustomers,
      timeRange: {
        from: dateFrom.toISOString(),
        to: dateTo.toISOString(),
        period: timeRange
      }
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Orders stats API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
