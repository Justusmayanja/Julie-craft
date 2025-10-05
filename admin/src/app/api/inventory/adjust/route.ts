import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const stockAdjustmentSchema = z.object({
  product_id: z.string().uuid(),
  adjustment_type: z.enum(['increase', 'decrease', 'set']),
  quantity: z.number().int().min(0),
  reason: z.enum(['received', 'damaged', 'lost', 'correction', 'return', 'sale', 'transfer', 'other']),
  notes: z.string().optional(),
  reference: z.string().optional(), // PO number, invoice number, etc.
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = stockAdjustmentSchema.parse(body)

    // Check if inventory_adjustments table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('inventory_adjustments')
      .select('id')
      .limit(1)

    if (tableError) {
      return NextResponse.json({ 
        error: 'Inventory adjustments table not available. Please run the database setup script first.' 
      }, { status: 503 })
    }

    // Get current product data
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, stock_quantity, min_stock_level, max_stock_level')
      .eq('id', validatedData.product_id)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const currentQuantity = product.stock_quantity || 0
    let newQuantity = currentQuantity

    // Calculate new quantity based on adjustment type
    switch (validatedData.adjustment_type) {
      case 'increase':
        newQuantity = currentQuantity + validatedData.quantity
        break
      case 'decrease':
        newQuantity = Math.max(0, currentQuantity - validatedData.quantity) // Prevent negative inventory
        break
      case 'set':
        newQuantity = Math.max(0, validatedData.quantity) // Prevent negative inventory
        break
    }

    // Note: Maximum stock level validation removed to allow flexible stock management

    // Update product stock quantity
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        stock_quantity: newQuantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', validatedData.product_id)

    if (updateError) {
      throw new Error(`Failed to update product: ${updateError.message}`)
    }

    // Log the adjustment in inventory history
    const { error: historyError } = await supabase
      .from('inventory_adjustments')
      .insert({
        product_id: validatedData.product_id,
        product_name: product.name,
        adjustment_type: validatedData.adjustment_type,
        quantity_before: currentQuantity,
        quantity_after: newQuantity,
        quantity_change: newQuantity - currentQuantity,
        reason: validatedData.reason,
        notes: validatedData.notes,
        reference: validatedData.reference,
        user_id: user.id,
        user_name: user.email,
        created_at: new Date().toISOString(),
      })

    if (historyError) {
      // Log error but don't fail the transaction since the main update succeeded
      console.error('Failed to log inventory adjustment:', historyError)
    }

    return NextResponse.json({
      success: true,
      message: 'Stock adjustment completed successfully',
      data: {
        product_id: validatedData.product_id,
        product_name: product.name,
        quantity_before: currentQuantity,
        quantity_after: newQuantity,
        quantity_change: newQuantity - currentQuantity,
        adjustment_type: validatedData.adjustment_type,
        reason: validatedData.reason,
        timestamp: new Date().toISOString(),
      }
    })

  } catch (error) {
    console.error('Stock adjustment error:', error)
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Bulk adjustment endpoint
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const bulkAdjustmentSchema = z.object({
      adjustments: z.array(stockAdjustmentSchema),
      reason: z.string().optional(),
      notes: z.string().optional(),
    })

    const validatedData = bulkAdjustmentSchema.parse(body)

    const results = []
    const errors = []

    // Process each adjustment
    for (const adjustment of validatedData.adjustments) {
      try {
        // Get current product data
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('id, name, stock_quantity, min_stock_level, max_stock_level')
          .eq('id', adjustment.product_id)
          .single()

        if (productError || !product) {
          errors.push({ product_id: adjustment.product_id, error: 'Product not found' })
          continue
        }

        const currentQuantity = product.stock_quantity || 0
        let newQuantity = currentQuantity

        // Calculate new quantity
        switch (adjustment.adjustment_type) {
          case 'increase':
            newQuantity = currentQuantity + adjustment.quantity
            break
          case 'decrease':
            newQuantity = Math.max(0, currentQuantity - adjustment.quantity)
            break
          case 'set':
            newQuantity = Math.max(0, adjustment.quantity)
            break
        }

        // Update product
        const { error: updateError } = await supabase
          .from('products')
          .update({ 
            stock_quantity: newQuantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', adjustment.product_id)

        if (updateError) {
          errors.push({ product_id: adjustment.product_id, error: updateError.message })
          continue
        }

        // Log adjustment
        await supabase
          .from('inventory_adjustments')
          .insert({
            product_id: adjustment.product_id,
            product_name: product.name,
            adjustment_type: adjustment.adjustment_type,
            quantity_before: currentQuantity,
            quantity_after: newQuantity,
            quantity_change: newQuantity - currentQuantity,
            reason: adjustment.reason,
            notes: adjustment.notes || validatedData.notes,
            reference: adjustment.reference,
            user_id: user.id,
            user_name: user.email,
            created_at: new Date().toISOString(),
          })

        results.push({
          product_id: adjustment.product_id,
          product_name: product.name,
          quantity_before: currentQuantity,
          quantity_after: newQuantity,
          quantity_change: newQuantity - currentQuantity,
        })

      } catch (error) {
        errors.push({ 
          product_id: adjustment.product_id, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      message: `Processed ${results.length} adjustments successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
      results,
      errors,
    })

  } catch (error) {
    console.error('Bulk stock adjustment error:', error)
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
