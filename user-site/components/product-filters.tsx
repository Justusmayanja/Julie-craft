"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface Category {
  id: string
  name: string
}

interface ProductFiltersProps {
  categories: Category[]
  currentCategory?: string
  currentSort?: string
}

export function ProductFilters({ categories, currentCategory, currentSort }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    // Reset to first page when filters change
    params.delete("page")

    router.push(`/products?${params.toString()}`)
  }

  const clearAllFilters = () => {
    router.push("/products")
  }

  const hasActiveFilters = currentCategory || currentSort

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {hasActiveFilters && (
        <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-foreground">Active Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {currentCategory && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {currentCategory}
                <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilters("category", null)} />
              </Badge>
            )}
            {currentSort && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Sort: {currentSort}
                <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilters("sort", null)} />
              </Badge>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sort */}
      <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm text-foreground">Sort By</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={currentSort || "newest"} onValueChange={(value) => updateFilters("sort", value || null)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name">Name: A to Z</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm text-foreground">Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant={!currentCategory ? "default" : "ghost"}
            size="sm"
            className="w-full justify-start"
            onClick={() => updateFilters("category", null)}
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={currentCategory === category.name ? "default" : "ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => updateFilters("category", category.name)}
            >
              {category.name}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
