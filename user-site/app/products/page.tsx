import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"
import { Suspense } from "react"

interface SearchParams {
  category?: string
  search?: string
  sort?: string
  page?: string
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query
  let query = supabase
    .from("products")
    .select(`
      *,
      categories (
        id,
        name
      )
    `)
    .eq("is_active", true)

  // Apply filters
  if (params.category) {
    const { data: categoryData } = await supabase.from("categories").select("id").eq("name", params.category).single()

    if (categoryData) {
      query = query.eq("category_id", categoryData.id)
    }
  }

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }

  // Apply sorting
  switch (params.sort) {
    case "price-low":
      query = query.order("price", { ascending: true })
      break
    case "price-high":
      query = query.order("price", { ascending: false })
      break
    case "name":
      query = query.order("name", { ascending: true })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  const { data: products } = await query

  // Get categories for filter
  const { data: categories } = await supabase.from("categories").select("*").order("name")

  // Mock data for traditional crafts when Supabase is not configured
  const mockProducts = [
    {
      id: "1",
      name: "Traditional Sisal Door Mat",
      description: "Handwoven African sisal door mat with traditional patterns",
      price: 25,
      image_url: "/mart1.jpg",
      stock_quantity: 15,
      is_featured: true,
      categories: { name: "Door Mats" }
    },
    {
      id: "2",
      name: "Sisal Woven Chair",
      description: "Comfortable chair crafted from traditional African sisal fiber",
      price: 85,
      image_url: "/image2.jpg",
      stock_quantity: 8,
      is_featured: true,
      categories: { name: "Sisal Chairs" }
    },
    {
      id: "3",
      name: "Decorative Sisal Basket",
      description: "Beautiful handwoven sisal basket for storage and decoration",
      price: 35,
      image_url: "/mart3.jpg",
      stock_quantity: 12,
      is_featured: true,
      categories: { name: "Sisal Baskets" }
    },
    {
      id: "4",
      name: "Sisal Wall Hanging",
      description: "Decorative sisal wall hanging with traditional motifs",
      price: 45,
      image_url: "/worker.jpg",
      stock_quantity: 6,
      is_featured: false,
      categories: { name: "Sisal Decor" }
    },
    {
      id: "5",
      name: "Traditional Sisal Rug",
      description: "Large sisal rug perfect for living spaces",
      price: 120,
      image_url: "/worker 4.jpg",
      stock_quantity: 4,
      is_featured: false,
      categories: { name: "Door Mats" }
    },
    {
      id: "6",
      name: "Sisal Storage Baskets",
      description: "Set of woven sisal storage baskets",
      price: 55,
      image_url: "/employee1.jpg",
      stock_quantity: 10,
      is_featured: false,
      categories: { name: "Sisal Baskets" }
    }
  ]

  const mockCategories = [
    { id: "1", name: "Door Mats" },
    { id: "2", name: "Sisal Chairs" },
    { id: "3", name: "Sisal Baskets" },
    { id: "4", name: "Sisal Decor" }
  ]

  const displayProducts = products && products.length > 0 ? products : mockProducts
  const displayCategories = categories && categories.length > 0 ? categories : mockCategories

  return (
    <div className="min-h-screen flex flex-col" style={{
      backgroundImage: "url('/background1.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed"
    }}>
      <div className="absolute inset-0 bg-black/30"></div>
      
      <Header />

      <main className="flex-1 relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-white drop-shadow-lg">
              {params.category ? `${params.category} Collection` : "Traditional Crafts"}
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto drop-shadow-md">
              {params.category
                ? `Discover our handcrafted ${params.category.toLowerCase()} pieces from Ntinda, Kampala`
                : "Discover our complete collection of traditional African sisal crafts"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <Suspense fallback={<div className="text-white">Loading filters...</div>}>
                <ProductFilters
                  categories={displayCategories}
                  currentCategory={params.category}
                  currentSort={params.sort}
                />
              </Suspense>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <Suspense fallback={<div className="text-white">Loading products...</div>}>
                <ProductGrid products={displayProducts} />
              </Suspense>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
