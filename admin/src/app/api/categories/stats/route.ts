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

    // Get categories with product counts
    const { data: categoriesWithCounts, error: categoriesError } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        description,
        is_active,
        sort_order,
        created_at,
        products:products(count)
      `)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (categoriesError) {
      throw new Error(`Failed to fetch categories: ${categoriesError.message}`)
    }

    // Get total products per category with more details
    const { data: categoryStats, error: statsError } = await supabase
      .from('products')
      .select(`
        category_id,
        category:categories(name),
        price,
        stock_quantity,
        status
      `)

    if (statsError) {
      throw new Error(`Failed to fetch category stats: ${statsError.message}`)
    }

    // Process the data to get comprehensive stats
    const categoryStatsMap = new Map()
    
    // Initialize all categories
    categoriesWithCounts?.forEach(category => {
      categoryStatsMap.set(category.id, {
        id: category.id,
        name: category.name,
        description: category.description,
        is_active: category.is_active,
        sort_order: category.sort_order,
        created_at: category.created_at,
        total_products: 0,
        active_products: 0,
        inactive_products: 0,
        draft_products: 0,
        total_revenue: 0,
        total_inventory_value: 0,
        average_price: 0,
        low_stock_products: 0
      })
    })

    // Calculate stats from products
    categoryStats?.forEach(product => {
      if (product.category_id && categoryStatsMap.has(product.category_id)) {
        const stats = categoryStatsMap.get(product.category_id)
        stats.total_products++
        
        // Count by status
        if (product.status === 'active') {
          stats.active_products++
        } else if (product.status === 'inactive') {
          stats.inactive_products++
        } else if (product.status === 'draft') {
          stats.draft_products++
        }
        
        // Calculate revenue (assuming all active products are sold)
        if (product.status === 'active') {
          stats.total_revenue += product.price || 0
        }
        
        // Calculate inventory value
        stats.total_inventory_value += (product.price || 0) * (product.stock_quantity || 0)
        
        // Count low stock products
        if ((product.stock_quantity || 0) <= 5) {
          stats.low_stock_products++
        }
      }
    })

    // Calculate average prices
    categoryStatsMap.forEach(stats => {
      if (stats.total_products > 0) {
        stats.average_price = stats.total_inventory_value / stats.total_products
      }
    })

    // Convert map to array and sort
    const result = Array.from(categoryStatsMap.values()).sort((a, b) => {
      if (a.sort_order !== b.sort_order) {
        return (a.sort_order || 0) - (b.sort_order || 0)
      }
      return a.name.localeCompare(b.name)
    })

    // Get overall statistics
    const totalCategories = result.length
    const activeCategories = result.filter(c => c.is_active).length
    const inactiveCategories = totalCategories - activeCategories
    const totalProducts = result.reduce((sum, c) => sum + c.total_products, 0)
    const totalRevenue = result.reduce((sum, c) => sum + c.total_revenue, 0)
    const totalInventoryValue = result.reduce((sum, c) => sum + c.total_inventory_value, 0)

    return NextResponse.json({
      categories: result,
      summary: {
        total_categories: totalCategories,
        active_categories: activeCategories,
        inactive_categories: inactiveCategories,
        total_products: totalProducts,
        total_revenue: totalRevenue,
        total_inventory_value: totalInventoryValue,
        average_products_per_category: totalCategories > 0 ? totalProducts / totalCategories : 0
      }
    })

  } catch (error) {
    console.error('Category stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
