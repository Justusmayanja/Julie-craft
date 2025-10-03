import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { productFiltersSchema } from '@/lib/validations/product'

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
    const format = searchParams.get('format') || 'csv'
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
      limit: 10000, // Large limit for export
      offset: 0,
    }

    // Validate filters
    const validatedFilters = productFiltersSchema.parse(filters)

    // Build query
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)

    // Apply filters (same logic as main products endpoint)
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
    const sortColumn = validatedFilters.sort_by === 'name' ? 'name' : validatedFilters.sort_by
    query = query.order(sortColumn, { ascending: validatedFilters.sort_order === 'asc' })

    const { data: products, error } = await query

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`)
    }

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'ID',
        'Name',
        'Description',
        'Category',
        'SKU',
        'Price',
        'Cost Price',
        'Stock Quantity',
        'Min Stock Level',
        'Max Stock Level',
        'Reorder Point',
        'Weight',
        'Dimensions',
        'Images',
        'Featured Image',
        'Status',
        'Featured',
        'Tags',
        'SEO Title',
        'SEO Description',
        'SEO Keywords',
        'Created At',
        'Updated At'
      ]

      const csvRows = products.map(product => [
        product.id,
        product.name || '',
        product.description || '',
        product.category?.name || '',
        product.sku || '',
        product.price || 0,
        product.cost_price || '',
        product.stock_quantity || 0,
        product.min_stock_level || 0,
        product.max_stock_level || 0,
        product.reorder_point || 0,
        product.weight || '',
        product.dimensions ? JSON.stringify(product.dimensions) : '',
        product.images ? product.images.join(';') : '',
        product.featured_image || '',
        product.status || '',
        product.featured ? 'Yes' : 'No',
        product.tags ? product.tags.join(';') : '',
        product.seo_title || '',
        product.seo_description || '',
        product.seo_keywords ? product.seo_keywords.join(';') : '',
        product.created_at || '',
        product.updated_at || ''
      ])

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="products-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else if (format === 'json') {
      // Return JSON
      return NextResponse.json({
        products,
        export_date: new Date().toISOString(),
        total_count: products.length,
        filters: validatedFilters
      })
    } else {
      return NextResponse.json({ error: 'Unsupported export format' }, { status: 400 })
    }

  } catch (error) {
    console.error('Export error:', error)
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid filter parameters' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
