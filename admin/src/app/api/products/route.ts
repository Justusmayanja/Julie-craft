import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { productFiltersSchema, createProductSchema } from '@/lib/validations/product'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const filters = {
      search: searchParams.get('search') || undefined,
      category_id: searchParams.get('category_id') || undefined,
      status: searchParams.get('status') as 'active' | 'inactive' | 'draft' || undefined,
      featured: searchParams.get('featured') === 'true' ? true : searchParams.get('featured') === 'false' ? false : undefined,
      min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
      max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
      low_stock: searchParams.get('low_stock') === 'true' ? true : undefined,
      sort_by: searchParams.get('sort_by') as 'name' | 'price' | 'stock_quantity' | 'created_at' | 'updated_at' || 'created_at',
      sort_order: searchParams.get('sort_order') as 'asc' | 'desc' || 'desc',
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
      offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : 0,
    }

    // Validate filters
    const validatedFilters = productFiltersSchema.parse(filters)

    // Build query
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `, { count: 'exact' })

    // Apply filters
    if (validatedFilters.search) {
      query = query.or(`name.ilike.%${validatedFilters.search}%,description.ilike.%${validatedFilters.search}%,sku.ilike.%${validatedFilters.search}%`)
    }

    if (validatedFilters.category_id) {
      query = query.eq('category_id', validatedFilters.category_id)
    }

    if (validatedFilters.status) {
      query = query.eq('status', validatedFilters.status)
    }

    if (validatedFilters.featured !== undefined) {
      query = query.eq('featured', validatedFilters.featured)
    }

    if (validatedFilters.min_price !== undefined) {
      query = query.gte('price', validatedFilters.min_price)
    }

    if (validatedFilters.max_price !== undefined) {
      query = query.lte('price', validatedFilters.max_price)
    }

    if (validatedFilters.low_stock) {
      query = query.lte('stock_quantity', 5)
    }

    // Apply sorting
    query = query.order(validatedFilters.sort_by, { ascending: validatedFilters.sort_order === 'asc' })

    // Apply pagination
    query = query.range(validatedFilters.offset, validatedFilters.offset + validatedFilters.limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    return NextResponse.json({
      products: data || [],
      total: count || 0,
      limit: validatedFilters.limit,
      offset: validatedFilters.offset
    })

  } catch (error) {
    console.error('API error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
    const validatedData = createProductSchema.parse(body)

    // Ensure physical_stock is set from stock_quantity if not provided
    const productData = {
      ...validatedData,
      physical_stock: validatedData.physical_stock ?? validatedData.stock_quantity
    }

    // Create product
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select(`
        *,
        category:categories(*)
      `)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid product data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
