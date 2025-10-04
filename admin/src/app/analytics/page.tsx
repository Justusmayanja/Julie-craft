"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Banknote,
  ShoppingCart,
  Users,
  Package,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Loader2
} from "lucide-react"
import { useAnalytics } from "@/hooks/use-analytics"
import { RevenueChart } from "@/components/charts/revenue-chart"
import { CategoryPieChart } from "@/components/charts/category-pie-chart"
import { OrdersChart } from "@/components/charts/orders-chart"
import { TopProductsChart } from "@/components/charts/top-products-chart"
import { MetricsComparisonChart } from "@/components/charts/metrics-comparison-chart"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("6months")

  const timeRangeOptions = [
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "3months", label: "Last 3 Months" },
    { value: "6months", label: "Last 6 Months" },
    { value: "1year", label: "Last Year" },
  ]

  const { data: analyticsData, loading, error, refresh } = useAnalytics({
    timeRange,
    autoRefresh: true,
    refreshInterval: 300000 // 5 minutes
  })

  if (loading && !analyticsData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <TrendingDown className="w-8 h-8 mx-auto mb-2" />
            <p className="font-semibold">Failed to load analytics</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No analytics data available</p>
        </div>
      </div>
    )
  }

  const { metrics, topProducts, categoryPerformance, salesTrend } = analyticsData

  return (
    <div className="h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">JulieCraft Analytics</h1>
              <p className="text-gray-600 mt-1 text-base">Track performance and gain insights into your craft business</p>
            </div>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex flex-wrap gap-2">
                {timeRangeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={timeRange === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange(option.value)}
                    className={timeRange === option.value ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-white hover:bg-blue-50 hover:text-blue-700 border-gray-300"}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2 lg:ml-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white hover:bg-gray-50 border-gray-300"
                  onClick={refresh}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50 border-gray-300">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="relative overflow-hidden bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10"></div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Banknote className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                    <ArrowUp className="h-2.5 w-2.5 mr-1" />
                    +{metrics.revenueGrowth.toFixed(1)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Total Revenue</p>
                  <p className="text-xl font-bold text-gray-900">{metrics.totalRevenue.toLocaleString()} UGX</p>
                  <p className="text-xs text-gray-500">+{(metrics.totalRevenue * metrics.revenueGrowth / 100).toLocaleString()} UGX from last period</p>
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
                    <ArrowUp className="h-2.5 w-2.5 mr-1" />
                    +{metrics.ordersGrowth.toFixed(1)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Total Orders</p>
                  <p className="text-xl font-bold text-gray-900">{metrics.totalOrders}</p>
                  <p className="text-xs text-gray-500">+{Math.round(metrics.totalOrders * metrics.ordersGrowth / 100)} new orders this period</p>
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
                    <ArrowUp className="h-2.5 w-2.5 mr-1" />
                    +{metrics.customersGrowth.toFixed(1)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">New Customers</p>
                  <p className="text-xl font-bold text-gray-900">{metrics.totalCustomers}</p>
                  <p className="text-xs text-gray-500">+{Math.round(metrics.totalCustomers * metrics.customersGrowth / 100)} new customers this period</p>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10"></div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-1.5 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                    <BarChart3 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                    <ArrowUp className="h-2.5 w-2.5 mr-1" />
                    +{metrics.aovGrowth.toFixed(1)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-xl font-bold text-gray-900">{metrics.avgOrderValue.toLocaleString()} UGX</p>
                  <p className="text-xs text-gray-500">+{(metrics.avgOrderValue * metrics.aovGrowth / 100).toLocaleString()} UGX from last period</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Revenue Trend</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <RevenueChart data={salesTrend} height={300} />
              </CardContent>
            </Card>

            {/* Category Performance Pie Chart */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                  <div className="p-1.5 bg-emerald-100 rounded-lg">
                    <Package className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span>Category Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <CategoryPieChart data={categoryPerformance} height={300} />
              </CardContent>
            </Card>
          </div>

          {/* Additional Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders & Customers Chart */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                  <div className="p-1.5 bg-emerald-100 rounded-lg">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span>Orders & Customers</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <OrdersChart data={salesTrend} height={300} />
              </CardContent>
            </Card>

            {/* Top Products Chart */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <Package className="w-4 h-4 text-purple-600" />
                  </div>
                  <span>Top Products by Revenue</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <TopProductsChart data={topProducts} height={300} />
              </CardContent>
            </Card>
          </div>

          {/* Metrics Comparison Chart */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <span>Performance Comparison</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">Normalized comparison of revenue, orders, and customers over time</p>
            </CardHeader>
            <CardContent className="p-4">
              <MetricsComparisonChart data={salesTrend} height={350} />
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Metrics */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                    <div>
                      <div className="font-semibold text-gray-900">Conversion Rate</div>
                      <div className="text-sm text-gray-600">Visitors to customers</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{metrics.conversionRate}%</div>
                      <div className="flex items-center">
                        <ArrowUp className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">+{metrics.conversionGrowth}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
                    <div>
                      <div className="font-semibold text-gray-900">Return Rate</div>
                      <div className="text-sm text-gray-600">Customer returns</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{metrics.returnRate}%</div>
                      <div className="flex items-center">
                        <ArrowDown className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">{metrics.returnGrowth}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                    <div>
                      <div className="font-semibold text-gray-900">Repeat Customers</div>
                      <div className="text-sm text-gray-600">Customer loyalty</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">68%</div>
                      <div className="flex items-center">
                        <ArrowUp className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">+3.2%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Insights */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Business Insights</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50/50 rounded-lg border-l-4 border-blue-500">
                    <div className="font-semibold text-gray-900 text-sm">Peak Sales Day</div>
                    <div className="text-gray-600 text-sm">Saturdays generate 23% more revenue</div>
                  </div>

                  <div className="p-4 bg-emerald-50/50 rounded-lg border-l-4 border-emerald-500">
                    <div className="font-semibold text-gray-900 text-sm">Top Customer Segment</div>
                    <div className="text-gray-600 text-sm">Women 25-45 represent 68% of sales</div>
                  </div>

                  <div className="p-4 bg-blue-50/50 rounded-lg border-l-4 border-blue-500">
                    <div className="font-semibold text-gray-900 text-sm">Seasonal Trend</div>
                    <div className="text-gray-600 text-sm">Holiday season shows 45% increase</div>
                  </div>

                  <div className="p-4 bg-emerald-50/50 rounded-lg border-l-4 border-emerald-500">
                    <div className="font-semibold text-gray-900 text-sm">Popular Price Range</div>
                    <div className="text-gray-600 text-sm">195,000-585,000 UGX items sell the most</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Products Summary */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Top Products</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {topProducts.slice(0, 5).map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg hover:bg-blue-50/30 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{product.name.length > 25 ? product.name.substring(0, 25) + '...' : product.name}</div>
                          <div className="text-xs text-gray-500">{product.sales} sales</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 text-sm">{(product.revenue / 1000000).toFixed(1)}M</div>
                        {product.growth !== undefined && (
                          <div className="flex items-center">
                            {product.growth > 0 ? (
                              <ArrowUp className="w-3 h-3 text-green-500" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-red-500" />
                            )}
                            <span className={`text-xs font-medium ${product.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {Math.abs(product.growth).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
