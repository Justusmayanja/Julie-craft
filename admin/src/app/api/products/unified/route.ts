import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const unifiedProductFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'draft', 'archived']).optional(),
  category_id: z.string().uuid().optional(),
  low_stock: z.boolean().optional(),
  out_of_stock: z.boolean().optional(),
  sort_by: z.enum(['name', 'price', 'stock_quantity', 'current_stock', 'created_at', 'updated_at']).default('name'),
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
      category_id: searchParams.get('category_id') || undefined,
      low_stock: searchParams.get('low_stock') === 'true',
      out_of_stock: searchParams.get('out_of_stock') === 'true',
      sort_by: searchParams.get('sort_by') as any || 'name',
      sort_order: searchParams.get('sort_order') as any || 'asc',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    }

    const validatedFilters = unifiedProductFiltersSchema.parse(filters)

    // Build the query to join products and inventory tables
    let query = supabase
      .from('products')
      .select(`
        *,
        inventory!left(
          id,
          current_stock,
          min_stock,
          max_stock,
          reorder_point,
          unit_cost,
          unit_price,
          total_value,
          last_restocked,
          supplier,
          status,
          movement_trend,
          notes,
          created_at,
          updated_at
        )
      `)

    // Apply filters
    if (validatedFilters.search) {
      query = query.or(`name.ilike.%${validatedFilters.search}%,sku.ilike.%${validatedFilters.search}%,description.ilike.%${validatedFilters.search}%`)
    }

    if (validatedFilters.status) {
      query = query.eq('status', validatedFilters.status)
    }

    if (validatedFilters.category_id) {
      query = query.eq('category_id', validatedFilters.category_id)
    }

    // Apply inventory-specific filters
    if (validatedFilters.low_stock) {
      query = query.or('inventory.current_stock.lte.inventory.min_stock,inventory.current_stock.is.null')
    }

    if (validatedFilters.out_of_stock) {
      query = query.or('inventory.current_stock.eq.0,inventory.current_stock.is.null')
    }

    // Apply sorting
    const sortColumn = validatedFilters.sort_by === 'current_stock' ? 'inventory.current_stock' : validatedFilters.sort_by
    query = query.order(sortColumn, { ascending: validatedFilters.sort_order === 'asc' })

    // Apply pagination
    const offset = (validatedFilters.page - 1) * validatedFilters.limit
    query = query.range(offset, offset + validatedFilters.limit - 1)

    const { data: products, error, count } = await query

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    // Transform the data to create a unified product object
    const unifiedProducts = products?.map(product => {
      const inventory = product.inventory?.[0] || null
      
      return {
        // Product data
        id: product.id,
        name: product.name,
        description: product.description,
        category_id: product.category_id,
        category_name: product.category_name,
        sku: product.sku,
        price: product.price,
        cost_price: product.cost_price,
        status: product.status,
        featured: product.featured,
        tags: product.tags,
        images: product.images,
        featured_image: product.featured_image,
        weight: product.weight,
        dimensions: product.dimensions,
        seo_title: product.seo_title,
        seo_description: product.seo_description,
        seo_keywords: product.seo_keywords,
        created_at: product.created_at,
        updated_at: product.updated_at,
        
        // Inventory data (with fallbacks to product data)
        current_stock: inventory?.current_stock ?? product.stock_quantity ?? 0,
        min_stock: inventory?.min_stock ?? product.min_stock_level ?? 5,
        max_stock: inventory?.max_stock ?? product.max_stock_level ?? 100,
        reorder_point: inventory?.reorder_point ?? product.reorder_point ?? 10,
        unit_cost: inventory?.unit_cost ?? product.cost_price,
        unit_price: inventory?.unit_price ?? product.price,
        total_value: inventory?.total_value ?? (product.cost_price * (inventory?.current_stock ?? product.stock_quantity ?? 0)),
        last_restocked: inventory?.last_restocked,
        supplier: inventory?.supplier,
        inventory_status: inventory?.status ?? (inventory?.current_stock === 0 ? 'out_of_stock' : inventory?.current_stock <= inventory?.min_stock ? 'low_stock' : 'in_stock'),
        movement_trend: inventory?.movement_trend ?? 'stable',
        inventory_notes: inventory?.notes,
        inventory_created_at: inventory?.created_at,
        inventory_updated_at: inventory?.updated_at,
        
        // Consistency flags
        has_inventory_record: !!inventory,
        stock_consistency: inventory ? (inventory.current_stock === product.stock_quantity) : false,
        price_consistency: inventory ? (inventory.unit_price === product.price) : false,
        cost_consistency: inventory ? (inventory.unit_cost === product.cost_price) : false,
        
        // Calculated fields
        is_low_stock: (inventory?.current_stock ?? product.stock_quantity ?? 0) <= (inventory?.min_stock ?? product.min_stock_level ?? 5),
        is_out_of_stock: (inventory?.current_stock ?? product.stock_quantity ?? 0) === 0,
        needs_restock: (inventory?.current_stock ?? product.stock_quantity ?? 0) <= (inventory?.reorder_point ?? product.reorder_point ?? 10),
      }
    }) || []

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      products: unifiedProducts,
      pagination: {
        page: validatedFilters.page,
        limit: validatedFilters.limit,
        total: totalCount || 0,
        total_pages: Math.ceil((totalCount || 0) / validatedFilters.limit),
        has_next: validatedFilters.page < Math.ceil((totalCount || 0) / validatedFilters.limit),
        has_prev: validatedFilters.page > 1,
      },
      filters: validatedFilters,
    })

  } catch (error) {
    console.error('Unified products fetch error:', error)
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
