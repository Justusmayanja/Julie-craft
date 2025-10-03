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

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const includeMovements = searchParams.get('include_movements') === 'true'

    const inventoryService = new InventoryService()
    
    // Get all inventory items
    const result = await inventoryService.getInventoryItems({
      page: 1,
      limit: 10000 // Get all items
    })

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'ID',
        'Product ID',
        'SKU',
        'Product Name',
        'Category',
        'Current Stock',
        'Min Stock',
        'Max Stock',
        'Reorder Point',
        'Unit Cost',
        'Unit Price',
        'Total Value',
        'Last Restocked',
        'Supplier',
        'Status',
        'Movement Trend',
        'Notes',
        'Created At',
        'Updated At'
      ]

      const csvRows = result.items.map(item => [
        item.id,
        item.product_id,
        item.sku,
        item.product_name,
        item.category_name || '',
        item.current_stock,
        item.min_stock,
        item.max_stock,
        item.reorder_point,
        item.unit_cost || '',
        item.unit_price || '',
        item.total_value,
        item.last_restocked || '',
        item.supplier || '',
        item.status,
        item.movement_trend,
        item.notes || '',
        item.created_at,
        item.updated_at
      ])

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => 
          typeof field === 'string' && field.includes(',') 
            ? `"${field.replace(/"/g, '""')}"` 
            : field
        ).join(','))
      ].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="inventory-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else {
      // Return JSON
      const exportData: any = {
        export_date: new Date().toISOString(),
        total_items: result.total,
        items: result.items,
        stats: result.stats
      }

      if (includeMovements) {
        // Get stock movements for each item
        const movementsData = []
        for (const item of result.items) {
          try {
            const movements = await inventoryService.getStockMovements(item.id)
            movementsData.push({
              inventory_id: item.id,
              product_name: item.product_name,
              movements
            })
          } catch (error) {
            console.error(`Failed to fetch movements for item ${item.id}:`, error)
            // Add empty movements array if table doesn't exist
            movementsData.push({
              inventory_id: item.id,
              product_name: item.product_name,
              movements: []
            })
          }
        }
        exportData.movements = movementsData
      }

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="inventory-export-${new Date().toISOString().split('T')[0]}.json"`
        }
      })
    }

  } catch (error) {
    console.error('Inventory export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
