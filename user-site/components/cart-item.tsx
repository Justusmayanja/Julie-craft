"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCartStore, type CartItem as CartItemType } from "@/lib/cart-store"
import { Minus, Plus, Trash2 } from "lucide-react"

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore()

  const incrementQuantity = () => {
    updateQuantity(item.id, item.quantity + 1)
  }

  const decrementQuantity = () => {
    updateQuantity(item.id, item.quantity - 1)
  }

  const handleRemove = () => {
    removeItem(item.id)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Product Image */}
          <Link href={`/product/${item.id}`} className="flex-shrink-0">
            <div className="w-20 h-20 relative rounded-md overflow-hidden">
              <Image
                src={item.image_url || "/placeholder.svg?height=80&width=80"}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
          </Link>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <Link href={`/product/${item.id}`}>
              <h3 className="font-semibold text-balance hover:text-primary transition-colors">{item.name}</h3>
            </Link>
            <p className="text-sm text-muted-foreground mt-1">${item.price.toFixed(2)} each</p>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={decrementQuantity}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={incrementQuantity}
              disabled={item.quantity >= item.stock_quantity}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Price and Remove */}
          <div className="flex flex-col items-end gap-2">
            <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
