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
  Plus,
  Minus,
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
  Warehouse,
  RefreshCw,
  Edit,
  Eye
} from "lucide-react"

// Mock data - replace with real data from your database
const mockInventory = [
  {
    id: "INV-001",
    productName: "Ceramic Bowl Set",
    sku: "CBS-001",
    category: "Pottery",
    currentStock: 12,
    minStock: 5,
    maxStock: 50,
    reorderPoint: 8,
    unitCost: 35.00,
    unitPrice: 89.99,
    totalValue: 420.00,
    lastRestocked: "2024-01-10",
    supplier: "Clay Works Inc.",
    status: "in_stock",
    movement: "stable"
  },
  {
    id: "INV-002",
    productName: "Silver Wire Bracelet",
    sku: "SWB-002",
    category: "Jewelry",
    currentStock: 20,
    minStock: 10,
    maxStock: 100,
    reorderPoint: 15,
    unitCost: 25.00,
    unitPrice: 67.99,
    totalValue: 500.00,
    lastRestocked: "2024-01-08",
    supplier: "Jewelry Supplies Co.",
    status: "in_stock",
    movement: "increasing"
  },
  {
    id: "INV-003",
    productName: "Blue Glazed Vase",
    sku: "BGV-003",
    category: "Pottery",
    currentStock: 3,
    minStock: 5,
    maxStock: 25,
    reorderPoint: 8,
    unitCost: 45.00,
    unitPrice: 124.99,
    totalValue: 135.00,
    lastRestocked: "2023-12-20",
    supplier: "Clay Works Inc.",
    status: "low_stock",
    movement: "decreasing"
  },
  {
    id: "INV-004",
    productName: "Wool Throw Blanket",
    sku: "WTB-004",
    category: "Textiles",
    currentStock: 2,
    minStock: 5,
    maxStock: 30,
    reorderPoint: 8,
    unitCost: 65.00,
    unitPrice: 156.99,
    totalValue: 130.00,
    lastRestocked: "2023-12-15",
    supplier: "Textile Masters",
    status: "critical",
    movement: "decreasing"
  },
  {
    id: "INV-005",
    productName: "Copper Earrings",
    sku: "CE-005",
    category: "Jewelry",
    currentStock: 25,
    minStock: 10,
    maxStock: 80,
    reorderPoint: 15,
    unitCost: 12.00,
    unitPrice: 29.99,
    totalValue: 300.00,
    lastRestocked: "2024-01-05",
    supplier: "Metal Craft Supply",
    status: "in_stock",
    movement: "stable"
  },
]

const statusOptions = ["All", "in_stock", "low_stock", "critical", "out_of_stock"]

const getStatusColor = (status: string) => {
  switch (status) {
    case "in_stock": return "bg-emerald-100 text-emerald-700 border-emerald-200"
    case "low_stock": return "bg-blue-100 text-blue-700 border-blue-200"
    case "critical": return "bg-red-100 text-red-700 border-red-200"
    case "out_of_stock": return "bg-gray-100 text-gray-700 border-gray-200"
    default: return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "in_stock": return <Package className="w-4 h-4" />
    case "low_stock": return <AlertTriangle className="w-4 h-4" />
    case "critical": return <AlertTriangle className="w-4 h-4" />
    case "out_of_stock": return <Package className="w-4 h-4" />
    default: return <Package className="w-4 h-4" />
  }
}

const getMovementIcon = (movement: string) => {
  switch (movement) {
    case "increasing": return <TrendingUp className="w-4 h-4 text-green-500" />
    case "decreasing": return <TrendingDown className="w-4 h-4 text-red-500" />
    case "stable": return <div className="w-4 h-4 rounded-full bg-gray-400"></div>
    default: return <div className="w-4 h-4 rounded-full bg-gray-400"></div>
  }
}

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [inventory] = useState(mockInventory)

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "All" || item.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const totalItems = inventory.length
  const lowStockItems = inventory.filter(i => i.status === "low_stock" || i.status === "critical").length
  const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0)
  const avgStockLevel = inventory.reduce((sum, item) => sum + (item.currentStock / item.maxStock * 100), 0) / inventory.length

  return (
    <div className="h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">JulieCraft Inventory</h1>
              <p className="text-gray-600 mt-1 text-base">Track stock levels and manage inventory replenishment</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50 border-gray-300">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="bg-white hover:bg-blue-50 hover:text-blue-700 border-gray-300">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Stock
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
                    <Warehouse className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Total Items</p>
                  <p className="text-xl font-bold text-gray-900">{totalItems}</p>
                  <p className="text-xs text-gray-500">Inventory items</p>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/10"></div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-1.5 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Low Stock Alerts</p>
                  <p className="text-xl font-bold text-gray-900">{lowStockItems}</p>
                  <p className="text-xs text-gray-500">Need restocking</p>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10"></div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-1.5 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Total Value</p>
                  <p className="text-xl font-bold text-gray-900">{totalValue.toLocaleString()} UGX</p>
                  <p className="text-xs text-gray-500">Inventory value</p>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10"></div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Avg Stock Level</p>
                  <p className="text-xl font-bold text-gray-900">{avgStockLevel.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">Of maximum capacity</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Table */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-4">Stock Management</CardTitle>
              
              {/* Search and Filters Row */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Search */}
                <div className="relative flex-shrink-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search inventory..."
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
                      className={selectedStatus === status ? "bg-blue-500 hover:bg-blue-600 text-white shadow-sm" : "bg-white hover:bg-blue-50 hover:text-blue-700 border-gray-300 text-gray-700"}
                    >
                      {status === "All" ? status : status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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
                      <TableHead className="font-semibold text-gray-700">Product</TableHead>
                      <TableHead className="font-semibold text-gray-700">Stock Level</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700">Movement</TableHead>
                      <TableHead className="font-semibold text-gray-700">Value</TableHead>
                      <TableHead className="font-semibold text-gray-700">Supplier</TableHead>
                      <TableHead className="font-semibold text-gray-700">Last Restocked</TableHead>
                      <TableHead className="w-24 font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="py-4">
                          <div>
                            <div className="font-semibold text-gray-900">{item.productName}</div>
                            <div className="text-sm text-gray-600">{item.sku} • {item.category}</div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-gray-900">{item.currentStock}</span>
                              <span className="text-sm text-gray-500">/ {item.maxStock}</span>
                              {item.currentStock <= item.reorderPoint && (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  item.currentStock <= item.minStock 
                                    ? 'bg-red-500' 
                                    : item.currentStock <= item.reorderPoint 
                                    ? 'bg-blue-500' 
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${(item.currentStock / item.maxStock) * 100}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-600 font-medium">
                              Min: {item.minStock} | Reorder: {item.reorderPoint}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge className={getStatusColor(item.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(item.status)}
                              <span>{item.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-2">
                            {getMovementIcon(item.movement)}
                            <span className="text-sm text-gray-700 capitalize font-medium">{item.movement}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div>
                            <div className="font-semibold text-gray-900">{item.totalValue.toLocaleString()} UGX</div>
                            <div className="text-sm text-gray-600">{item.unitCost.toLocaleString()} UGX cost • {item.unitPrice.toLocaleString()} UGX retail</div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm text-gray-700 font-medium">{item.supplier}</div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm text-gray-700">{item.lastRestocked}</div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-blue-50 hover:text-blue-700">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-blue-50 hover:text-blue-700">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredInventory.length === 0 && (
                <div className="text-center py-12 px-4">
                  <Warehouse className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No inventory items found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="justify-start h-auto p-4 bg-white hover:bg-red-50 hover:text-red-700 border-gray-300">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Reorder Low Stock</div>
                      <div className="text-sm text-gray-600">{lowStockItems} items need attention</div>
                    </div>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4 bg-white hover:bg-blue-50 hover:text-blue-700 border-gray-300">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <RefreshCw className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Bulk Stock Update</div>
                      <div className="text-sm text-gray-600">Update multiple items at once</div>
                    </div>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4 bg-white hover:bg-emerald-50 hover:text-emerald-700 border-gray-300">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Download className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Generate Report</div>
                      <div className="text-sm text-gray-600">Export inventory data</div>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
