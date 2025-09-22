"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Search, 
  Filter, 
  Download, 
  Eye,
  Edit,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Banknote,
  Calendar,
  User
} from "lucide-react"

// Mock data - replace with real data from your database
const mockOrders = [
  {
    id: "ORD-001",
    customer: {
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      avatar: "SJ"
    },
    items: [
      { name: "Ceramic Bowl Set", quantity: 1, price: 89.99 }
    ],
    total: 89.99,
    status: "completed",
    paymentStatus: "paid",
    shippingAddress: "123 Main St, Springfield, IL 62701",
    orderDate: "2024-01-15",
    shippedDate: "2024-01-16"
  },
  {
    id: "ORD-002",
    customer: {
      name: "Mike Chen",
      email: "mike.chen@email.com",
      avatar: "MC"
    },
    items: [
      { name: "Silver Wire Bracelet", quantity: 2, price: 67.99 }
    ],
    total: 135.98,
    status: "processing",
    paymentStatus: "paid",
    shippingAddress: "456 Oak Ave, Chicago, IL 60601",
    orderDate: "2024-01-14",
    shippedDate: null
  },
  {
    id: "ORD-003",
    customer: {
      name: "Emily Davis",
      email: "emily.davis@email.com",
      avatar: "ED"
    },
    items: [
      { name: "Wool Throw Blanket", quantity: 1, price: 156.99 },
      { name: "Silk Scarf", quantity: 1, price: 78.99 }
    ],
    total: 235.98,
    status: "shipped",
    paymentStatus: "paid",
    shippingAddress: "789 Pine St, Denver, CO 80202",
    orderDate: "2024-01-13",
    shippedDate: "2024-01-15"
  },
  {
    id: "ORD-004",
    customer: {
      name: "Alex Smith",
      email: "alex.smith@email.com",
      avatar: "AS"
    },
    items: [
      { name: "Carved Wooden Bowl", quantity: 1, price: 92.99 }
    ],
    total: 92.99,
    status: "pending",
    paymentStatus: "pending",
    shippingAddress: "321 Elm St, Austin, TX 73301",
    orderDate: "2024-01-12",
    shippedDate: null
  },
]

const statusOptions = ["All", "pending", "processing", "shipped", "completed", "cancelled"]

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-emerald-100 text-emerald-700 border-emerald-200"
    case "shipped": return "bg-blue-100 text-blue-700 border-blue-200"
    case "processing": return "bg-blue-100 text-blue-700 border-blue-200"
    case "pending": return "bg-gray-100 text-gray-700 border-gray-200"
    case "cancelled": return "bg-red-100 text-red-700 border-red-200"
    default: return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed": return <CheckCircle className="w-4 h-4" />
    case "shipped": return <Truck className="w-4 h-4" />
    case "processing": return <Clock className="w-4 h-4" />
    case "pending": return <Package className="w-4 h-4" />
    case "cancelled": return <XCircle className="w-4 h-4" />
    default: return <Package className="w-4 h-4" />
  }
}

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [orders] = useState(mockOrders)

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "All" || order.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const pendingOrders = orders.filter(o => o.status === "pending").length
  const completedOrders = orders.filter(o => o.status === "completed").length

  return (
    <div className="h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">JulieCraft Orders</h1>
              <p className="text-gray-600 mt-1 text-base">Manage customer orders and track fulfillment</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50 border-gray-300">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="relative overflow-hidden bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10"></div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Total Orders</p>
                  <p className="text-xl font-bold text-gray-900">{totalOrders}</p>
                  <p className="text-xs text-gray-500">All time orders</p>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10"></div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-1.5 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                    <Banknote className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Total Revenue</p>
                  <p className="text-xl font-bold text-gray-900">{totalRevenue.toLocaleString()} UGX</p>
                  <p className="text-xs text-gray-500">Total sales value</p>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10"></div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Pending Orders</p>
                  <p className="text-xl font-bold text-gray-900">{pendingOrders}</p>
                  <p className="text-xs text-gray-500">Need attention</p>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10"></div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-1.5 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Completed</p>
                  <p className="text-xl font-bold text-gray-900">{completedOrders}</p>
                  <p className="text-xs text-gray-500">Successfully fulfilled</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Table */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-4">Order Management</CardTitle>
              
              {/* Search and Filters Row */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Search */}
                <div className="relative flex-shrink-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-80 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {/* Status Filter */}
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <Button
                      key={status}
                      variant={selectedStatus === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedStatus(status)}
                      className={selectedStatus === status 
                        ? "bg-blue-500 hover:bg-blue-600 text-white shadow-sm" 
                        : "bg-white hover:bg-blue-50 hover:text-blue-700 border-gray-300 text-gray-700"
                      }
                    >
                      {status === "All" ? status : status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
        
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="font-semibold text-gray-700">Order</TableHead>
                      <TableHead className="font-semibold text-gray-700">Customer</TableHead>
                      <TableHead className="font-semibold text-gray-700">Items</TableHead>
                      <TableHead className="font-semibold text-gray-700">Total</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700">Payment</TableHead>
                      <TableHead className="font-semibold text-gray-700">Date</TableHead>
                      <TableHead className="w-24 font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="py-4">
                          <div className="font-semibold text-gray-900">{order.id}</div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
                              {order.customer.avatar}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{order.customer.name}</div>
                              <div className="text-sm text-gray-500">{order.customer.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            {order.items.map((item, index) => (
                              <div key={index} className="text-sm text-gray-700">
                                <span className="font-semibold">{item.quantity}x</span> {item.name}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 font-semibold text-gray-900">{order.total.toLocaleString()} UGX</TableCell>
                        <TableCell className="py-4">
                          <Badge className={getStatusColor(order.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(order.status)}
                              <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge 
                            className={order.paymentStatus === 'paid' 
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                              : 'bg-red-100 text-red-700 border-red-200'
                            }
                          >
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm">
                            <div className="font-semibold text-gray-900">{order.orderDate}</div>
                            {order.shippedDate && (
                              <div className="text-gray-500">Shipped: {order.shippedDate}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-blue-50 hover:text-blue-700">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-blue-50 hover:text-blue-700">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredOrders.length === 0 && (
                <div className="text-center py-12 px-4">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
