import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { InventoryService } from '@/lib/services/inventory'
import { updateInventorySchema } from '@/lib/validations/inventory'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const inventoryService = new InventoryService()
    const inventoryItem = await inventoryService.getInventoryItem(id)

    return NextResponse.json(inventoryItem)

  } catch (error) {
    console.error('Inventory fetch error:', error)
    
    if (error instanceof Error && error.message.includes('Failed to fetch inventory item')) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = updateInventorySchema.parse(body)

    const { id } = await params
    const inventoryService = new InventoryService()
    const inventoryItem = await inventoryService.updateInventoryItem(id, validatedData)

    return NextResponse.json(inventoryItem)

  } catch (error) {
    console.error('Inventory update error:', error)
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    if (error instanceof Error && error.message.includes('Failed to update inventory item')) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const inventoryService = new InventoryService()
    await inventoryService.deleteInventoryItem(id)

    return NextResponse.json({ message: 'Inventory item deleted successfully' })

  } catch (error) {
    console.error('Inventory deletion error:', error)
    
    if (error instanceof Error && error.message.includes('Failed to delete inventory item')) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
