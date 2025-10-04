"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
  Warehouse,
  RefreshCw,
  Edit,
  Eye,
  MoreHorizontal,
  BarChart3,
  DollarSign,
  ArrowUpDown,
  Settings
} from "lucide-react"
import { useProductsInventory, useProductsInventoryStats } from "@/hooks/use-products-inventory"
import { useToast } from "@/components/ui/toast"
import { format } from "date-fns"

// Status and filter options
const statusOptions = [
  { value: "all", label: "All Items" },
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
  { value: "discontinued", label: "Discontinued" }
]

const movementOptions = [
  { value: "all", label: "All Movement" },
  { value: "increasing", label: "Increasing" },
  { value: "decreasing", label: "Decreasing" },
  { value: "stable", label: "Stable" }
]

const sortOptions = [
  { value: "product_name", label: "Product Name" },
  { value: "current_stock", label: "Stock Level" },
  { value: "total_value", label: "Total Value" },
  { value: "last_restocked", label: "Last Restocked" },
  { value: "created_at", label: "Date Added" }
]

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
  const [filters, setFilters] = useState({
    search: "",
    status: undefined,
    low_stock: false,
    out_of_stock: false,
    sort_by: "product_name",
    sort_order: "asc",
    page: 1,
    limit: 20,
  })

  // Use products-based inventory data
  const { data: inventoryData, loading, error, refresh } = useProductsInventory({
    filters,
    autoRefresh: true,
    refreshInterval: 300000 // 5 minutes
  })

  const { stats, loading: statsLoading } = useProductsInventoryStats()
  const { addToast } = useToast()

  // Computed values
  const inventory = inventoryData?.items || []
  const totalItems = inventoryData?.total || stats.total_items || inventory.length
  const totalPages = inventoryData?.total_pages || 0
  const currentPage = inventoryData?.page || 1
  
  // Calculate stats from inventory data if stats API fails
  const lowStockCount = stats.low_stock_items || inventory.filter(item => item.status === 'low_stock').length
  const outOfStockCount = stats.out_of_stock_items || inventory.filter(item => item.status === 'out_of_stock').length
  const totalValue = stats.total_value || inventory.reduce((sum, item) => sum + (item.total_value || 0), 0)
  const avgStockLevel = stats.avg_stock_level || (totalItems > 0 ? ((totalItems - lowStockCount - outOfStockCount) / totalItems) * 100 : 0)

  // Handle filter changes
  const updateFilter = (key: string, value: string | number | boolean | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }))
  }

  const handleSearch = (value: string) => {
    updateFilter("search", value)
  }

  const handleStatusFilter = (value: string) => {
    updateFilter("status", value === "all" ? undefined : value)
  }

  const handleMovementFilter = (value: string) => {
    updateFilter("movement_trend", value === "all" ? undefined : value)
  }

  const handleSort = (sortBy: string) => {
    const currentSort = filters.sort_by
    const newOrder = currentSort === sortBy && filters.sort_order === "asc" ? "desc" : "asc"
    setFilters(prev => ({
      ...prev,
      sort_by: sortBy,
      sort_order: newOrder
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleRefresh = () => {
    refresh()
    addToast({
      type: 'success',
      title: "Inventory Refreshed",
      description: "Latest inventory data has been loaded.",
    })
  }

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
                  {loading && <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />}
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
                  {loading && <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />}
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Low Stock Alerts</p>
                  <p className="text-xl font-bold text-gray-900">{lowStockCount}</p>
                  <p className="text-xs text-gray-500">Need restocking</p>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10"></div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-1.5 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                  </div>
                  {loading && <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />}
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
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                  </div>
                  {loading && <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />}
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
                    value={filters.search || ""}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 w-full sm:w-80 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  />
                </div>
                
                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  <Select value={filters.status || "all"} onValueChange={handleStatusFilter}>
                    <SelectTrigger className="w-[140px] bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.movement_trend || "all"} onValueChange={handleMovementFilter}>
                    <SelectTrigger className="w-[140px] bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Movement" />
                    </SelectTrigger>
                    <SelectContent>
                      {movementOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.sort_by || "product_name"} onValueChange={handleSort}>
                    <SelectTrigger className="w-[140px] bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({
                      search: "",
                      status: undefined,
                      movement_trend: undefined,
                      sort_by: "product_name",
                      sort_order: "asc",
                      page: 1,
                      limit: 20,
                    })}
                    className="bg-white hover:bg-gray-50 border-gray-300 text-gray-900 hover:text-gray-900"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
        
            <CardContent className="p-0">
              {/* Loading State */}
              {loading && (
                <div className="text-center py-12 px-4">
                  <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading inventory...</h3>
                  <p className="text-gray-600">Please wait while we fetch your inventory data</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-12 px-4">
                  <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading inventory</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button onClick={handleRefresh} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              )}

              {/* Table Content */}
              {!loading && !error && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead className="font-semibold text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("product_name")}>
                          <div className="flex items-center space-x-1">
                            <span>Product</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("current_stock")}>
                          <div className="flex items-center space-x-1">
                            <span>Stock Level</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("status")}>
                          <div className="flex items-center space-x-1">
                            <span>Status</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("movement_trend")}>
                          <div className="flex items-center space-x-1">
                            <span>Movement</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("total_value")}>
                          <div className="flex items-center space-x-1">
                            <span>Value</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">Supplier</TableHead>
                        <TableHead className="font-semibold text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("last_restocked")}>
                          <div className="flex items-center space-x-1">
                            <span>Last Restocked</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </TableHead>
                        <TableHead className="w-24 font-semibold text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventory.map((item: InventoryItem) => (
                        <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          <TableCell className="py-4">
                            <div>
                              <div className="font-semibold text-gray-900">{item.product_name}</div>
                              <div className="text-sm text-gray-600">{item.sku} • {item.category_name}</div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-gray-900">{item.current_stock}</span>
                                <span className="text-sm text-gray-500">/ {item.max_stock}</span>
                                {item.current_stock <= item.reorder_point && (
                                  <AlertTriangle className="w-4 h-4 text-red-500" />
                                )}
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className={`h-2.5 rounded-full ${
                                    item.current_stock <= item.min_stock 
                                      ? 'bg-red-500' 
                                      : item.current_stock <= item.reorder_point 
                                      ? 'bg-blue-500' 
                                      : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${(item.current_stock / item.max_stock) * 100}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-600 font-medium">
                                Min: {item.min_stock} | Reorder: {item.reorder_point}
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
                              {getMovementIcon(item.movement_trend)}
                              <span className="text-sm text-gray-700 capitalize font-medium">{item.movement_trend}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div>
                              <div className="font-semibold text-gray-900">{item.total_value?.toLocaleString() || "0"} UGX</div>
                              <div className="text-sm text-gray-600">
                                {item.unit_cost?.toLocaleString() || "0"} UGX cost • {item.unit_price?.toLocaleString() || "0"} UGX retail
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-sm text-gray-700 font-medium">{item.supplier || "N/A"}</div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-sm text-gray-700">
                              {item.last_restocked ? format(new Date(item.last_restocked), "MMM dd, yyyy") : "Never"}
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
                              <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                                <Plus className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-50">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && inventory.length === 0 && (
                <div className="text-center py-12 px-4">
                  <Warehouse className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No inventory items found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
                  <Button variant="outline" onClick={() => setFilters({
                    search: "",
                    status: undefined,
                    movement_trend: undefined,
                    sort_by: "product_name",
                    sort_order: "asc",
                    page: 1,
                    limit: 20,
                  })}>
                    Clear Filters
                  </Button>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="justify-start h-auto p-4 bg-white hover:bg-red-50 hover:text-red-700 border-gray-300 min-h-[90px] w-full">
                  <div className="flex items-start space-x-3 w-full">
                    <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="text-left flex-1 overflow-hidden">
                      <div className="font-semibold text-gray-900 text-sm leading-tight mb-1">Reorder Low Stock</div>
                      <div className="text-xs text-gray-600 leading-relaxed break-words">
                        {lowStockCount} items need attention
                      </div>
                    </div>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4 bg-white hover:bg-blue-50 hover:text-blue-700 border-gray-300 min-h-[90px] w-full">
                  <div className="flex items-start space-x-3 w-full">
                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                      <RefreshCw className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left flex-1 overflow-hidden">
                      <div className="font-semibold text-gray-900 text-sm leading-tight mb-1">Bulk Stock Update</div>
                      <div className="text-xs text-gray-600 leading-relaxed break-words">
                        Update multiple items at once
                      </div>
                    </div>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4 bg-white hover:bg-emerald-50 hover:text-emerald-700 border-gray-300 min-h-[90px] w-full">
                  <div className="flex items-start space-x-3 w-full">
                    <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                      <Download className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-left flex-1 overflow-hidden">
                      <div className="font-semibold text-gray-900 text-sm leading-tight mb-1">Generate Report</div>
                      <div className="text-xs text-gray-600 leading-relaxed break-words">
                        Export inventory data
                      </div>
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="justify-start h-auto p-4 bg-white hover:bg-purple-50 hover:text-purple-700 border-gray-300 min-h-[90px] w-full">
                  <div className="flex items-start space-x-3 w-full">
                    <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                      <Settings className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left flex-1 overflow-hidden">
                      <div className="font-semibold text-gray-900 text-sm leading-tight mb-1">Stock Settings</div>
                      <div className="text-xs text-gray-600 leading-relaxed break-words">
                        Configure alerts & thresholds
                      </div>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card className="bg-white border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * (filters.limit || 20)) + 1} to {Math.min(currentPage * (filters.limit || 20), totalItems)} of {totalItems} items
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="bg-white border-gray-300"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="bg-white border-gray-300"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
