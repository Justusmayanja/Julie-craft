import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { InventoryService } from '@/lib/services/inventory'
import { stockMovementSchema } from '@/lib/validations/inventory'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const inventoryId = searchParams.get('inventory_id')

    const inventoryService = new InventoryService()
    const movements = await inventoryService.getStockMovements(inventoryId || undefined)

    return NextResponse.json({
      movements,
      count: movements.length
    })

  } catch (error) {
    console.error('Stock movements error:', error)
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
    const validatedData = stockMovementSchema.parse(body)

    const inventoryService = new InventoryService()
    const movement = await inventoryService.createStockMovement(validatedData)

    return NextResponse.json(movement, { status: 201 })

  } catch (error) {
    console.error('Stock movement creation error:', error)
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
