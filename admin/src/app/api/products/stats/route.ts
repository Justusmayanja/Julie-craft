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

    // Get total products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    // Get active products
    const { count: activeProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Get low stock products
    const { count: lowStockProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lte('stock_quantity', 5)

    // Get featured products
    const { count: featuredProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('featured', true)

    // Get inventory value and average price
    const { data: priceData, error: priceError } = await supabase
      .from('products')
      .select('price, stock_quantity')

    if (priceError) {
      console.error('Database error:', priceError)
      return NextResponse.json({ error: 'Failed to fetch price data' }, { status: 500 })
    }

    const totalInventoryValue = priceData?.reduce((sum, product) => {
      return sum + (product.price * product.stock_quantity)
    }, 0) || 0

    const averagePrice = priceData?.length ? 
      priceData.reduce((sum, product) => sum + product.price, 0) / priceData.length : 0

    const stats = {
      total_products: totalProducts || 0,
      active_products: activeProducts || 0,
      low_stock_products: lowStockProducts || 0,
      total_inventory_value: totalInventoryValue,
      average_price: averagePrice,
      featured_products: featuredProducts || 0
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
