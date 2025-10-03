import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { InventoryService } from '@/lib/services/inventory'
import { bulkInventoryUpdateSchema } from '@/lib/validations/inventory'

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
    const validatedData = bulkInventoryUpdateSchema.parse(body)

    const inventoryService = new InventoryService()
    const result = await inventoryService.bulkUpdateInventory(validatedData)

    return NextResponse.json({
      message: `Bulk operation completed`,
      updated: result.updated,
      errors: result.errors,
      total_items: validatedData.item_ids.length
    })

  } catch (error) {
    console.error('Bulk inventory update error:', error)
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
