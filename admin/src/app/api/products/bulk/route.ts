import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Bulk action schemas
const bulkDeleteSchema = z.object({
  action: z.literal('delete'),
  product_ids: z.array(z.string().uuid()).min(1, 'At least one product ID is required')
})

const bulkUpdateStatusSchema = z.object({
  action: z.literal('update_status'),
  product_ids: z.array(z.string().uuid()).min(1, 'At least one product ID is required'),
  status: z.enum(['active', 'inactive', 'draft', 'archived'])
})

const bulkUpdatePriceSchema = z.object({
  action: z.literal('update_price'),
  product_ids: z.array(z.string().uuid()).min(1, 'At least one product ID is required'),
  price_change_type: z.enum(['set', 'increase', 'decrease']),
  price_change_value: z.number().min(0, 'Price change value must be positive')
})

const bulkUpdateCategorySchema = z.object({
  action: z.literal('update_category'),
  product_ids: z.array(z.string().uuid()).min(1, 'At least one product ID is required'),
  category_id: z.string().uuid().nullable()
})

const bulkUpdateFeaturedSchema = z.object({
  action: z.literal('update_featured'),
  product_ids: z.array(z.string().uuid()).min(1, 'At least one product ID is required'),
  featured: z.boolean()
})

const bulkActionSchema = z.discriminatedUnion('action', [
  bulkDeleteSchema,
  bulkUpdateStatusSchema,
  bulkUpdatePriceSchema,
  bulkUpdateCategorySchema,
  bulkUpdateFeaturedSchema
])

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = bulkActionSchema.parse(body)

    let result: any = {}
    let affectedCount = 0

    switch (validatedData.action) {
      case 'delete':
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .in('id', validatedData.product_ids)

        if (deleteError) {
          throw new Error(`Failed to delete products: ${deleteError.message}`)
        }

        affectedCount = validatedData.product_ids.length
        result = {
          action: 'delete',
          affected_count: affectedCount,
          message: `Successfully deleted ${affectedCount} product(s)`
        }
        break

      case 'update_status':
        const { error: statusError } = await supabase
          .from('products')
          .update({ 
            status: validatedData.status,
            updated_at: new Date().toISOString()
          })
          .in('id', validatedData.product_ids)

        if (statusError) {
          throw new Error(`Failed to update product status: ${statusError.message}`)
        }

        affectedCount = validatedData.product_ids.length
        result = {
          action: 'update_status',
          affected_count: affectedCount,
          new_status: validatedData.status,
          message: `Successfully updated status of ${affectedCount} product(s) to ${validatedData.status}`
        }
        break

      case 'update_price':
        // First, get current prices for the products
        const { data: currentProducts, error: fetchError } = await supabase
          .from('products')
          .select('id, price')
          .in('id', validatedData.product_ids)

        if (fetchError) {
          throw new Error(`Failed to fetch current prices: ${fetchError.message}`)
        }

        // Calculate new prices
        const priceUpdates = currentProducts.map(product => {
          let newPrice = product.price

          switch (validatedData.price_change_type) {
            case 'set':
              newPrice = validatedData.price_change_value
              break
            case 'increase':
              newPrice = product.price + validatedData.price_change_value
              break
            case 'decrease':
              newPrice = Math.max(0, product.price - validatedData.price_change_value)
              break
          }

          return {
            id: product.id,
            price: newPrice,
            updated_at: new Date().toISOString()
          }
        })

        // Update prices
        for (const update of priceUpdates) {
          const { error: priceError } = await supabase
            .from('products')
            .update({ price: update.price, updated_at: update.updated_at })
            .eq('id', update.id)

          if (priceError) {
            throw new Error(`Failed to update price for product ${update.id}: ${priceError.message}`)
          }
        }

        affectedCount = validatedData.product_ids.length
        result = {
          action: 'update_price',
          affected_count: affectedCount,
          price_change_type: validatedData.price_change_type,
          price_change_value: validatedData.price_change_value,
          message: `Successfully updated prices for ${affectedCount} product(s)`
        }
        break

      case 'update_category':
        const { error: categoryError } = await supabase
          .from('products')
          .update({ 
            category_id: validatedData.category_id,
            updated_at: new Date().toISOString()
          })
          .in('id', validatedData.product_ids)

        if (categoryError) {
          throw new Error(`Failed to update product category: ${categoryError.message}`)
        }

        affectedCount = validatedData.product_ids.length
        result = {
          action: 'update_category',
          affected_count: affectedCount,
          category_id: validatedData.category_id,
          message: `Successfully updated category for ${affectedCount} product(s)`
        }
        break

      case 'update_featured':
        const { error: featuredError } = await supabase
          .from('products')
          .update({ 
            featured: validatedData.featured,
            updated_at: new Date().toISOString()
          })
          .in('id', validatedData.product_ids)

        if (featuredError) {
          throw new Error(`Failed to update featured status: ${featuredError.message}`)
        }

        affectedCount = validatedData.product_ids.length
        result = {
          action: 'update_featured',
          affected_count: affectedCount,
          featured: validatedData.featured,
          message: `Successfully updated featured status for ${affectedCount} product(s)`
        }
        break

      default:
        throw new Error('Invalid bulk action')
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Bulk action error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid bulk action data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
