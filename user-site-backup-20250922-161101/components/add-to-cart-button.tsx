"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"
import { toast } from "@/hooks/use-toast"

interface Product {
  id: string
  name: string
  price: number
  image_url: string
  stock_quantity: number
}

interface AddToCartButtonProps {
  product: Product
  quantity?: number
  disabled?: boolean
  className?: string
}

export function AddToCartButton({ product, quantity = 1, disabled, className }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = async () => {
    if (product.stock_quantity === 0) return

    setIsLoading(true)

    try {
      // Add multiple items if quantity > 1
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          stock_quantity: product.stock_quantity,
        })
      }

      toast({
        title: "Added to cart",
        description: `${quantity > 1 ? `${quantity}x ` : ""}${product.name} added to your cart.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || product.stock_quantity === 0 || isLoading}
      className={className}
    >
      <ShoppingCart className="h-4 w-4 mr-2" />
      {isLoading ? "Adding..." : product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
    </Button>
  )
}
