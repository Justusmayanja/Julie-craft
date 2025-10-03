import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { InventoryService } from '@/lib/services/inventory'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const inventoryService = new InventoryService()
    const stats = await inventoryService.getInventoryStats()

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Inventory stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
