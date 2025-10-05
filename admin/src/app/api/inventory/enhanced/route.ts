import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const enhancedInventoryFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'in_stock', 'low_stock', 'out_of_stock', 'discontinued']).default('all'),
  location: z.string().optional(),
  category_id: z.string().uuid().optional(),
  sort_by: z.enum(['product_name', 'current_quantity', 'available_quantity', 'last_updated', 'reorder_point']).default('product_name'),
  sort_order: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  show_low_stock_only: z.boolean().optional(),
  show_out_of_stock_only: z.boolean().optional(),
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
      status: searchParams.get('status') as any || 'all',
      location: searchParams.get('location') || undefined,
      category_id: searchParams.get('category_id') || undefined,
      sort_by: searchParams.get('sort_by') as any || 'product_name',
      sort_order: searchParams.get('sort_order') as any || 'asc',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      show_low_stock_only: searchParams.get('show_low_stock_only') === 'true',
      show_out_of_stock_only: searchParams.get('show_out_of_stock_only') === 'true',
    }

    const validatedFilters = enhancedInventoryFiltersSchema.parse(filters)

    // Build query to get products with enhanced inventory data
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

    // Apply status filters
    if (validatedFilters.status !== 'all') {
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

    // Apply special filters
    if (validatedFilters.show_low_stock_only) {
      query = query.lte('stock_quantity', supabase.from('products').select('min_stock_level'))
    }

    if (validatedFilters.show_out_of_stock_only) {
      query = query.eq('stock_quantity', 0)
    }

    // Apply sorting
    const sortColumn = validatedFilters.sort_by === 'current_quantity' ? 'stock_quantity' : 
                      validatedFilters.sort_by === 'product_name' ? 'name' : 
                      validatedFilters.sort_by === 'last_updated' ? 'updated_at' :
                      validatedFilters.sort_by
    query = query.order(sortColumn, { ascending: validatedFilters.sort_order === 'asc' })

    // Apply pagination
    const offset = (validatedFilters.page - 1) * validatedFilters.limit
    query = query.range(offset, offset + validatedFilters.limit - 1)

    const { data: products, error, count } = await query

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    // Transform products to enhanced inventory format
    const inventoryItems = products?.map(product => {
      const currentQuantity = product.stock_quantity || 0
      const minStock = product.min_stock_level || 5
      const maxStock = product.max_stock_level || 100
      const reorderPoint = product.reorder_point || 10
      const unitCost = product.cost_price || 0
      const unitPrice = product.price || 0
      const totalValue = unitCost * currentQuantity

      // Calculate available quantity (current - reserved)
      // For now, we'll assume no reserved quantity, but this would come from a reservations table
      const reservedQuantity = 0 // This would be calculated from reservations
      const availableQuantity = Math.max(0, currentQuantity - reservedQuantity)

      // Determine inventory status
      let inventoryStatus = 'in_stock'
      if (currentQuantity === 0) {
        inventoryStatus = 'out_of_stock'
      } else if (currentQuantity <= minStock) {
        inventoryStatus = 'low_stock'
      } else if (product.status === 'inactive') {
        inventoryStatus = 'discontinued'
      }

      // Determine if below reorder point
      const belowReorderPoint = currentQuantity <= reorderPoint

      return {
        id: product.id,
        product_id: product.id,
        product_name: product.name,
        sku: product.sku || `SKU-${product.id.substring(0, 8)}`,
        category_name: product.category_name || (product.categories && product.categories.length > 0 ? product.categories[0].name : null) || 'Uncategorized',
        current_quantity: currentQuantity,
        available_quantity: availableQuantity,
        reserved_quantity: reservedQuantity,
        location: 'Main Warehouse', // This would come from a locations table
        warehouse: 'Main Warehouse', // This would come from a warehouses table
        reorder_point: reorderPoint,
        min_stock_level: minStock,
        max_stock_level: maxStock,
        unit_cost: unitCost,
        unit_price: unitPrice,
        total_value: totalValue,
        status: inventoryStatus,
        below_reorder_point: belowReorderPoint,
        last_updated: product.updated_at,
        created_at: product.created_at,
        // Additional fields for enhanced functionality
        product_status: product.status,
        category_id: product.category_id,
        description: product.description,
        weight: null,
        dimensions: null,
        supplier: 'Default Supplier', // This would come from a suppliers table
        notes: null,
      }
    }) || []

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    // Calculate summary statistics
    const summary = {
      total_items: totalCount || 0,
      in_stock: inventoryItems.filter(item => item.status === 'in_stock').length,
      low_stock: inventoryItems.filter(item => item.status === 'low_stock').length,
      out_of_stock: inventoryItems.filter(item => item.status === 'out_of_stock').length,
      below_reorder_point: inventoryItems.filter(item => item.below_reorder_point).length,
      total_value: inventoryItems.reduce((sum, item) => sum + item.total_value, 0),
      total_quantity: inventoryItems.reduce((sum, item) => sum + item.current_quantity, 0),
    }

    return NextResponse.json({
      items: inventoryItems,
      summary,
      pagination: {
        total: totalCount || 0,
        page: validatedFilters.page,
        limit: validatedFilters.limit,
        total_pages: Math.ceil((totalCount || 0) / validatedFilters.limit),
        has_next: validatedFilters.page < Math.ceil((totalCount || 0) / validatedFilters.limit),
        has_prev: validatedFilters.page > 1,
      },
      filters: validatedFilters,
    })

  } catch (error) {
    console.error('Enhanced inventory fetch error:', error)
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
