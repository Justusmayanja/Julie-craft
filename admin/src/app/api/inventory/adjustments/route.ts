import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schemas
const createAdjustmentSchema = z.object({
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

const approveAdjustmentSchema = z.object({
  adjustment_id: z.string().uuid(),
  approval_status: z.enum(['approved', 'rejected']),
  notes: z.string().optional()
})

// GET - Retrieve inventory adjustments
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
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Check if inventory_adjustments table exists
    const { data: tableCheck } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'inventory_adjustments')
      .single()

    if (!tableCheck) {
      // Table doesn't exist, return empty result
      return NextResponse.json({
        adjustments: [],
        total: 0,
        page: Math.floor(offset / limit) + 1,
        totalPages: 0
      })
    }

    let query = supabase
      .from('inventory_adjustments')
      .select(`
        id, product_id, adjustment_type, reason_code,
        quantity_adjusted, previous_physical_stock, new_physical_stock,
        approval_status, description, supporting_documents,
        created_at, approved_at, notes,
        requested_by, approved_by, witness_user_id,
        products!inner(id, name, sku)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (productId) {
      query = query.eq('product_id', productId)
    }

    if (status) {
      query = query.eq('approval_status', status)
    }

    const { data: adjustments, error: adjustmentsError } = await query

    if (adjustmentsError) {
      throw new Error(`Failed to fetch adjustments: ${adjustmentsError.message}`)
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('inventory_adjustments')
      .select('id', { count: 'exact', head: true })

    if (productId) {
      countQuery = countQuery.eq('product_id', productId)
    }

    if (status) {
      countQuery = countQuery.eq('approval_status', status)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.warn('Failed to get adjustment count:', countError)
    }

    return NextResponse.json({
      adjustments,
      pagination: {
        total: count || 0,
        limit,
        offset,
        has_more: (count || 0) > offset + limit
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Inventory adjustments GET error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Create new inventory adjustment
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if inventory_adjustments table exists
    const { data: tableCheck } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'inventory_adjustments')
      .single()

    if (!tableCheck) {
      return NextResponse.json({
        error: 'Inventory adjustments feature not yet available. Database setup required.'
      }, { status: 503 })
    }

    const body = await request.json()
    const validatedData = createAdjustmentSchema.parse(body)

    // Get current product stock (use stock_quantity as fallback if physical_stock doesn't exist)
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, sku, physical_stock, stock_quantity')
      .eq('id', validatedData.product_id)
      .single()

    if (productError || !product) {
      return NextResponse.json({ 
        error: 'Product not found' 
      }, { status: 404 })
    }

    // Use physical_stock if available, otherwise use stock_quantity
    const currentStock = product.physical_stock ?? product.stock_quantity ?? 0

    // Calculate new physical stock
    const newPhysicalStock = currentStock + validatedData.quantity_adjusted

    // Validate that new stock is not negative
    if (newPhysicalStock < 0) {
      return NextResponse.json({ 
        error: 'Adjustment would result in negative stock',
        current_stock: currentStock,
        adjustment: validatedData.quantity_adjusted,
        resulting_stock: newPhysicalStock
      }, { status: 400 })
    }

    // Create the adjustment record
    const { data: adjustment, error: adjustmentError } = await supabase
      .from('inventory_adjustments')
      .insert({
        product_id: validatedData.product_id,
        adjustment_type: validatedData.adjustment_type,
        reason_code: validatedData.reason_code,
        quantity_adjusted: validatedData.quantity_adjusted,
        previous_physical_stock: currentStock,
        new_physical_stock: newPhysicalStock,
        description: validatedData.description,
        supporting_documents: validatedData.supporting_documents || [],
        witness_user_id: validatedData.witness_user_id,
        requested_by: user.id
      })
      .select()
      .single()

    if (adjustmentError) {
      throw new Error(`Failed to create adjustment: ${adjustmentError.message}`)
    }

    return NextResponse.json({
      success: true,
      adjustment,
      message: 'Inventory adjustment created successfully. Awaiting approval.'
    })

  } catch (error) {
    console.error('Create adjustment error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - Approve or reject inventory adjustment
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = approveAdjustmentSchema.parse(body)

    // Get the adjustment record
    const { data: adjustment, error: adjustmentError } = await supabase
      .from('inventory_adjustments')
      .select(`
        id, product_id, adjustment_type, reason_code,
        quantity_adjusted, previous_physical_stock, new_physical_stock,
        approval_status, products!inner(id, name, sku)
      `)
      .eq('id', validatedData.adjustment_id)
      .single()

    if (adjustmentError || !adjustment) {
      return NextResponse.json({ 
        error: 'Adjustment not found' 
      }, { status: 404 })
    }

    if (adjustment.approval_status !== 'pending') {
      return NextResponse.json({ 
        error: 'Adjustment has already been processed' 
      }, { status: 400 })
    }

    // Update the adjustment record
    const { data: updatedAdjustment, error: updateError } = await supabase
      .from('inventory_adjustments')
      .update({
        approval_status: validatedData.approval_status,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        notes: validatedData.notes
      })
      .eq('id', validatedData.adjustment_id)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to update adjustment: ${updateError.message}`)
    }

    // If approved, apply the stock change
    if (validatedData.approval_status === 'approved') {
      // Lock the product row for update
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', adjustment.product_id)
        .single()

      if (productError || !product) {
        throw new Error('Product not found during stock update')
      }

      // Update product stock
      const { error: stockUpdateError } = await supabase
        .from('products')
        .update({
          physical_stock: adjustment.new_physical_stock,
          inventory_version: product.inventory_version + 1,
          last_stock_update: new Date().toISOString()
        })
        .eq('id', adjustment.product_id)

      if (stockUpdateError) {
        throw new Error(`Failed to update stock: ${stockUpdateError.message}`)
      }

      // Create audit log entry
      const { error: auditError } = await supabase
        .from('inventory_audit_log')
        .insert({
          product_id: adjustment.product_id,
          product_name: product.name,
          product_sku: product.sku,
          physical_stock_before: adjustment.previous_physical_stock,
          physical_stock_after: adjustment.new_physical_stock,
          reserved_stock_before: product.reserved_stock,
          reserved_stock_after: product.reserved_stock,
          available_stock_before: product.available_stock,
          available_stock_after: adjustment.new_physical_stock - product.reserved_stock,
          operation_type: 'inventory_adjustment',
          operation_reason: `${adjustment.adjustment_type}: ${adjustment.reason_code}`,
          quantity_affected: adjustment.quantity_adjusted,
          adjustment_id: adjustment.id,
          related_user_id: user.id,
          inventory_version_before: product.inventory_version,
          inventory_version_after: product.inventory_version + 1,
          notes: validatedData.notes
        })

      if (auditError) {
        console.warn('Failed to create audit log:', auditError)
      }

      // Check for reorder alerts
      const { error: alertError } = await supabase.rpc('check_and_create_reorder_alert', {
        p_product_id: adjustment.product_id
      })

      if (alertError) {
        console.warn('Failed to check reorder alerts:', alertError)
      }
    }

    return NextResponse.json({
      success: true,
      adjustment: updatedAdjustment,
      message: `Adjustment ${validatedData.approval_status} successfully`
    })

  } catch (error) {
    console.error('Approve adjustment error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
