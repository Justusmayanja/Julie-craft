import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get basic stats from products table only (more reliable)
    const { data: products, error: productsError, count: productsCount } = await supabase
      .from('products')
      .select('id, status, price, cost_price, stock_quantity, min_stock_level, created_at', { count: 'exact' })

    if (productsError) {
      throw new Error(`Products fetch error: ${productsError.message}`)
    }

    // Get basic stats from inventory table
    const { data: inventory, error: inventoryError, count: inventoryCount } = await supabase
      .from('inventory')
      .select('id, product_id, current_stock, unit_cost, unit_price, total_value, status', { count: 'exact' })

    if (inventoryError) {
      // If inventory table doesn't exist or has issues, continue with products only
      console.warn('Inventory table error:', inventoryError.message)
    }

    const productsList = products || []
    const inventoryList = inventory || []

    // Calculate basic metrics
    const totalProducts = productsCount || productsList.length
    const totalInventoryItems = inventoryCount || inventoryList.length

    // Status breakdown
    const statusBreakdown = {
      active: productsList.filter(p => p.status === 'active').length,
      inactive: productsList.filter(p => p.status === 'inactive').length,
      draft: productsList.filter(p => p.status === 'draft').length,
      archived: productsList.filter(p => p.status === 'archived').length,
    }

    // Basic consistency check
    const productIds = productsList.map(p => p.id)
    const inventoryProductIds = inventoryList.map(inv => inv.product_id).filter(Boolean)
    const productsWithoutInventory = productIds.filter(id => !inventoryProductIds.includes(id))
    const consistencyPercentage = totalProducts > 0 ? ((totalProducts - productsWithoutInventory.length) / totalProducts) * 100 : 100

    // Basic stock analysis
    const lowStockCount = productsList.filter(p => (p.stock_quantity || 0) <= (p.min_stock_level || 5)).length
    const outOfStockCount = productsList.filter(p => (p.stock_quantity || 0) === 0).length

    // Financial calculations
    const totalInventoryValue = inventoryList.reduce((sum, inv) => sum + (inv.total_value || 0), 0)
    const totalProductValue = productsList.reduce((sum, p) => sum + ((p.cost_price || 0) * (p.stock_quantity || 0)), 0)
    const averageProductPrice = productsList.length > 0 ? productsList.reduce((sum, p) => sum + (p.price || 0), 0) / productsList.length : 0

    return NextResponse.json({
      overview: {
        total_products: totalProducts,
        total_inventory_items: totalInventoryItems,
        products_with_inventory: totalProducts - productsWithoutInventory.length,
        products_without_inventory: productsWithoutInventory.length,
        inventory_without_products: 0, // Simplified for now
        consistency_percentage: Math.round(consistencyPercentage * 100) / 100,
      },
      status_breakdown: {
        products: statusBreakdown,
        inventory: {
          in_stock: inventoryList.filter(inv => inv.status === 'in_stock').length,
          low_stock: inventoryList.filter(inv => inv.status === 'low_stock').length,
          out_of_stock: inventoryList.filter(inv => inv.status === 'out_of_stock').length,
          discontinued: inventoryList.filter(inv => inv.status === 'discontinued').length,
        },
        movement_trends: {
          increasing: 0,
          decreasing: 0,
          stable: inventoryList.length,
        },
      },
      financial: {
        total_inventory_value: totalInventoryValue,
        total_product_value: totalProductValue,
        average_product_price: Math.round(averageProductPrice * 100) / 100,
        average_inventory_value: inventoryList.length > 0 ? totalInventoryValue / inventoryList.length : 0,
        value_discrepancy: Math.abs(totalInventoryValue - totalProductValue),
      },
      consistency: {
        stock_consistency: 0, // Simplified for now
        price_consistency: 0, // Simplified for now
        cost_consistency: 0, // Simplified for now
        total_consistent: 0, // Simplified for now
      },
      stock_analysis: {
        low_stock_count: lowStockCount,
        out_of_stock_count: outOfStockCount,
        low_stock_percentage: totalProducts > 0 ? (lowStockCount / totalProducts) * 100 : 0,
        out_of_stock_percentage: totalProducts > 0 ? (outOfStockCount / totalProducts) * 100 : 0,
        needs_attention: lowStockCount + outOfStockCount,
      },
      recent_activity: {
        new_products_30_days: productsList.filter(p => {
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          return new Date(p.created_at) >= thirtyDaysAgo
        }).length,
        inventory_updates_30_days: 0, // Simplified for now
        total_activity: 0, // Simplified for now
      },
      alerts: {
        needs_sync: productsWithoutInventory.length > 0,
        low_stock_alert: lowStockCount > 0,
        out_of_stock_alert: outOfStockCount > 0,
        consistency_alert: consistencyPercentage < 90,
        high_discrepancy: Math.abs(totalInventoryValue - totalProductValue) > 10000,
      },
      recommendations: generateSimpleRecommendations({
        productsWithoutInventory: productsWithoutInventory.length,
        lowStockCount,
        outOfStockCount,
        consistencyPercentage,
        valueDiscrepancy: Math.abs(totalInventoryValue - totalProductValue),
      }),
    })

  } catch (error) {
    console.error('Simple unified products stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateSimpleRecommendations(data: {
  productsWithoutInventory: number
  lowStockCount: number
  outOfStockCount: number
  consistencyPercentage: number
  valueDiscrepancy: number
}) {
  const recommendations = []

  if (data.productsWithoutInventory > 0) {
    recommendations.push({
      type: 'sync',
      priority: 'high',
      title: 'Sync Missing Inventory Records',
      description: `${data.productsWithoutInventory} products don't have inventory records`,
      action: 'Run inventory sync to create missing records',
    })
  }

  if (data.consistencyPercentage < 90) {
    recommendations.push({
      type: 'consistency',
      priority: 'high',
      title: 'Improve Data Consistency',
      description: `Only ${data.consistencyPercentage.toFixed(1)}% of products have matching inventory records`,
      action: 'Run full data consistency check and sync',
    })
  }

  if (data.lowStockCount > 0) {
    recommendations.push({
      type: 'stock',
      priority: 'medium',
      title: 'Restock Low Inventory',
      description: `${data.lowStockCount} products are running low on stock`,
      action: 'Review and restock low inventory items',
    })
  }

  if (data.outOfStockCount > 0) {
    recommendations.push({
      type: 'stock',
      priority: 'high',
      title: 'Restock Out of Stock Items',
      description: `${data.outOfStockCount} products are completely out of stock`,
      action: 'Urgently restock out of stock items',
    })
  }

  return recommendations
}
