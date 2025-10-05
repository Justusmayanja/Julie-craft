import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schemas
const stockReservationSchema = z.object({
  product_id: z.string().uuid(),
  order_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  user_id: z.string().uuid().optional()
})

const stockFulfillmentSchema = z.object({
  product_id: z.string().uuid(),
  order_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  user_id: z.string().uuid().optional()
})

const stockCancellationSchema = z.object({
  product_id: z.string().uuid(),
  order_id: z.string().uuid(),
  user_id: z.string().uuid().optional()
})

const stockReturnSchema = z.object({
  product_id: z.string().uuid(),
  order_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  reason: z.string().optional(),
  user_id: z.string().uuid().optional()
})

const inventoryAdjustmentSchema = z.object({
  product_id: z.string().uuid(),
  adjustment_type: z.enum([
    'physical_count', 'damage_writeoff', 'theft_loss', 'counting_error',
    'manual_correction', 'supplier_return', 'quality_control_reject'
  ]),
  reason_code: z.string().min(1),
  quantity_adjusted: z.number().int(), // Can be negative
  description: z.string().min(1),
  supporting_documents: z.array(z.string().url()).optional(),
  witness_user_id: z.string().uuid().optional()
})

// GET - Retrieve current stock status for products
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
    const includeReservations = searchParams.get('include_reservations') === 'true'
    const includeAuditLog = searchParams.get('include_audit_log') === 'true'

    let query = supabase
      .from('products')
      .select(`
        id, name, sku, 
        stock_quantity, physical_stock, reserved_stock, available_stock,
        min_stock_level, reorder_point, reorder_quantity, max_stock_level,
        stock_status, inventory_version, version, last_stock_update,
        stock_hold_reason, stock_hold_until
      `)

    if (productId) {
      query = query.eq('id', productId)
    }

    const { data: products, error: productsError } = await query

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`)
    }

    // Include reservations if requested
    let reservations = null
    if (includeReservations && products) {
      const productIds = products.map(p => p.id)
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('stock_reservations')
        .select(`
          id, product_id, order_id, quantity_reserved,
          reservation_status, reserved_at, expires_at,
          fulfilled_at, cancelled_at
        `)
        .in('product_id', productIds)
        .eq('reservation_status', 'active')

      if (!reservationsError) {
        reservations = reservationsData
      }
    }

    // Include audit log if requested
    let auditLog = null
    if (includeAuditLog && products) {
      const productIds = products.map(p => p.id)
      const { data: auditData, error: auditError } = await supabase
        .from('inventory_audit_log')
        .select(`
          id, product_id, operation_type, operation_reason,
          quantity_affected, created_at, order_id
        `)
        .in('product_id', productIds)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!auditError) {
        auditLog = auditData
      }
    }

    return NextResponse.json({
      products,
      reservations,
      audit_log: auditLog,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Robust inventory GET error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Reserve stock for an order
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = stockReservationSchema.parse(body)

    // Add user ID if not provided
    const reservationData = {
      ...validatedData,
      user_id: validatedData.user_id || user.id
    }

    // Call the atomic reservation function
    const { data: result, error } = await supabase.rpc('reserve_stock_for_order', {
      p_product_id: reservationData.product_id,
      p_order_id: reservationData.order_id,
      p_quantity: reservationData.quantity,
      p_user_id: reservationData.user_id
    })

    if (error) {
      throw new Error(`Reservation failed: ${error.message}`)
    }

    const reservationResult = result as any

    if (!reservationResult.success) {
      return NextResponse.json({
        error: reservationResult.error,
        error_code: reservationResult.error_code,
        details: reservationResult
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      reservation_id: reservationResult.reservation_id,
      available_stock_after: reservationResult.available_stock_after,
      message: 'Stock reserved successfully'
    })

  } catch (error) {
    console.error('Stock reservation error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - Fulfill order (ship products)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = stockFulfillmentSchema.parse(body)

    // Add user ID if not provided
    const fulfillmentData = {
      ...validatedData,
      user_id: validatedData.user_id || user.id
    }

    // Call the atomic fulfillment function
    const { data: result, error } = await supabase.rpc('fulfill_order_stock', {
      p_product_id: fulfillmentData.product_id,
      p_order_id: fulfillmentData.order_id,
      p_quantity: fulfillmentData.quantity,
      p_user_id: fulfillmentData.user_id
    })

    if (error) {
      throw new Error(`Fulfillment failed: ${error.message}`)
    }

    const fulfillmentResult = result as any

    if (!fulfillmentResult.success) {
      return NextResponse.json({
        error: fulfillmentResult.error,
        error_code: fulfillmentResult.error_code,
        details: fulfillmentResult
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      physical_stock_after: fulfillmentResult.physical_stock_after,
      reserved_stock_after: fulfillmentResult.reserved_stock_after,
      available_stock_after: fulfillmentResult.available_stock_after,
      message: 'Order fulfilled successfully'
    })

  } catch (error) {
    console.error('Stock fulfillment error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE - Cancel order reservation
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = stockCancellationSchema.parse(body)

    // Add user ID if not provided
    const cancellationData = {
      ...validatedData,
      user_id: validatedData.user_id || user.id
    }

    // Call the atomic cancellation function
    const { data: result, error } = await supabase.rpc('cancel_order_reservation', {
      p_product_id: cancellationData.product_id,
      p_order_id: cancellationData.order_id,
      p_user_id: cancellationData.user_id
    })

    if (error) {
      throw new Error(`Cancellation failed: ${error.message}`)
    }

    const cancellationResult = result as any

    if (!cancellationResult.success) {
      return NextResponse.json({
        error: cancellationResult.error,
        error_code: cancellationResult.error_code,
        details: cancellationResult
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      released_quantity: cancellationResult.released_quantity,
      available_stock_after: cancellationResult.available_stock_after,
      message: 'Reservation cancelled successfully'
    })

  } catch (error) {
    console.error('Stock cancellation error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
