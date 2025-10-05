import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schemas
const updateAlertSchema = z.object({
  alert_id: z.string().uuid(),
  alert_status: z.enum(['acknowledged', 'resolved', 'dismissed']),
  notes: z.string().optional()
})

// GET - Retrieve reorder alerts
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('product_id')
    const alertType = searchParams.get('alert_type')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('reorder_alerts')
      .select(`
        id, product_id, alert_type, current_stock, reorder_point,
        suggested_reorder_quantity, alert_status,
        triggered_at, acknowledged_by, acknowledged_at,
        resolved_at, notes,
        products!inner(id, name, sku, physical_stock, reserved_stock, available_stock)
      `)
      .order('triggered_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (productId) {
      query = query.eq('product_id', productId)
    }

    if (alertType) {
      query = query.eq('alert_type', alertType)
    }

    if (status) {
      query = query.eq('alert_status', status)
    }

    const { data: alerts, error: alertsError } = await query

    if (alertsError) {
      throw new Error(`Failed to fetch reorder alerts: ${alertsError.message}`)
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('reorder_alerts')
      .select('id', { count: 'exact', head: true })

    if (productId) {
      countQuery = countQuery.eq('product_id', productId)
    }

    if (alertType) {
      countQuery = countQuery.eq('alert_type', alertType)
    }

    if (status) {
      countQuery = countQuery.eq('alert_status', status)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.warn('Failed to get alerts count:', countError)
    }

    // Get alert statistics
    const { data: alertStats, error: statsError } = await supabase
      .from('reorder_alerts')
      .select('alert_type, alert_status')

    let statistics = {}
    if (!statsError && alertStats) {
      statistics = alertStats.reduce((acc: any, alert: any) => {
        if (!acc[alert.alert_type]) {
          acc[alert.alert_type] = {}
        }
        acc[alert.alert_type][alert.alert_status] = (acc[alert.alert_type][alert.alert_status] || 0) + 1
        return acc
      }, {})
    }

    return NextResponse.json({
      alerts,
      pagination: {
        total: count || 0,
        limit,
        offset,
        has_more: (count || 0) > offset + limit
      },
      statistics,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Reorder alerts GET error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - Update reorder alert status
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateAlertSchema.parse(body)

    // Update the alert
    const { data: updatedAlert, error: updateError } = await supabase
      .from('reorder_alerts')
      .update({
        alert_status: validatedData.alert_status,
        acknowledged_by: user.id,
        acknowledged_at: validatedData.alert_status === 'acknowledged' ? new Date().toISOString() : null,
        resolved_at: validatedData.alert_status === 'resolved' ? new Date().toISOString() : null,
        notes: validatedData.notes
      })
      .eq('id', validatedData.alert_id)
      .select(`
        id, product_id, alert_type, alert_status,
        triggered_at, acknowledged_at, resolved_at,
        notes, products!inner(id, name, sku)
      `)
      .single()

    if (updateError) {
      throw new Error(`Failed to update alert: ${updateError.message}`)
    }

    // If resolved, update product stock status
    if (validatedData.alert_status === 'resolved') {
      const { error: statusError } = await supabase.rpc('update_product_stock_status', {
        p_product_id: updatedAlert.product_id
      })

      if (statusError) {
        console.warn('Failed to update product stock status:', statusError)
      }
    }

    return NextResponse.json({
      success: true,
      alert: updatedAlert,
      message: `Alert ${validatedData.alert_status} successfully`
    })

  } catch (error) {
    console.error('Update alert error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Manually trigger reorder check for a product
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { product_id } = body

    if (!product_id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Trigger reorder check
    const { error: checkError } = await supabase.rpc('check_and_create_reorder_alert', {
      p_product_id: product_id
    })

    if (checkError) {
      throw new Error(`Failed to check reorder alerts: ${checkError.message}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Reorder check completed successfully'
    })

  } catch (error) {
    console.error('Trigger reorder check error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
