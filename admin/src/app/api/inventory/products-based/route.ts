import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const inventoryFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['in_stock', 'low_stock', 'out_of_stock', 'discontinued']).optional(),
  low_stock: z.boolean().optional(),
  out_of_stock: z.boolean().optional(),
  category_id: z.string().uuid().optional(),
  sort_by: z.enum(['product_name', 'current_stock', 'total_value', 'last_restocked', 'created_at']).default('product_name'),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
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
    
    // Parse and validate filters
    const filters = {
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') as any || undefined,
      low_stock: searchParams.get('low_stock') === 'true',
      out_of_stock: searchParams.get('out_of_stock') === 'true',
      category_id: searchParams.get('category_id') || undefined,
      sort_by: searchParams.get('sort_by') as any || 'product_name',
      sort_order: searchParams.get('sort_order') as any || 'asc',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    }

    const validatedFilters = inventoryFiltersSchema.parse(filters)

    // Build query to get products with inventory-like data
    let query = supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        sku,
        price,
        cost_price,
        stock_quantity,
        min_stock_level,
        max_stock_level,
        reorder_point,
        status,
        category_id,
        category_name,
        created_at,
        updated_at,
        categories!left(name, description)
      `)

    // Apply filters
    if (validatedFilters.search) {
      query = query.or(`name.ilike.%${validatedFilters.search}%,sku.ilike.%${validatedFilters.search}%,description.ilike.%${validatedFilters.search}%`)
    }

    if (validatedFilters.category_id) {
      query = query.eq('category_id', validatedFilters.category_id)
    }

    // Apply stock-based filters
    if (validatedFilters.low_stock) {
      query = query.lte('stock_quantity', supabase.from('products').select('min_stock_level'))
    }

    if (validatedFilters.out_of_stock) {
      query = query.eq('stock_quantity', 0)
    }

    if (validatedFilters.status) {
      // Map inventory status to product status
      switch (validatedFilters.status) {
        case 'in_stock':
          query = query.gt('stock_quantity', supabase.from('products').select('min_stock_level'))
          break
        case 'low_stock':
          query = query.lte('stock_quantity', supabase.from('products').select('min_stock_level'))
          break
        case 'out_of_stock':
          query = query.eq('stock_quantity', 0)
          break
        case 'discontinued':
          query = query.eq('status', 'inactive')
          break
      }
    }

    // Apply sorting
    const sortColumn = validatedFilters.sort_by === 'current_stock' ? 'stock_quantity' : 
                      validatedFilters.sort_by === 'product_name' ? 'name' : 
                      validatedFilters.sort_by
    query = query.order(sortColumn, { ascending: validatedFilters.sort_order === 'asc' })

    // Apply pagination
    const offset = (validatedFilters.page - 1) * validatedFilters.limit
    query = query.range(offset, offset + validatedFilters.limit - 1)

    const { data: products, error, count } = await query

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    // Transform products to inventory format
    const inventoryItems = products?.map(product => {
      const currentStock = product.stock_quantity || 0
      const minStock = product.min_stock_level || 5
      const maxStock = product.max_stock_level || 100
      const unitCost = product.cost_price || 0
      const unitPrice = product.price || 0
      const totalValue = unitCost * currentStock

      // Determine inventory status
      let inventoryStatus = 'in_stock'
      if (currentStock === 0) {
        inventoryStatus = 'out_of_stock'
      } else if (currentStock <= minStock) {
        inventoryStatus = 'low_stock'
      } else if (product.status === 'inactive') {
        inventoryStatus = 'discontinued'
      }

      return {
        id: product.id,
        product_id: product.id,
        product_name: product.name,
        sku: product.sku || `SKU-${product.id.substring(0, 8)}`,
        category_name: product.category_name || product.categories?.name || 'Uncategorized',
        current_stock: currentStock,
        min_stock: minStock,
        max_stock: maxStock,
        reorder_point: product.reorder_point || 10,
        unit_cost: unitCost,
        unit_price: unitPrice,
        total_value: totalValue,
        status: inventoryStatus,
        movement_trend: 'stable', // This would be calculated from historical data
        supplier: 'Default Supplier', // This would come from a suppliers table
        last_restocked: null, // This would be tracked in a separate table
        notes: product.description,
        created_at: product.created_at,
        updated_at: product.updated_at,
        // Additional product data
        product_status: product.status,
        category_id: product.category_id,
        weight: null,
        dimensions: null,
      }
    }) || []

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      items: inventoryItems,
      total: totalCount || 0,
      page: validatedFilters.page,
      limit: validatedFilters.limit,
      total_pages: Math.ceil((totalCount || 0) / validatedFilters.limit),
      has_next: validatedFilters.page < Math.ceil((totalCount || 0) / validatedFilters.limit),
      has_prev: validatedFilters.page > 1,
      filters: validatedFilters,
    })

  } catch (error) {
    console.error('Products-based inventory fetch error:', error)
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
