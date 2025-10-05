import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schemas
const processReturnSchema = z.object({
  product_id: z.string().uuid(),
  order_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  reason: z.string().optional(),
  user_id: z.string().uuid().optional()
})

// POST - Process a stock return
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = processReturnSchema.parse(body)

    // Add user ID if not provided
    const returnData = {
      ...validatedData,
      user_id: validatedData.user_id || user.id,
      reason: validatedData.reason || 'Customer return'
    }

    // Call the atomic return processing function
    const { data: result, error } = await supabase.rpc('process_stock_return', {
      p_product_id: returnData.product_id,
      p_order_id: returnData.order_id,
      p_quantity: returnData.quantity,
      p_user_id: returnData.user_id,
      p_reason: returnData.reason
    })

    if (error) {
      throw new Error(`Return processing failed: ${error.message}`)
    }

    const returnResult = result as any

    if (!returnResult.success) {
      return NextResponse.json({
        error: returnResult.error,
        error_code: returnResult.error_code,
        details: returnResult
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      physical_stock_after: returnResult.physical_stock_after,
      available_stock_after: returnResult.available_stock_after,
      message: 'Stock return processed successfully'
    })

  } catch (error) {
    console.error('Stock return error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET - Retrieve return history
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
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('inventory_audit_log')
      .select(`
        id, product_id, product_name, product_sku,
        operation_type, operation_reason, quantity_affected,
        physical_stock_before, physical_stock_after,
        available_stock_before, available_stock_after,
        order_id, created_at, notes
      `)
      .eq('operation_type', 'return_processing')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (productId) {
      query = query.eq('product_id', productId)
    }

    if (orderId) {
      query = query.eq('order_id', orderId)
    }

    const { data: returns, error: returnsError } = await query

    if (returnsError) {
      throw new Error(`Failed to fetch returns: ${returnsError.message}`)
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('inventory_audit_log')
      .select('id', { count: 'exact', head: true })
      .eq('operation_type', 'return_processing')

    if (productId) {
      countQuery = countQuery.eq('product_id', productId)
    }

    if (orderId) {
      countQuery = countQuery.eq('order_id', orderId)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.warn('Failed to get returns count:', countError)
    }

    return NextResponse.json({
      returns,
      pagination: {
        total: count || 0,
        limit,
        offset,
        has_more: (count || 0) > offset + limit
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Returns GET error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
