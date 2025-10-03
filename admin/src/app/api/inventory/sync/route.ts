import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { InventoryService } from '@/lib/services/inventory'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const inventoryService = new InventoryService()
    const result = await inventoryService.syncWithProducts()

    return NextResponse.json({
      message: 'Inventory sync completed',
      synced: result.synced,
      errors: result.errors,
      success: result.errors.length === 0
    })

  } catch (error) {
    console.error('Inventory sync error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
