import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Package, ShoppingCart } from "lucide-react"

interface Order {
  id: string
  total_amount: number
  status: string
  created_at: string
}

interface Product {
  id: string
  name: string
  price: number
  stock_quantity: number
  is_active: boolean
}

interface OrderItem {
  id: string
  quantity: number
  price: number
  products: {
    name: string
    categories: {
      name: string
    } | null
  }
}

interface AnalyticsDashboardProps {
  orders: Order[]
  products: Product[]
  orderItems: OrderItem[]
}

export function AnalyticsDashboard({ orders, products, orderItems }: AnalyticsDashboardProps) {
  // Calculate metrics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
  const totalOrders = orders.length
  const totalProducts = products.length
  const activeProducts = products.filter((p) => p.is_active).length
  const lowStockProducts = products.filter((p) => p.stock_quantity < 10).length

  // Order status breakdown
  const ordersByStatus = orders.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Top selling products
  const productSales = orderItems.reduce(
    (acc, item) => {
      const productName = item.products.name
      acc[productName] = (acc[productName] || 0) + item.quantity
      return acc
    },
    {} as Record<string, number>,
  )

  const topProducts = Object.entries(productSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Category performance
  const categorySales = orderItems.reduce(
    (acc, item) => {
      const categoryName = item.products.categories?.name || "Uncategorized"
      acc[categoryName] = (acc[categoryName] || 0) + item.quantity * item.price
      return acc
    },
    {} as Record<string, number>,
  )

  const topCategories = Object.entries(categorySales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Recent orders trend (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentOrders = orders.filter((order) => new Date(order.created_at) >= thirtyDaysAgo)
  const recentRevenue = recentOrders.reduce((sum, order) => sum + order.total_amount, 0)

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">${recentRevenue.toFixed(2)} in last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">{recentOrders.length} in last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProducts}</div>
            <p className="text-xs text-muted-foreground">{totalProducts - activeProducts} inactive</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">Products with less than 10 items</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(ordersByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <Badge variant="secondary" className="capitalize">
                    {status}
                  </Badge>
                  <span className="font-medium">{count} orders</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map(([product, quantity], index) => (
                <div key={product} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">#{index + 1}</span>
                    <span className="text-sm text-balance">{product}</span>
                  </div>
                  <Badge variant="outline">{quantity} sold</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCategories.map(([category, revenue], index) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">#{index + 1}</span>
                    <span className="text-sm">{category}</span>
                  </div>
                  <span className="font-medium">${revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Products */}
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Products</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts === 0 ? (
              <p className="text-sm text-muted-foreground">All products are well stocked!</p>
            ) : (
              <div className="space-y-3">
                {products
                  .filter((p) => p.stock_quantity < 10)
                  .slice(0, 5)
                  .map((product) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <span className="text-sm text-balance">{product.name}</span>
                      <Badge variant="destructive">{product.stock_quantity} left</Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
