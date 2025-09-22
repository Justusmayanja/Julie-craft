import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductGrid } from "@/components/product-grid"
import { notFound } from "next/navigation"

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const supabase = await createClient()

  // Get category info
  const { data: categoryData } = await supabase.from("categories").select("*").eq("name", category).single()

  if (!categoryData) {
    notFound()
  }

  // Get products in this category
  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      categories (
        name
      )
    `)
    .eq("category_id", categoryData.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Category Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-balance">{categoryData.name} Collection</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
              {categoryData.description}
            </p>
          </div>

          {/* Products */}
          <ProductGrid products={products || []} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
