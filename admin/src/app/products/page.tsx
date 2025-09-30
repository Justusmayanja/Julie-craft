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
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Eye,
  Package,
  AlertTriangle,
  TrendingUp,
  Star,
  Image as ImageIcon,
  RefreshCw
} from "lucide-react"
import { useProducts, useProductStats, useCategories } from "@/hooks/use-products"
import { ProductFilters, Product } from "@/lib/types/product"
import { useToast } from "@/components/ui/toast"
import { ProductModal } from "@/components/product-modal"

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(20)
  const [modalProduct, setModalProduct] = useState<Product | null>(null)
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'add'>('view')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Build filters for API
  const filters: ProductFilters = {
    search: searchTerm || undefined,
    category_id: selectedCategory !== "All" ? selectedCategory : undefined,
    limit: pageSize,
    offset: currentPage * pageSize,
    sort_by: 'created_at',
    sort_order: 'desc'
  }

  // Fetch data from API
  const { products, loading, error, total, refetch } = useProducts(filters)
  const { stats, loading: statsLoading, refetch: refetchStats } = useProductStats()
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories()
  const { addToast } = useToast()

  // Debug categories
  console.log('Categories:', categories)
  console.log('Categories loading:', categoriesLoading)
  console.log('Categories error:', categoriesError)

  const handleRefresh = async () => {
    await Promise.all([refetch(), refetchStats()])
  }

  const handleViewProduct = (product: Product) => {
    setModalProduct(product)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setModalProduct(product)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      addToast({
        type: 'success',
        title: 'Product Deleted',
        description: `Product "${product.name}" deleted successfully`
      })
      await refetch()
      await refetchStats()
    } catch (error) {
      console.error('Error deleting product:', error)
      addToast({
        type: 'error',
        title: 'Delete Failed',
        description: 'Failed to delete product'
      })
    }
  }

  const handleAddProduct = () => {
    setModalProduct(null)
    setModalMode('add')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setModalProduct(null)
  }

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (modalMode === 'add') {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Create product error:', errorData)
          throw new Error(errorData.details || 'Failed to create product')
        }
      } else if (modalMode === 'edit' && modalProduct) {
        const response = await fetch(`/api/products/${modalProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Update product error:', errorData)
          throw new Error(errorData.details || 'Failed to update product')
        }
      }
    } catch (error) {
      console.error('Error saving product:', error)
      throw error
    }
  }

  return (
    <div className="h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">JulieCraft Products</h1>
              <p className="text-gray-600 mt-1 text-base">Manage your craft inventory and product catalog</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={loading || statsLoading}
                className="bg-white hover:bg-gray-50 border-gray-300"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${(loading || statsLoading) ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={handleAddProduct}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
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
                  <p className="text-xs font-medium text-gray-600">Total Products</p>
                  <p className="text-xl font-bold text-gray-900">
                    {statsLoading ? '...' : stats?.total_products || 0}
                  </p>
                  <p className="text-xs text-gray-500">Active inventory items</p>
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
                  <p className="text-xs font-medium text-gray-600">Inventory Value</p>
                  <p className="text-xl font-bold text-gray-900">
                    {statsLoading ? '...' : `${(stats?.total_inventory_value || 0).toLocaleString()} UGX`}
                  </p>
                  <p className="text-xs text-gray-500">Total stock value</p>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10"></div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Star className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Avg. Price</p>
                  <p className="text-xl font-bold text-gray-900">
                    {statsLoading ? '...' : `${(stats?.average_price || 0).toLocaleString()} UGX`}
                  </p>
                  <p className="text-xs text-gray-500">Average product price</p>
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
                  <p className="text-xs font-medium text-gray-600">Low Stock</p>
                  <p className="text-xl font-bold text-gray-900">
                    {statsLoading ? '...' : stats?.low_stock_products || 0}
                  </p>
                  <p className="text-xs text-gray-500">Items need restocking</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Catalog */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-4">Product Catalog</CardTitle>
              
              {/* Search and Filters Row */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Search */}
                <div className="relative flex-shrink-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-80 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === "All" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("All")}
                    className={selectedCategory === "All" 
                      ? "bg-blue-500 hover:bg-blue-600 text-white shadow-sm" 
                      : "bg-white hover:bg-blue-50 hover:text-blue-700 border-gray-300 text-gray-700"
                    }
                  >
                    All
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className={selectedCategory === category.id 
                        ? "bg-blue-500 hover:bg-blue-600 text-white shadow-sm" 
                        : "bg-white hover:bg-blue-50 hover:text-blue-700 border-gray-300 text-gray-700"
                      }
                    >
                      {category.name}
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
                      <TableHead className="w-20 font-semibold text-gray-700">Image</TableHead>
                      <TableHead className="font-semibold text-gray-700">Product</TableHead>
                      <TableHead className="font-semibold text-gray-700">Category</TableHead>
                      <TableHead className="font-semibold text-gray-700">Price</TableHead>
                      <TableHead className="font-semibold text-gray-700">Stock</TableHead>
                      <TableHead className="font-semibold text-gray-700">Sales</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="w-24 font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex items-center justify-center space-x-2">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Loading products...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="text-red-600">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                            <p>Error loading products: {error}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                      <TableRow key={product.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="py-4">
                          <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                              {product.images && product.images.length > 0 ? (
                            <img 
                                  src={product.images[0]} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <div className="font-semibold text-gray-900">{product.name}</div>
                            {product.featured && (
                              <Badge className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
                                <Star className="w-3 h-3 mr-1 fill-current" />
                                Featured
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge variant="outline" className="bg-white text-gray-700 border-gray-300">
                              {product.category?.name || 'Uncategorized'}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 font-semibold text-gray-900">{product.price.toLocaleString()} UGX</TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-2">
                              <span className={`font-semibold ${product.stock_quantity <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                                {product.stock_quantity}
                            </span>
                              {product.stock_quantity <= 5 && (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                          <TableCell className="py-4 text-gray-700">-</TableCell>
                        <TableCell className="py-4">
                          <Badge 
                            className={product.status === 'active' 
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                            }
                          >
                            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                        <div className="flex items-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewProduct(product)}
                              className="text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                            >
                            <Eye className="w-4 h-4" />
                          </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditProduct(product)}
                              className="text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                            >
                            <Edit className="w-4 h-4" />
                          </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteProduct(product)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        </TableCell>
                      </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {products.length > 0 && (
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Bulk Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => addToast({
                      type: 'info',
                      title: 'Export',
                      description: 'Export functionality coming soon'
                    })}
                    className="bg-white hover:bg-blue-50 hover:text-blue-700"
                  >
                    Export Selected
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => addToast({
                      type: 'info',
                      title: 'Update Prices',
                      description: 'Update prices functionality coming soon'
                    })}
                    className="bg-white hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    Update Prices
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => addToast({
                      type: 'info',
                      title: 'Manage Categories',
                      description: 'Manage categories functionality coming soon'
                    })}
                    className="bg-white hover:bg-blue-50 hover:text-blue-700"
                  >
                    Manage Categories
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => addToast({
                      type: 'info',
                      title: 'Delete Selected',
                      description: 'Delete selected functionality coming soon'
                    })}
                    className="text-red-600 border-red-300 hover:bg-red-50 bg-white"
                  >
                    Delete Selected
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        product={modalProduct}
        categories={categories}
        isOpen={isModalOpen}
        mode={modalMode}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
        onRefresh={refetch}
      />
    </div>
  )
}
