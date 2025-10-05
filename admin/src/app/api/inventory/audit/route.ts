import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Retrieve inventory audit logs
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
    const orderId = searchParams.get('order_id')
    const operationType = searchParams.get('operation_type')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Check if inventory_audit_log table exists
    const { data: tableCheck } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'inventory_audit_log')
      .single()

    if (!tableCheck) {
      // Table doesn't exist, return empty result
      return NextResponse.json({
        auditLogs: [],
        total: 0,
        page: Math.floor(offset / limit) + 1,
        totalPages: 0
      })
    }

    let query = supabase
      .from('inventory_audit_log')
      .select(`
        id, product_id, product_name, product_sku,
        physical_stock_before, physical_stock_after, physical_stock_change,
        reserved_stock_before, reserved_stock_after, reserved_stock_change,
        available_stock_before, available_stock_after, available_stock_change,
        operation_type, operation_reason, quantity_affected,
        order_id, adjustment_id, related_user_id,
        created_at, notes
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (productId) {
      query = query.eq('product_id', productId)
    }

    if (orderId) {
      query = query.eq('order_id', orderId)
    }

    if (operationType) {
      query = query.eq('operation_type', operationType)
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data: auditLogs, error: auditError } = await query

    if (auditError) {
      throw new Error(`Failed to fetch audit logs: ${auditError.message}`)
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('inventory_audit_log')
      .select('id', { count: 'exact', head: true })

    if (productId) {
      countQuery = countQuery.eq('product_id', productId)
    }

    if (orderId) {
      countQuery = countQuery.eq('order_id', orderId)
    }

    if (operationType) {
      countQuery = countQuery.eq('operation_type', operationType)
    }

    if (startDate) {
      countQuery = countQuery.gte('created_at', startDate)
    }

    if (endDate) {
      countQuery = countQuery.lte('created_at', endDate)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.warn('Failed to get audit log count:', countError)
    }

    // Get operation type summary
    const { data: operationSummary, error: summaryError } = await supabase
      .from('inventory_audit_log')
      .select('operation_type')
      .eq('product_id', productId || '')

    let summary = {}
    if (!summaryError && operationSummary) {
      summary = operationSummary.reduce((acc: any, log: any) => {
        acc[log.operation_type] = (acc[log.operation_type] || 0) + 1
        return acc
      }, {})
    }

    return NextResponse.json({
      audit_logs: auditLogs,
      pagination: {
        total: count || 0,
        limit,
        offset,
        has_more: (count || 0) > offset + limit
      },
      summary,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Audit logs GET error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
