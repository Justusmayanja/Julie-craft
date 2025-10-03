import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { InventoryService } from '@/lib/services/inventory'
import { createInventorySchema } from '@/lib/validations/inventory'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const updateExisting = formData.get('update_existing') === 'true'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const inventoryService = new InventoryService()
    const results = {
      imported: 0,
      updated: 0,
      errors: [] as string[],
      total_rows: 0
    }

    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      // Handle CSV import
      const csvText = await file.text()
      const lines = csvText.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        return NextResponse.json({ error: 'CSV file must have at least a header row and one data row' }, { status: 400 })
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      results.total_rows = lines.length - 1

      // Map CSV headers to our schema
      const headerMap: { [key: string]: string } = {
        'ID': 'id',
        'Product ID': 'product_id',
        'SKU': 'sku',
        'Product Name': 'product_name',
        'Category': 'category_name',
        'Current Stock': 'current_stock',
        'Min Stock': 'min_stock',
        'Max Stock': 'max_stock',
        'Reorder Point': 'reorder_point',
        'Unit Cost': 'unit_cost',
        'Unit Price': 'unit_price',
        'Supplier': 'supplier',
        'Status': 'status',
        'Movement Trend': 'movement_trend',
        'Notes': 'notes'
      }

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
          const rowData: any = {}

          headers.forEach((header, index) => {
            const mappedField = headerMap[header]
            if (mappedField && values[index] !== undefined) {
              let value: any = values[index]
              
              // Convert numeric fields
              if (['current_stock', 'min_stock', 'max_stock', 'reorder_point'].includes(mappedField)) {
                value = parseInt(value) || 0
              } else if (['unit_cost', 'unit_price'].includes(mappedField)) {
                value = parseFloat(value) || null
              }
              
              rowData[mappedField] = value
            }
          })

          // Validate the data
          const validatedData = createInventorySchema.parse(rowData)

          if (updateExisting && rowData.id) {
            // Try to update existing item
            try {
              await inventoryService.updateInventoryItem(rowData.id, validatedData)
              results.updated++
            } catch (error) {
              // If update fails, try to create new
              await inventoryService.createInventoryItem(validatedData)
              results.imported++
            }
          } else {
            // Create new item
            await inventoryService.createInventoryItem(validatedData)
            results.imported++
          }

        } catch (error) {
          const errorMessage = `Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
          results.errors.push(errorMessage)
        }
      }

    } else if (file.type === 'application/json' || file.name.endsWith('.json')) {
      // Handle JSON import
      const jsonText = await file.text()
      const data = JSON.parse(jsonText)

      if (!data.items || !Array.isArray(data.items)) {
        return NextResponse.json({ error: 'JSON file must contain an "items" array' }, { status: 400 })
      }

      results.total_rows = data.items.length

      for (let i = 0; i < data.items.length; i++) {
        try {
          const item = data.items[i]
          
          // Validate the data
          const validatedData = createInventorySchema.parse(item)

          if (updateExisting && item.id) {
            // Try to update existing item
            try {
              await inventoryService.updateInventoryItem(item.id, validatedData)
              results.updated++
            } catch (error) {
              // If update fails, try to create new
              await inventoryService.createInventoryItem(validatedData)
              results.imported++
            }
          } else {
            // Create new item
            await inventoryService.createInventoryItem(validatedData)
            results.imported++
          }

        } catch (error) {
          const errorMessage = `Item ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`
          results.errors.push(errorMessage)
        }
      }

    } else {
      return NextResponse.json({ error: 'Unsupported file type. Please use CSV or JSON.' }, { status: 400 })
    }

    return NextResponse.json({
      message: 'Import completed',
      ...results,
      success: results.errors.length === 0
    })

  } catch (error) {
    console.error('Inventory import error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
