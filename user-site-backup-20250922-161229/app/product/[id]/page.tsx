import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductDetails } from "@/components/product-details"
import { RelatedProducts } from "@/components/related-products"
import { notFound } from "next/navigation"

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch product details
  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      categories (
        id,
        name,
        description
      )
    `)
    .eq("id", id)
    .eq("is_active", true)
    .single()

  if (!product) {
    notFound()
  }

  // Fetch related products from same category
  const { data: relatedProducts } = await supabase
    .from("products")
    .select(`
      *,
      categories (
        name
      )
    `)
    .eq("category_id", product.category_id)
    .eq("is_active", true)
    .neq("id", id)
    .limit(4)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <ProductDetails product={product} />

        {relatedProducts && relatedProducts.length > 0 && <RelatedProducts products={relatedProducts} />}
      </main>

      <Footer />
    </div>
  )
}
