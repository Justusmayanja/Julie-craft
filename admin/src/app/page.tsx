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
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"

// JulieCraft Business Data (UGX - Ugandan Shilling)
const stats = {
  totalRevenue: 61500000, // ~61.5M UGX
  revenueChange: 18.5,
  totalOrders: 187,
  ordersChange: 12.2,
  totalProducts: 9, // Actual JulieCraft product count
  productsChange: 12.5, // Growing product line
  totalCustomers: 298,
  customersChange: 22.3,
}

const recentOrders = [
  { id: "ORD-001", customer: "Sarah Johnson", product: "Handcrafted Ceramic Bowl Set", amount: 350000, status: "completed" },
  { id: "ORD-002", customer: "Mike Chen", product: "Silver Wire Bracelet with Natural Stones", amount: 265000, status: "processing" },
  { id: "ORD-003", customer: "Emily Davis", product: "Wool Throw Blanket - Traditional Pattern", amount: 610000, status: "shipped" },
  { id: "ORD-004", customer: "Alex Smith", product: "Hand-carved Oak Cutting Board", amount: 270000, status: "pending" },
]

const lowStockItems = [
  { name: "Blue Glazed Vase", stock: 3, threshold: 8 },
  { name: "Wool Throw Blanket", stock: 2, threshold: 6 },
  { name: "Terracotta Planter", stock: 4, threshold: 15 },
]

const topProducts = [
  { name: "Handcrafted Ceramic Bowl Set", sales: 45, revenue: 15750000 },
  { name: "Silver Wire Bracelet", sales: 32, revenue: 8480000 },
  { name: "Copper Earrings with Patina", sales: 28, revenue: 3220000 },
]

export default function Dashboard() {
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
                    +{stats.revenueChange}%
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Total Revenue</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString()} UGX</p>
                  <p className="text-xs text-gray-500">+{(stats.totalRevenue * stats.revenueChange / 100).toLocaleString()} UGX from last month</p>
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
                    +{stats.ordersChange}%
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Total Orders</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalOrders}</p>
                  <p className="text-xs text-gray-500">+{Math.round(stats.totalOrders * stats.ordersChange / 100)} new orders this month</p>
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
                    +{stats.productsChange}%
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Total Products</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalProducts}</p>
                  <p className="text-xs text-gray-500">+{Math.round(stats.totalProducts * stats.productsChange / 100)} new products this month</p>
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
                    +{stats.customersChange}%
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Total Customers</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalCustomers}</p>
                  <p className="text-xs text-gray-500">+{Math.round(stats.totalCustomers * stats.customersChange / 100)} new customers this month</p>
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
                  {recentOrders.map((order, index) => (
                    <div key={order.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="font-semibold text-gray-900">{order.id}</div>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              order.status === 'completed' ? 'bg-green-100 text-green-700 ring-1 ring-green-200' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-200' :
                              'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">{order.customer}</span> • {order.product}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">{order.amount.toLocaleString()} UGX</div>
                          <div className="text-xs text-gray-500">Just now</div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                  {lowStockItems.map((item, index) => (
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
                  ))}
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
                {topProducts.map((product, index) => (
                  <div key={index} className="group relative overflow-hidden bg-gradient-to-br from-blue-50 via-emerald-50 to-green-50 rounded-lg p-4 border border-blue-200/50 hover:shadow-md transition-all duration-300">
                    <div className="absolute top-2 right-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        #{index + 1}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="font-semibold text-gray-900 text-lg leading-tight pr-10">{product.name}</div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Sales</span>
                          <span className="font-medium text-gray-900">{product.sales}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Revenue</span>
                          <span className="font-semibold text-green-600">{product.revenue.toLocaleString()} UGX</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-blue-200/50">
                        <div className="text-xs text-blue-700 font-medium">Best performer this month</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}