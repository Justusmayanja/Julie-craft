import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const historyFiltersSchema = z.object({
  product_id: z.string().uuid().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  adjustment_type: z.enum(['increase', 'decrease', 'set']).optional(),
  reason: z.string().optional(),
  user_id: z.string().uuid().optional(),
  sort_by: z.enum(['created_at', 'quantity_change', 'product_name']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(50),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if inventory_adjustments table exists
    try {
      const { data: tableCheck, error: tableError } = await supabase
        .from('inventory_adjustments')
        .select('id')
        .limit(1)

      if (tableError) {
        console.log('Table check error:', tableError)
        // Table doesn't exist or no permissions, return 503 status
        return NextResponse.json({
          error: 'Inventory adjustments table not available. Please run the database setup script.',
          adjustments: [],
          summary: {
            total_adjustments: 0,
            total_increases: 0,
            total_decreases: 0,
            total_sets: 0,
            net_quantity_change: 0,
          },
          pagination: {
            total: 0,
            page: 1,
            limit: 50,
            total_pages: 0,
            has_next: false,
            has_prev: false,
          },
          filters: {},
        }, { status: 503 })
      }
    } catch (tableCheckError) {
      console.log('Table check exception:', tableCheckError)
      // Table doesn't exist or no permissions, return 503 status
      return NextResponse.json({
        error: 'Inventory adjustments table not available. Please run the database setup script.',
        adjustments: [],
        summary: {
          total_adjustments: 0,
          total_increases: 0,
          total_decreases: 0,
          total_sets: 0,
          net_quantity_change: 0,
        },
        pagination: {
          total: 0,
          page: 1,
          limit: 50,
          total_pages: 0,
          has_next: false,
          has_prev: false,
        },
        filters: {},
      }, { status: 503 })
    }

    const { searchParams } = new URL(request.url)
    
    // Parse and validate filters
    const filters = {
      product_id: searchParams.get('product_id') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      adjustment_type: searchParams.get('adjustment_type') as any || undefined,
      reason: searchParams.get('reason') || undefined,
      user_id: searchParams.get('user_id') || undefined,
      sort_by: searchParams.get('sort_by') as any || 'created_at',
      sort_order: searchParams.get('sort_order') as any || 'desc',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
    }

    const validatedFilters = historyFiltersSchema.parse(filters)

    // Build query for inventory adjustments
    let query = supabase
      .from('inventory_adjustments')
      .select(`
        id,
        product_id,
        product_name,
        adjustment_type,
        quantity_before,
        quantity_after,
        quantity_change,
        reason,
        notes,
        reference,
        user_id,
        user_name,
        created_at
      `)

    // Apply filters
    if (validatedFilters.product_id) {
      query = query.eq('product_id', validatedFilters.product_id)
    }

    if (validatedFilters.date_from) {
      query = query.gte('created_at', validatedFilters.date_from)
    }

    if (validatedFilters.date_to) {
      query = query.lte('created_at', validatedFilters.date_to)
    }

    if (validatedFilters.adjustment_type) {
      query = query.eq('adjustment_type', validatedFilters.adjustment_type)
    }

    if (validatedFilters.reason) {
      query = query.eq('reason', validatedFilters.reason)
    }

    if (validatedFilters.user_id) {
      query = query.eq('user_id', validatedFilters.user_id)
    }

    // Apply sorting
    query = query.order(validatedFilters.sort_by, { ascending: validatedFilters.sort_order === 'asc' })

    // Apply pagination
    const offset = (validatedFilters.page - 1) * validatedFilters.limit
    query = query.range(offset, offset + validatedFilters.limit - 1)

    const { data: adjustments, error, count } = await query

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('inventory_adjustments')
      .select('*', { count: 'exact', head: true })

    // Calculate summary statistics
    const summary = {
      total_adjustments: totalCount || 0,
      total_increases: adjustments?.filter(adj => adj.adjustment_type === 'increase').length || 0,
      total_decreases: adjustments?.filter(adj => adj.adjustment_type === 'decrease').length || 0,
      total_sets: adjustments?.filter(adj => adj.adjustment_type === 'set').length || 0,
      net_quantity_change: adjustments?.reduce((sum, adj) => sum + adj.quantity_change, 0) || 0,
    }

    return NextResponse.json({
      adjustments: adjustments || [],
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
    console.error('Inventory history fetch error:', error)
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
