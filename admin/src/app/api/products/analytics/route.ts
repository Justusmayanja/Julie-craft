import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const analyticsFiltersSchema = z.object({
  time_range: z.enum(['7days', '30days', '3months', '6months', '1year']).default('30days'),
  category_id: z.string().uuid().optional(),
  status: z.enum(['active', 'inactive', 'draft', 'archived']).optional(),
  low_stock: z.boolean().optional(),
  out_of_stock: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    // Parse and validate filters
    const filters = {
      time_range: searchParams.get('time_range') as any || '30days',
      category_id: searchParams.get('category_id') || undefined,
      status: searchParams.get('status') as any || undefined,
      low_stock: searchParams.get('low_stock') === 'true',
      out_of_stock: searchParams.get('out_of_stock') === 'true',
    }

    const validatedFilters = analyticsFiltersSchema.parse(filters)

    // Calculate date range
    const now = new Date()
    const dateFrom = new Date()
    
    switch (validatedFilters.time_range) {
      case '7days':
        dateFrom.setDate(now.getDate() - 7)
        break
      case '30days':
        dateFrom.setDate(now.getDate() - 30)
        break
      case '3months':
        dateFrom.setMonth(now.getMonth() - 3)
        break
      case '6months':
        dateFrom.setMonth(now.getMonth() - 6)
        break
      case '1year':
        dateFrom.setFullYear(now.getFullYear() - 1)
        break
    }

    // Get comprehensive product analytics
    const [
      productsStats,
      categoryStats,
      stockAnalysis,
      recentActivity,
      topProducts,
      lowStockProducts,
      outOfStockProducts
    ] = await Promise.all([
      // Basic products statistics
      supabase
        .from('products')
        .select('id, name, status, price, cost_price, stock_quantity, min_stock_level, max_stock_level, created_at, updated_at'),

      // Category performance
      supabase
        .from('products')
        .select(`
          category_id,
          category_name,
          price,
          cost_price,
          stock_quantity,
          status,
          categories!inner(name, description)
        `),

      // Stock analysis
      supabase
        .from('products')
        .select('id, name, stock_quantity, min_stock_level, max_stock_level, price, cost_price, status'),

      // Recent activity (products created/updated in time range)
      supabase
        .from('products')
        .select('id, name, created_at, updated_at, status')
        .or(`created_at.gte.${dateFrom.toISOString()},updated_at.gte.${dateFrom.toISOString()}`),

      // Top performing products (based on stock movement - this would ideally come from order_items)
      supabase
        .from('products')
        .select('id, name, price, stock_quantity, status')
        .eq('status', 'active')
        .order('price', { ascending: false })
        .limit(10),

      // Low stock products - we'll filter this in JavaScript instead
      supabase
        .from('products')
        .select('id, name, stock_quantity, min_stock_level, price, status'),

      // Out of stock products
      supabase
        .from('products')
        .select('id, name, stock_quantity, price, status')
        .eq('stock_quantity', 0)
    ])

    if (productsStats.error) throw new Error(`Products stats error: ${productsStats.error.message}`)
    if (categoryStats.error) throw new Error(`Category stats error: ${categoryStats.error.message}`)
    if (stockAnalysis.error) throw new Error(`Stock analysis error: ${stockAnalysis.error.message}`)
    if (recentActivity.error) throw new Error(`Recent activity error: ${recentActivity.error.message}`)
    if (topProducts.error) throw new Error(`Top products error: ${topProducts.error.message}`)
    if (lowStockProducts.error) throw new Error(`Low stock products error: ${lowStockProducts.error.message}`)
    if (outOfStockProducts.error) throw new Error(`Out of stock products error: ${outOfStockProducts.error.message}`)

    const products = productsStats.data || []
    const categories = categoryStats.data || []
    const stockData = stockAnalysis.data || []
    const recent = recentActivity.data || []
    const top = topProducts.data || []
    const allProductsForStockCheck = lowStockProducts.data || []
    const outOfStock = outOfStockProducts.data || []
    
    // Filter low stock products in JavaScript
    const lowStock = allProductsForStockCheck.filter(product => 
      product.stock_quantity !== null && 
      product.min_stock_level !== null && 
      product.stock_quantity <= product.min_stock_level
    )

    // Calculate comprehensive analytics
    const totalProducts = products.length
    const activeProducts = products.filter(p => p.status === 'active').length
    const inactiveProducts = products.filter(p => p.status === 'inactive').length
    const draftProducts = products.filter(p => p.status === 'draft').length
    const archivedProducts = products.filter(p => p.status === 'archived').length

    // Financial analysis
    const totalInventoryValue = products.reduce((sum, p) => sum + ((p.cost_price || 0) * (p.stock_quantity || 0)), 0)
    const totalRetailValue = products.reduce((sum, p) => sum + (p.price * (p.stock_quantity || 0)), 0)
    const averageProductPrice = products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0
    const averageCostPrice = products.length > 0 ? products.reduce((sum, p) => sum + (p.cost_price || 0), 0) / products.length : 0

    // Stock analysis
    const totalStock = products.reduce((sum, p) => sum + (p.stock_quantity || 0), 0)
    const lowStockCount = products.filter(p => (p.stock_quantity || 0) <= (p.min_stock_level || 5)).length
    const outOfStockCount = products.filter(p => (p.stock_quantity || 0) === 0).length
    const overstockCount = products.filter(p => (p.stock_quantity || 0) > (p.max_stock_level || 100)).length

    // Category performance analysis
    const categoryPerformance = categories.reduce((acc, product) => {
      const categoryName = product.category_name || 'Uncategorized'
      if (!acc[categoryName]) {
        acc[categoryName] = {
          name: categoryName,
          product_count: 0,
          total_value: 0,
          total_stock: 0,
          average_price: 0,
          active_products: 0
        }
      }
      
      acc[categoryName].product_count++
      acc[categoryName].total_value += (product.cost_price || 0) * (product.stock_quantity || 0)
      acc[categoryName].total_stock += product.stock_quantity || 0
      acc[categoryName].average_price += product.price
      if (product.status === 'active') acc[categoryName].active_products++
      
      return acc
    }, {} as Record<string, any>)

    // Calculate averages for categories
    Object.values(categoryPerformance).forEach((cat: any) => {
      cat.average_price = cat.product_count > 0 ? cat.average_price / cat.product_count : 0
    })

    // Recent activity analysis
    const newProducts = recent.filter(p => new Date(p.created_at) >= dateFrom).length
    const updatedProducts = recent.filter(p => 
      p.updated_at && new Date(p.updated_at) >= dateFrom && new Date(p.updated_at) > new Date(p.created_at)
    ).length

    // Top products analysis (simplified - in real scenario this would use order data)
    const topProductsAnalysis = top.slice(0, 5).map((product, index) => ({
      rank: index + 1,
      name: product.name,
      price: product.price,
      stock: product.stock_quantity || 0,
      estimated_sales: Math.floor(Math.random() * 50) + 10, // Placeholder - would come from order_items
      estimated_revenue: product.price * (Math.floor(Math.random() * 50) + 10)
    }))

    // Inventory health metrics
    const inventoryHealth = {
      overall_score: Math.max(0, 100 - (lowStockCount * 5) - (outOfStockCount * 10) - (overstockCount * 2)),
      stock_turnover_estimate: totalInventoryValue > 0 ? (totalRetailValue / totalInventoryValue) : 0,
      reorder_needed: lowStockCount + outOfStockCount,
      overstock_items: overstockCount,
      stock_efficiency: totalProducts > 0 ? ((totalProducts - lowStockCount - outOfStockCount) / totalProducts) * 100 : 100
    }

    // Generate insights and recommendations
    const insights = generateInsights({
      totalProducts,
      activeProducts,
      lowStockCount,
      outOfStockCount,
      overstockCount,
      totalInventoryValue,
      totalRetailValue,
      inventoryHealth,
      categoryPerformance
    })

    return NextResponse.json({
      overview: {
        total_products: totalProducts,
        active_products: activeProducts,
        inactive_products: inactiveProducts,
        draft_products: draftProducts,
        archived_products: archivedProducts,
        total_stock: totalStock,
        total_inventory_value: totalInventoryValue,
        total_retail_value: totalRetailValue,
        average_product_price: Math.round(averageProductPrice * 100) / 100,
        average_cost_price: Math.round(averageCostPrice * 100) / 100,
      },
      stock_analysis: {
        low_stock_count: lowStockCount,
        out_of_stock_count: outOfStockCount,
        overstock_count: overstockCount,
        low_stock_percentage: totalProducts > 0 ? (lowStockCount / totalProducts) * 100 : 0,
        out_of_stock_percentage: totalProducts > 0 ? (outOfStockCount / totalProducts) * 100 : 0,
        overstock_percentage: totalProducts > 0 ? (overstockCount / totalProducts) * 100 : 0,
        stock_efficiency: Math.round(inventoryHealth.stock_efficiency * 100) / 100,
      },
      category_performance: Object.values(categoryPerformance).map((cat: any) => ({
        name: cat.name,
        product_count: cat.product_count,
        active_products: cat.active_products,
        total_value: Math.round(cat.total_value * 100) / 100,
        total_stock: cat.total_stock,
        average_price: Math.round(cat.average_price * 100) / 100,
        performance_score: Math.round((cat.active_products / cat.product_count) * 100)
      })),
      top_products: topProductsAnalysis,
      recent_activity: {
        new_products: newProducts,
        updated_products: updatedProducts,
        total_activity: newProducts + updatedProducts,
        time_range: validatedFilters.time_range,
      },
      inventory_health: inventoryHealth,
      insights: insights,
      filters: validatedFilters,
    })

  } catch (error) {
    console.error('Products analytics error:', error)
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateInsights(data: {
  totalProducts: number
  activeProducts: number
  lowStockCount: number
  outOfStockCount: number
  overstockCount: number
  totalInventoryValue: number
  totalRetailValue: number
  inventoryHealth: any
  categoryPerformance: any
}) {
  const insights = []

  // Stock level insights
  if (data.lowStockCount > 0) {
    insights.push({
      type: 'warning',
      title: 'Low Stock Alert',
      message: `${data.lowStockCount} products are running low on stock`,
      action: 'Review and restock low inventory items',
      priority: 'high'
    })
  }

  if (data.outOfStockCount > 0) {
    insights.push({
      type: 'critical',
      title: 'Out of Stock Items',
      message: `${data.outOfStockCount} products are completely out of stock`,
      action: 'Urgently restock out of stock items',
      priority: 'critical'
    })
  }

  if (data.overstockCount > 0) {
    insights.push({
      type: 'info',
      title: 'Overstock Items',
      message: `${data.overstockCount} products have excess inventory`,
      action: 'Consider promotions or reducing reorder quantities',
      priority: 'medium'
    })
  }

  // Performance insights
  const activePercentage = data.totalProducts > 0 ? (data.activeProducts / data.totalProducts) * 100 : 0
  if (activePercentage < 80) {
    insights.push({
      type: 'warning',
      title: 'Low Active Product Rate',
      message: `Only ${activePercentage.toFixed(1)}% of products are active`,
      action: 'Review inactive products and consider reactivating or removing them',
      priority: 'medium'
    })
  }

  // Inventory health insights
  if (data.inventoryHealth.overall_score < 70) {
    insights.push({
      type: 'warning',
      title: 'Inventory Health Concern',
      message: `Inventory health score is ${data.inventoryHealth.overall_score}/100`,
      action: 'Review stock levels and reorder points',
      priority: 'high'
    })
  }

  // Financial insights
  const markupRatio = data.totalInventoryValue > 0 ? data.totalRetailValue / data.totalInventoryValue : 0
  if (markupRatio > 0 && markupRatio < 1.5) {
    insights.push({
      type: 'info',
      title: 'Low Markup Ratio',
      message: `Average markup ratio is ${markupRatio.toFixed(2)}x`,
      action: 'Consider reviewing pricing strategy',
      priority: 'low'
    })
  }

  return insights
}
