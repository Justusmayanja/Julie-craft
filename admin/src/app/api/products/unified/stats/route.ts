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

    // Get comprehensive stats from both products and inventory tables
    const [
      productsStats,
      inventoryStats
    ] = await Promise.all([
      // Products table stats
      supabase
        .from('products')
        .select('id, status, price, cost_price, stock_quantity, min_stock_level, created_at', { count: 'exact' }),

      // Inventory table stats
      supabase
        .from('inventory')
        .select('id, product_id, current_stock, min_stock, unit_cost, unit_price, total_value, status, movement_trend, updated_at', { count: 'exact' })
    ])

    if (productsStats.error) throw new Error(`Products stats error: ${productsStats.error.message}`)
    if (inventoryStats.error) throw new Error(`Inventory stats error: ${inventoryStats.error.message}`)

    const products = productsStats.data || []
    const inventory = inventoryStats.data || []
    
    // Calculate consistency metrics manually
    const productIds = products.map(p => p.id)
    const inventoryProductIds = inventory.map(inv => inv.product_id).filter(Boolean)
    const productsWithoutInventory = productIds.filter(id => !inventoryProductIds.includes(id))
    const inventoryWithoutProducts = inventoryProductIds.filter(id => !productIds.includes(id))
    
    // Calculate stock metrics manually
    const lowStockProducts = products.filter(p => {
      const inv = inventory.find(i => i.product_id === p.id)
      const currentStock = inv?.current_stock ?? p.stock_quantity ?? 0
      const minStock = inv?.min_stock ?? p.min_stock_level ?? 5
      return currentStock <= minStock
    })
    
    const outOfStockProducts = products.filter(p => {
      const inv = inventory.find(i => i.product_id === p.id)
      const currentStock = inv?.current_stock ?? p.stock_quantity ?? 0
      return currentStock === 0
    })

    // Calculate comprehensive statistics
    const totalProducts = products.length
    const totalInventoryItems = inventory.length

    // Status breakdown
    const statusBreakdown = {
      active: products.filter(p => p.status === 'active').length,
      inactive: products.filter(p => p.status === 'inactive').length,
      draft: products.filter(p => p.status === 'draft').length,
      archived: products.filter(p => p.status === 'archived').length,
    }

    // Inventory status breakdown
    const inventoryStatusBreakdown = {
      in_stock: inventory.filter(inv => inv.status === 'in_stock').length,
      low_stock: inventory.filter(inv => inv.status === 'low_stock').length,
      out_of_stock: inventory.filter(inv => inv.status === 'out_of_stock').length,
      discontinued: inventory.filter(inv => inv.status === 'discontinued').length,
    }

    // Movement trend breakdown
    const movementTrendBreakdown = {
      increasing: inventory.filter(inv => inv.movement_trend === 'increasing').length,
      decreasing: inventory.filter(inv => inv.movement_trend === 'decreasing').length,
      stable: inventory.filter(inv => inv.movement_trend === 'stable').length,
    }

    // Financial calculations
    const totalInventoryValue = inventory.reduce((sum, inv) => sum + (inv.total_value || 0), 0)
    const totalProductValue = products.reduce((sum, p) => sum + ((p.cost_price || 0) * (p.stock_quantity || 0)), 0)
    const averageProductPrice = products.length > 0 ? products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length : 0
    const averageInventoryValue = inventory.length > 0 ? totalInventoryValue / inventory.length : 0

    // Consistency metrics
    const consistencyMetrics = {
      products_with_inventory: totalProducts - productsWithoutInventory.length,
      products_without_inventory: productsWithoutInventory.length,
      inventory_without_products: inventoryWithoutProducts.length,
      consistency_percentage: totalProducts > 0 ? ((totalProducts - productsWithoutInventory.length) / totalProducts) * 100 : 0,
      stock_consistency: products.filter(p => {
        const inv = inventory.find(i => i.id === p.id)
        return inv ? inv.current_stock === p.stock_quantity : false
      }).length,
      price_consistency: products.filter(p => {
        const inv = inventory.find(i => i.id === p.id)
        return inv ? inv.unit_price === p.price : false
      }).length,
    }

    // Low stock and out of stock analysis
    const stockAnalysis = {
      low_stock_count: lowStockProducts.length,
      out_of_stock_count: outOfStockProducts.length,
      low_stock_percentage: totalProducts > 0 ? (lowStockProducts.length / totalProducts) * 100 : 0,
      out_of_stock_percentage: totalProducts > 0 ? (outOfStockProducts.length / totalProducts) * 100 : 0,
      needs_attention: lowStockProducts.length + outOfStockProducts.length,
    }

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentProducts = products.filter(p => new Date(p.created_at) >= thirtyDaysAgo).length
    const recentInventoryUpdates = inventory.filter(inv => 
      inv.updated_at && new Date(inv.updated_at) >= thirtyDaysAgo
    ).length

    return NextResponse.json({
      overview: {
        total_products: totalProducts,
        total_inventory_items: totalInventoryItems,
        products_with_inventory: consistencyMetrics.products_with_inventory,
        products_without_inventory: productsWithoutInventory.length,
        inventory_without_products: inventoryWithoutProducts.length,
        consistency_percentage: Math.round(consistencyMetrics.consistency_percentage * 100) / 100,
      },
      status_breakdown: {
        products: statusBreakdown,
        inventory: inventoryStatusBreakdown,
        movement_trends: movementTrendBreakdown,
      },
      financial: {
        total_inventory_value: totalInventoryValue,
        total_product_value: totalProductValue,
        average_product_price: Math.round(averageProductPrice * 100) / 100,
        average_inventory_value: Math.round(averageInventoryValue * 100) / 100,
        value_discrepancy: Math.abs(totalInventoryValue - totalProductValue),
      },
      consistency: {
        stock_consistency: consistencyMetrics.stock_consistency,
        price_consistency: consistencyMetrics.price_consistency,
        cost_consistency: products.filter(p => {
          const inv = inventory.find(i => i.id === p.id)
          return inv ? inv.unit_cost === p.cost_price : false
        }).length,
        total_consistent: consistencyMetrics.stock_consistency + consistencyMetrics.price_consistency,
      },
      stock_analysis: stockAnalysis,
      recent_activity: {
        new_products_30_days: recentProducts,
        inventory_updates_30_days: recentInventoryUpdates,
        total_activity: recentProducts + recentInventoryUpdates,
      },
      alerts: {
        needs_sync: productsWithoutInventory.length > 0 || inventoryWithoutProducts.length > 0,
        low_stock_alert: lowStockProducts.length > 0,
        out_of_stock_alert: outOfStockProducts.length > 0,
        consistency_alert: consistencyMetrics.consistency_percentage < 90,
        high_discrepancy: Math.abs(totalInventoryValue - totalProductValue) > 10000,
      },
      recommendations: generateRecommendations({
        productsWithoutInventory: productsWithoutInventory.length,
        inventoryWithoutProducts: inventoryWithoutProducts.length,
        lowStockProducts: lowStockProducts.length,
        outOfStockProducts: outOfStockProducts.length,
        consistencyPercentage: consistencyMetrics.consistency_percentage,
        valueDiscrepancy: Math.abs(totalInventoryValue - totalProductValue),
      }),
    })

  } catch (error) {
    console.error('Unified products stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateRecommendations(data: {
  productsWithoutInventory: number
  inventoryWithoutProducts: number
  lowStockProducts: number
  outOfStockProducts: number
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

  if (data.inventoryWithoutProducts > 0) {
    recommendations.push({
      type: 'cleanup',
      priority: 'medium',
      title: 'Clean Up Orphaned Inventory',
      description: `${data.inventoryWithoutProducts} inventory records don't have corresponding products`,
      action: 'Review and remove orphaned inventory records',
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

  if (data.lowStockProducts > 0) {
    recommendations.push({
      type: 'stock',
      priority: 'medium',
      title: 'Restock Low Inventory',
      description: `${data.lowStockProducts} products are running low on stock`,
      action: 'Review and restock low inventory items',
    })
  }

  if (data.outOfStockProducts > 0) {
    recommendations.push({
      type: 'stock',
      priority: 'high',
      title: 'Restock Out of Stock Items',
      description: `${data.outOfStockProducts} products are completely out of stock`,
      action: 'Urgently restock out of stock items',
    })
  }

  if (data.valueDiscrepancy > 10000) {
    recommendations.push({
      type: 'financial',
      priority: 'medium',
      title: 'Review Financial Discrepancies',
      description: `Significant value discrepancy between products and inventory (${data.valueDiscrepancy.toLocaleString()} UGX)`,
      action: 'Review pricing and cost data for consistency',
    })
  }

  return recommendations
}
