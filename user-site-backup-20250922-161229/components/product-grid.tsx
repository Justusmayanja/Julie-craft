import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddToCartButton } from "@/components/add-to-cart-button"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  stock_quantity: number
  is_featured: boolean
  categories?: {
    name: string
  }
}

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
          <Link href={`/product/${product.id}`}>
            <div className="aspect-square relative">
              <Image
                src={product.image_url || "/placeholder.svg?height=400&width=400"}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {product.is_featured && <Badge className="absolute top-3 left-3 bg-primary">Featured</Badge>}
              {product.stock_quantity === 0 && (
                <Badge variant="destructive" className="absolute top-3 right-3">
                  Out of Stock
                </Badge>
              )}
            </div>
          </Link>

          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <Link href={`/product/${product.id}`}>
                <h3 className="font-semibold text-lg text-balance hover:text-primary transition-colors">
                  {product.name}
                </h3>
              </Link>
              <span className="text-lg font-bold text-primary">${product.price}</span>
            </div>

            <p className="text-sm text-muted-foreground mb-4 text-pretty line-clamp-2">{product.description}</p>

            <div className="flex justify-between items-center mb-4">
              {product.categories && <Badge variant="secondary">{product.categories.name}</Badge>}
              <span className="text-sm text-muted-foreground">{product.stock_quantity} in stock</span>
            </div>

            <AddToCartButton product={product} className="w-full" disabled={product.stock_quantity === 0} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
