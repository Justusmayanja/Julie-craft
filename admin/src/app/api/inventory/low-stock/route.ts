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
    const lowStockItems = await inventoryService.getLowStockItems()

    return NextResponse.json({
      items: lowStockItems,
      count: lowStockItems.length,
      total_value: lowStockItems.reduce((sum, item) => sum + item.total_value, 0)
    })

  } catch (error) {
    console.error('Low stock items error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
