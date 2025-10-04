"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Package, 
  ShoppingCart, 
  Users, 
  Banknote, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Eye,
  Plus,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAnalytics } from "@/hooks/use-analytics"
import { useOrders } from "@/hooks/use-orders"
import { useProductsAnalytics } from "@/hooks/use-products-analytics"

export default function Dashboard() {
  const { data: analyticsData, loading: analyticsLoading, error: analyticsError } = useAnalytics({
    timeRange: '30days',
    autoRefresh: true,
    refreshInterval: 300000 // 5 minutes
  })

  const { data: ordersData, loading: ordersLoading, error: ordersError } = useOrders({
    limit: 5,
    sort_by: 'order_date',
    sort_order: 'desc',
    autoRefresh: true,
    refreshInterval: 300000 // 5 minutes
  })

  const { data: productsAnalytics, loading: productsLoading, error: productsError } = useProductsAnalytics({
    filters: {
      time_range: '30days'
    },
    autoRefresh: true,
    refreshInterval: 300000 // 5 minutes
  })

  // Transform products analytics data for dashboard compatibility
  const statsData = productsAnalytics ? {
    overview: {
      total_products: productsAnalytics.overview.total_products,
      total_inventory_items: productsAnalytics.overview.total_products,
      products_with_inventory: productsAnalytics.overview.total_products,
      products_without_inventory: 0,
      inventory_without_products: 0,
      consistency_percentage: 100,
    },
    status_breakdown: {
      products: {
        active: productsAnalytics.overview.active_products,
        inactive: productsAnalytics.overview.inactive_products,
        draft: productsAnalytics.overview.draft_products,
        archived: productsAnalytics.overview.archived_products,
      },
      inventory: {
        in_stock: productsAnalytics.overview.total_products - productsAnalytics.stock_analysis.low_stock_count - productsAnalytics.stock_analysis.out_of_stock_count,
        low_stock: productsAnalytics.stock_analysis.low_stock_count,
        out_of_stock: productsAnalytics.stock_analysis.out_of_stock_count,
        discontinued: 0,
      },
      movement_trends: {
        increasing: 0,
        decreasing: 0,
        stable: productsAnalytics.overview.total_products,
      },
    },
    stock_analysis: {
      low_stock_count: productsAnalytics.stock_analysis.low_stock_count,
      out_of_stock_count: productsAnalytics.stock_analysis.out_of_stock_count,
      low_stock_percentage: productsAnalytics.stock_analysis.low_stock_percentage,
      out_of_stock_percentage: productsAnalytics.stock_analysis.out_of_stock_percentage,
      needs_attention: productsAnalytics.stock_analysis.low_stock_count + productsAnalytics.stock_analysis.out_of_stock_count,
    },
    alerts: {
      needs_sync: false,
      low_stock_alert: productsAnalytics.stock_analysis.low_stock_count > 0,
      out_of_stock_alert: productsAnalytics.stock_analysis.out_of_stock_count > 0,
      consistency_alert: false,
      high_discrepancy: false,
    },
  } : null

  if ((analyticsLoading || productsLoading) && (!analyticsData || !statsData)) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (analyticsError || ordersError || productsError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">Failed to load dashboard data</p>
            <p className="text-sm text-gray-600">{analyticsError || ordersError || productsError}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!analyticsData || !statsData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No dashboard data available</p>
        </div>
      </div>
    )
  }

  const { metrics, topProducts } = analyticsData
  const recentOrders = ordersData?.orders || []
  const lowStockItems = statsData.stock_analysis.low_stock_count > 0 ? [
    { name: "Low Stock Alert", stock: statsData.stock_analysis.low_stock_count, threshold: statsData.overview.total_products }
  ] : []
  
  // Use products analytics top products if available, otherwise fall back to analytics top products
  const displayTopProducts = productsAnalytics?.top_products || topProducts

  return (
    <div className="h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">JulieCraft Dashboard</h1>
              <p className="text-gray-600 mt-1 text-base">Welcome back! Here&apos;s what&apos;s happening with your handmade business.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50 border-gray-300">
                <Eye className="w-4 h-4 mr-2" />
                View Store
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>

          {/* Product Insights and Alerts */}
          {productsAnalytics?.insights && productsAnalytics.insights.length > 0 && (
            <div className="space-y-3">
              {productsAnalytics.insights.slice(0, 3).map((insight, index) => (
                <Card key={index} className={`${
                  insight.type === 'critical' ? 'bg-red-50 border-red-200' :
                  insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className={`w-5 h-5 ${
                        insight.type === 'critical' ? 'text-red-600' :
                        insight.type === 'warning' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          insight.type === 'critical' ? 'text-red-800' :
                          insight.type === 'warning' ? 'text-yellow-800' :
                          'text-blue-800'
                        }`}>{insight.title}</h3>
                        <p className={`text-sm ${
                          insight.type === 'critical' ? 'text-red-700' :
                          insight.type === 'warning' ? 'text-yellow-700' :
                          'text-blue-700'
                        }`}>
                          {insight.message}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className={`${
                        insight.type === 'critical' ? 'border-red-300 text-red-700 hover:bg-red-100' :
                        insight.type === 'warning' ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-100' :
                        'border-blue-300 text-blue-700 hover:bg-blue-100'
                      }`}>
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Optimized Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="relative overflow-hidden bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10"></div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Banknote className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                    <TrendingUp className="h-2.5 w-2.5 mr-1" />
                    +{metrics.revenueGrowth.toFixed(1)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Total Revenue</p>
                  <p className="text-xl font-bold text-gray-900">{metrics.totalRevenue.toLocaleString()} UGX</p>
                  <p className="text-xs text-gray-500">+{(metrics.totalRevenue * metrics.revenueGrowth / 100).toLocaleString()} UGX from last month</p>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10"></div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-1.5 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                    <ShoppingCart className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                    <TrendingUp className="h-2.5 w-2.5 mr-1" />
                    +{metrics.ordersGrowth.toFixed(1)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Total Orders</p>
                  <p className="text-xl font-bold text-gray-900">{metrics.totalOrders}</p>
                  <p className="text-xs text-gray-500">+{Math.round(metrics.totalOrders * metrics.ordersGrowth / 100)} new orders this month</p>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10"></div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-1.5 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                    <Package className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                    <TrendingUp className="h-2.5 w-2.5 mr-1" />
                    +12.5%
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Total Products</p>
                  <p className="text-xl font-bold text-gray-900">{statsData.overview.total_products}</p>
                  <p className="text-xs text-gray-500">{statsData.status_breakdown.products.active} active products</p>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10"></div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                    <TrendingUp className="h-2.5 w-2.5 mr-1" />
                    +{metrics.customersGrowth.toFixed(1)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Total Customers</p>
                  <p className="text-xl font-bold text-gray-900">{metrics.totalCustomers}</p>
                  <p className="text-xs text-gray-500">+{Math.round(metrics.totalCustomers * metrics.customersGrowth / 100)} new customers this month</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <Card className="xl:col-span-2 bg-white border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900">Recent Orders</CardTitle>
                  <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {recentOrders.length > 0 ? recentOrders.map((order, index) => (
                    <div key={order.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="font-semibold text-gray-900">{order.order_number}</div>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-700 ring-1 ring-green-200' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-200' :
                              'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">{order.customer_name}</span> • {order.order_items[0]?.product_name || 'Multiple items'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">{order.total_amount.toLocaleString()} UGX</div>
                          <div className="text-xs text-gray-500">{new Date(order.order_date).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="p-6 text-center text-gray-500">
                      <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No recent orders</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Alerts */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center text-gray-900">
                  <div className="p-1.5 bg-red-100 rounded-lg mr-3">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  Low Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {lowStockItems.length > 0 ? lowStockItems.map((item, index) => (
                    <div key={index} className="p-4 hover:bg-red-50/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm mb-1">{item.name}</div>
                          <div className="flex items-center space-x-2">
                            <div className="text-xs text-red-600 font-medium">Only {item.stock} left</div>
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-red-500 h-1.5 rounded-full" 
                                style={{ width: `${(item.stock / item.threshold) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1">
                          Restock
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <div className="p-6 text-center text-gray-500">
                      <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>All products well stocked</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Products */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900">Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {displayTopProducts.length > 0 ? displayTopProducts.slice(0, 3).map((product, index) => (
                  <div key={index} className="group relative overflow-hidden bg-gradient-to-br from-blue-50 via-emerald-50 to-green-50 rounded-lg p-4 border border-blue-200/50 hover:shadow-md transition-all duration-300">
                    <div className="absolute top-2 right-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        #{product.rank || index + 1}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="font-semibold text-gray-900 text-lg leading-tight pr-10">
                        {product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Price</span>
                          <span className="font-medium text-gray-900">{product.price?.toLocaleString()} UGX</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Stock</span>
                          <span className="font-medium text-gray-900">{product.stock || product.sales || 0}</span>
                        </div>
                        {product.estimated_revenue && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Est. Revenue</span>
                            <span className="font-semibold text-green-600">{(product.estimated_revenue / 1000000).toFixed(1)}M UGX</span>
                          </div>
                        )}
                      </div>
                      <div className="pt-2 border-t border-blue-200/50">
                        <div className="text-xs text-blue-700 font-medium">
                          {productsAnalytics?.top_products ? 'Top performer' : 'Best seller'}
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-3 text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No product data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}