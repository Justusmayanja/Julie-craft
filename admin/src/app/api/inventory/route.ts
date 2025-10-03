import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { InventoryService } from '@/lib/services/inventory'
import { createInventorySchema, inventoryFiltersSchema } from '@/lib/validations/inventory'

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
      status: searchParams.get('status') || undefined,
      category: searchParams.get('category') || undefined,
      supplier: searchParams.get('supplier') || undefined,
      movement_trend: searchParams.get('movement_trend') || undefined,
      min_stock: searchParams.get('min_stock') ? parseInt(searchParams.get('min_stock')!) : undefined,
      max_stock: searchParams.get('max_stock') ? parseInt(searchParams.get('max_stock')!) : undefined,
      min_value: searchParams.get('min_value') ? parseFloat(searchParams.get('min_value')!) : undefined,
      max_value: searchParams.get('max_value') ? parseFloat(searchParams.get('max_value')!) : undefined,
      low_stock: searchParams.get('low_stock') === 'true',
      sort_by: searchParams.get('sort_by') as any || 'product_name',
      sort_order: searchParams.get('sort_order') as any || 'asc',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    }

    // Validate filters
    const validatedFilters = inventoryFiltersSchema.parse(filters)

    const inventoryService = new InventoryService()
    const result = await inventoryService.getInventoryItems(validatedFilters)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Inventory fetch error:', error)
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
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
    const validatedData = createInventorySchema.parse(body)

    const inventoryService = new InventoryService()
    const inventoryItem = await inventoryService.createInventoryItem(validatedData)

    return NextResponse.json(inventoryItem, { status: 201 })

  } catch (error) {
    console.error('Inventory creation error:', error)
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
