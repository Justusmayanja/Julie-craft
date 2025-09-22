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
  Edit, 
  Trash2,
  Eye,
  FolderOpen,
  Package,
  TrendingUp,
  Image as ImageIcon,
  Tag
} from "lucide-react"

// Mock data - replace with real data from your database
const mockCategories = [
  {
    id: "CAT-001",
    name: "Pottery",
    description: "Handcrafted ceramic pieces including bowls, vases, and decorative items",
    productCount: 12,
    totalSales: 2450.75,
    isActive: true,
    image: "/placeholder.jpg",
    createdDate: "2023-06-15",
    tags: ["Handmade", "Ceramic", "Home Decor"]
  },
  {
    id: "CAT-002",
    name: "Jewelry",
    description: "Unique handmade jewelry pieces including necklaces, bracelets, and earrings",
    productCount: 18,
    totalSales: 3250.40,
    isActive: true,
    image: "/placeholder.jpg",
    createdDate: "2023-06-20",
    tags: ["Handmade", "Accessories", "Fashion"]
  },
  {
    id: "CAT-003",
    name: "Textiles",
    description: "Woven and knitted items including scarves, blankets, and clothing",
    productCount: 8,
    totalSales: 1890.25,
    isActive: true,
    image: "/placeholder.jpg",
    createdDate: "2023-07-02",
    tags: ["Handmade", "Fabric", "Clothing"]
  },
  {
    id: "CAT-004",
    name: "Woodwork",
    description: "Carved and crafted wooden items including furniture and decorative pieces",
    productCount: 15,
    totalSales: 4120.60,
    isActive: true,
    image: "/placeholder.jpg",
    createdDate: "2023-07-10",
    tags: ["Handmade", "Wood", "Furniture"]
  },
  {
    id: "CAT-005",
    name: "Candles & Soaps",
    description: "Artisanal candles and handmade soaps with natural ingredients",
    productCount: 22,
    totalSales: 1650.30,
    isActive: false,
    image: "/placeholder.jpg",
    createdDate: "2023-08-05",
    tags: ["Handmade", "Aromatherapy", "Natural"]
  },
]

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categories] = useState(mockCategories)

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalCategories = categories.length
  const activeCategories = categories.filter(c => c.isActive).length
  const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0)
  const totalRevenue = categories.reduce((sum, c) => sum + c.totalSales, 0)

  return (
    <div className="h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">JulieCraft Categories</h1>
              <p className="text-gray-600 mt-1 text-base">Organize your products into meaningful categories</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="relative overflow-hidden bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10"></div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <FolderOpen className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Total Categories</p>
                  <p className="text-xl font-bold text-gray-900">{totalCategories}</p>
                  <p className="text-xs text-gray-500">Product categories</p>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10"></div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-1.5 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                    <Tag className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Active Categories</p>
                  <p className="text-xl font-bold text-gray-900">{activeCategories}</p>
                  <p className="text-xs text-gray-500">Currently active</p>
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
                  <p className="text-xs font-medium text-gray-600">Total Products</p>
                  <p className="text-xl font-bold text-gray-900">{totalProducts}</p>
                  <p className="text-xs text-gray-500">Across all categories</p>
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
                  <p className="text-xs font-medium text-gray-600">Total Revenue</p>
                  <p className="text-xl font-bold text-gray-900">{totalRevenue.toLocaleString()} UGX</p>
                  <p className="text-xs text-gray-500">Category sales</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Categories Management */}
          <Card className="bg-white border-0 shadow-lg">
            <CardHeader className="border-b border-gray-100 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Category Management</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-80 bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </CardHeader>
        
            <CardContent className="p-4">
              {/* Grid View */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                {filteredCategories.map((category) => (
                  <Card key={category.id} className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-lg flex items-center justify-center border border-blue-200/50">
                            <img 
                              src="/placeholder-logo.png" 
                              alt={category.name}
                              className="w-8 h-8 object-cover rounded-md"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                                if (nextSibling) {
                                  nextSibling.style.display = 'flex';
                                }
                              }}
                            />
                            <ImageIcon className="w-6 h-6 text-blue-400 hidden" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-semibold text-gray-900 truncate">{category.name}</CardTitle>
                            <Badge 
                              className={category.isActive 
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200 text-xs" 
                                : "bg-gray-100 text-gray-700 border-gray-200 text-xs"
                              }
                            >
                              {category.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      <div className="flex space-x-1 flex-shrink-0">
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
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{category.description}</p>
                      
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="text-center p-3 bg-blue-50/50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">{category.productCount}</div>
                          <div className="text-xs text-gray-600">Products</div>
                        </div>
                        <div className="text-center p-3 bg-emerald-50/50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">{category.totalSales.toLocaleString()} UGX</div>
                          <div className="text-xs text-gray-600">Revenue</div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {category.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-white text-gray-600 border-gray-300">
                            {tag}
                          </Badge>
                        ))}
                        {category.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-white text-gray-600 border-gray-300">
                            +{category.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Table View */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="font-semibold text-gray-700">Category</TableHead>
                      <TableHead className="font-semibold text-gray-700">Description</TableHead>
                      <TableHead className="font-semibold text-gray-700">Products</TableHead>
                      <TableHead className="font-semibold text-gray-700">Revenue</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700">Created</TableHead>
                      <TableHead className="w-24 font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => (
                      <TableRow key={category.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-lg flex items-center justify-center border border-blue-200/50">
                              <img 
                                src="/placeholder-logo.png" 
                                alt={category.name}
                                className="w-6 h-6 object-cover rounded-md"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (nextSibling) {
                                    nextSibling.style.display = 'flex';
                                  }
                                }}
                              />
                              <ImageIcon className="w-5 h-5 text-blue-400 hidden" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{category.name}</div>
                              <div className="text-sm text-gray-500">{category.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-700 truncate">{category.description}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">{category.productCount}</div>
                            <div className="text-xs text-gray-500">items</div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="font-semibold text-gray-900">{category.totalSales.toLocaleString()} UGX</div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge 
                            className={category.isActive 
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                              : "bg-gray-100 text-gray-700 border-gray-200"
                            }
                          >
                            {category.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-sm text-gray-600">{category.createdDate}</div>
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

              {filteredCategories.length === 0 && (
                <div className="text-center py-12 px-4">
                  <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
