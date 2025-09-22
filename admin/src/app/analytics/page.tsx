"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Banknote,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  ArrowUp,
  ArrowDown
} from "lucide-react"

// Mock data - replace with real data from your database (UGX - Ugandan Shilling)
const salesData = [
  { month: "Jan", revenue: 17550000, orders: 45, customers: 32 },
  { month: "Feb", revenue: 20280000, orders: 52, customers: 38 },
  { month: "Mar", revenue: 18720000, orders: 48, customers: 35 },
  { month: "Apr", revenue: 23790000, orders: 61, customers: 42 },
  { month: "May", revenue: 28470000, orders: 73, customers: 48 },
  { month: "Jun", revenue: 34710000, orders: 89, customers: 56 },
]

const topProducts = [
  { name: "Ceramic Bowl Set", sales: 145, revenue: 50750000, growth: 12.5 },
  { name: "Silver Wire Bracelet", sales: 98, revenue: 25970000, growth: 8.3 },
  { name: "Wool Throw Blanket", sales: 67, revenue: 40870000, growth: -2.1 },
  { name: "Copper Earrings", sales: 89, revenue: 10235000, growth: 15.7 },
  { name: "Blue Glazed Vase", sales: 34, revenue: 16320000, growth: -5.2 },
]

const categoryPerformance = [
  { name: "Pottery", revenue: 72150000, percentage: 35, growth: 8.2 },
  { name: "Jewelry", revenue: 59280000, percentage: 29, growth: 12.1 },
  { name: "Textiles", revenue: 49920000, percentage: 24, growth: -1.5 },
  { name: "Woodwork", revenue: 24570000, percentage: 12, growth: 5.8 },
]

const recentMetrics = {
  totalRevenue: 205920000,
  revenueGrowth: 15.2,
  totalOrders: 324,
  ordersGrowth: 8.7,
  totalCustomers: 156,
  customersGrowth: 12.3,
  avgOrderValue: 635400,
  aovGrowth: 6.1,
  conversionRate: 3.2,
  conversionGrowth: 0.5,
  returnRate: 2.1,
  returnGrowth: -0.3,
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("6months")

  const timeRangeOptions = [
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "3months", label: "Last 3 Months" },
    { value: "6months", label: "Last 6 Months" },
    { value: "1year", label: "Last Year" },
  ]

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
                <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50 border-gray-300">
                  <RefreshCw className="w-4 h-4 mr-2" />
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
                    +{recentMetrics.revenueGrowth}%
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Total Revenue</p>
                  <p className="text-xl font-bold text-gray-900">{recentMetrics.totalRevenue.toLocaleString()} UGX</p>
                  <p className="text-xs text-gray-500">+{(recentMetrics.totalRevenue * recentMetrics.revenueGrowth / 100).toLocaleString()} UGX from last period</p>
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
                    +{recentMetrics.ordersGrowth}%
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Total Orders</p>
                  <p className="text-xl font-bold text-gray-900">{recentMetrics.totalOrders}</p>
                  <p className="text-xs text-gray-500">+{Math.round(recentMetrics.totalOrders * recentMetrics.ordersGrowth / 100)} new orders this period</p>
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
                    +{recentMetrics.customersGrowth}%
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">New Customers</p>
                  <p className="text-xl font-bold text-gray-900">{recentMetrics.totalCustomers}</p>
                  <p className="text-xs text-gray-500">+{Math.round(recentMetrics.totalCustomers * recentMetrics.customersGrowth / 100)} new customers this period</p>
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
                    +{recentMetrics.aovGrowth}%
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-xl font-bold text-gray-900">{recentMetrics.avgOrderValue.toLocaleString()} UGX</p>
                  <p className="text-xs text-gray-500">+{(recentMetrics.avgOrderValue * recentMetrics.aovGrowth / 100).toLocaleString()} UGX from last period</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>Sales Trend</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {salesData.map((data, index) => (
                    <div key={data.month} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg hover:bg-blue-50/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-sm font-medium shadow-sm">
                          {data.month.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{data.month}</div>
                          <div className="text-sm text-gray-500">{data.orders} orders</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{data.revenue.toLocaleString()} UGX</div>
                        <div className="text-sm text-gray-500">{data.customers} customers</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category Performance */}
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
                <div className="space-y-4">
                  {categoryPerformance.map((category) => (
                    <div key={category.name} className="p-4 bg-gray-50/50 rounded-lg hover:bg-blue-50/30 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-gray-900">{category.name}</div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-gray-900">{category.revenue.toLocaleString()} UGX</span>
                          <div className="flex items-center">
                            {category.growth > 0 ? (
                              <ArrowUp className="w-3 h-3 text-green-500" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-red-500" />
                            )}
                            <span className={`text-xs font-medium ${category.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {Math.abs(category.growth)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2.5 rounded-full shadow-sm"
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600 font-medium">{category.percentage}% of total revenue</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Products */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Top Selling Products</CardTitle>
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
                          <div className="font-semibold text-gray-900 text-sm">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.sales} sales</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 text-sm">{product.revenue.toLocaleString()} UGX</div>
                        <div className="flex items-center">
                          {product.growth > 0 ? (
                            <ArrowUp className="w-3 h-3 text-green-500" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-red-500" />
                          )}
                          <span className={`text-xs font-medium ${product.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Math.abs(product.growth)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

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
                      <div className="font-bold text-gray-900">{recentMetrics.conversionRate}%</div>
                      <div className="flex items-center">
                        <ArrowUp className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">+{recentMetrics.conversionGrowth}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
                    <div>
                      <div className="font-semibold text-gray-900">Return Rate</div>
                      <div className="text-sm text-gray-600">Customer returns</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{recentMetrics.returnRate}%</div>
                      <div className="flex items-center">
                        <ArrowDown className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">{recentMetrics.returnGrowth}%</span>
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
          </div>
        </div>
      </div>
    </div>
  )
}
