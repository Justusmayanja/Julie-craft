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
  Image as ImageIcon
} from "lucide-react"

// JulieCraft Products Data
const julieCraftProducts = [
  {
    id: "1",
    name: "Handcrafted Ceramic Bowl Set",
    description: "Set of 4 handcrafted ceramic bowls in earth tones",
    category: "Pottery",
    price: 89.99,
    stock: 12,
    status: "active",
    featured: true,
    sales: 45,
    image: "/products/pdt1.jpeg"
  },
  {
    id: "2", 
    name: "Silver Wire Bracelet with Natural Stones",
    description: "Elegant handwoven silver wire bracelet with natural stones",
    category: "Jewelry",
    price: 67.99,
    stock: 20,
    status: "active",
    featured: false,
    sales: 32,
    image: "/products/pdt2.jpeg"
  },
  {
    id: "3",
    name: "Blue Glazed Vase",
    description: "Large decorative vase with beautiful blue glaze finish",
    category: "Pottery", 
    price: 124.99,
    stock: 3,
    status: "active",
    featured: false,
    sales: 18,
    image: "/products/pdt3.jpeg"
  },
  {
    id: "4",
    name: "Wool Throw Blanket - Traditional Pattern",
    description: "Soft wool throw blanket in traditional patterns",
    category: "Textiles",
    price: 156.99,
    stock: 2,
    status: "active",
    featured: true,
    sales: 25,
    image: "/products/pdt4.jpeg"
  },
  {
    id: "5",
    name: "Copper Earrings with Patina Finish",
    description: "Handforged copper earrings with unique patina finish",
    category: "Jewelry",
    price: 29.99,
    stock: 25,
    status: "active",
    featured: true,
    sales: 28,
    image: "/products/pdt5.jpeg"
  },
  {
    id: "6",
    name: "Colorful Beaded Necklace",
    description: "Colorful beaded necklace with semi-precious stones",
    category: "Jewelry",
    price: 45.99,
    stock: 18,
    status: "active",
    featured: false,
    sales: 22,
    image: "/products/pdt6.jpeg"
  },
  {
    id: "7",
    name: "Terracotta Planter",
    description: "Rustic terracotta planter perfect for herbs and small plants",
    category: "Pottery",
    price: 34.99,
    stock: 15,
    status: "active",
    featured: false,
    sales: 35,
    image: "/products/pdt7.jpeg"
  },
  {
    id: "8",
    name: "Hand-carved Oak Cutting Board",
    description: "Premium oak cutting board with natural edge",
    category: "Woodwork",
    price: 68.99,
    stock: 16,
    status: "active",
    featured: true,
    sales: 19,
    image: "/products/pdt8.jpeg"
  },
  {
    id: "9",
    name: "Hand-dyed Silk Scarf",
    description: "Hand-dyed silk scarf with abstract patterns",
    category: "Textiles",
    price: 78.99,
    stock: 14,
    status: "active",
    featured: false,
    sales: 16,
    image: "/products/pdt9.jpeg"
  },
]

const categories = ["All", "Pottery", "Jewelry", "Textiles", "Woodwork"]

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [products] = useState(julieCraftProducts)

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const lowStockCount = products.filter(p => p.stock <= 5).length
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length

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
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
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
                  <p className="text-xl font-bold text-gray-900">{products.length}</p>
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
                  <p className="text-xl font-bold text-gray-900">{totalValue.toLocaleString()} UGX</p>
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
                  <p className="text-xl font-bold text-gray-900">{avgPrice.toLocaleString()} UGX</p>
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
                  <p className="text-xl font-bold text-gray-900">{lowStockCount}</p>
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
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={selectedCategory === category 
                        ? "bg-blue-500 hover:bg-blue-600 text-white shadow-sm" 
                        : "bg-white hover:bg-blue-50 hover:text-blue-700 border-gray-300 text-gray-700"
                      }
                    >
                      {category}
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
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="py-4">
                          <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden shadow-sm">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
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
                            {product.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 font-semibold text-gray-900">{product.price.toLocaleString()} UGX</TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-2">
                            <span className={`font-semibold ${product.stock <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                              {product.stock}
                            </span>
                            {product.stock <= 5 && (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-gray-700">{product.sales} sold</TableCell>
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
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-blue-50 hover:text-blue-700">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-blue-50 hover:text-blue-700">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12 px-4">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {filteredProducts.length > 0 && (
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Bulk Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" className="bg-white hover:bg-blue-50 hover:text-blue-700">
                    Export Selected
                  </Button>
                  <Button variant="outline" className="bg-white hover:bg-emerald-50 hover:text-emerald-700">
                    Update Prices
                  </Button>
                  <Button variant="outline" className="bg-white hover:bg-blue-50 hover:text-blue-700">
                    Manage Categories
                  </Button>
                  <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 bg-white">
                    Delete Selected
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
