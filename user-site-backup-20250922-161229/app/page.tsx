import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

export default async function HomePage() {
  const supabase = await createClient()

  // Mock data for when Supabase is not configured
  const mockCategories = [
    {
      id: "1",
      name: "Door Mats",
      description: "Traditional African sisal door mats",
      image_url: "/mart1.jpg"
    },
    {
      id: "2", 
      name: "Sisal Chairs",
      description: "Handcrafted chairs from traditional African sisal",
      image_url: "/image2.jpg"
    },
    {
      id: "3",
      name: "Sisal Baskets", 
      description: "Beautiful woven sisal baskets and containers",
      image_url: "/mart3.jpg"
    },
    {
      id: "4",
      name: "Sisal Decor",
      description: "Decorative sisal items for your home",
      image_url: "/worker.jpg"
    }
  ]

  const mockFeaturedProducts = [
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
    }
  ]

  let featuredProducts, categories

  try {
    // Try to fetch from Supabase
    const featuredResponse = await supabase
      .from("products")
      .select(`
        *,
        categories (
          name
        )
      `)
      .eq("is_featured", true)
      .eq("is_active", true)
      .limit(6)

    const categoriesResponse = await supabase.from("categories").select("*").limit(4)

    featuredProducts = featuredResponse.data || mockFeaturedProducts
    categories = categoriesResponse.data || mockCategories
  } catch (error) {
    // Fallback to mock data if Supabase is not configured
    featuredProducts = mockFeaturedProducts
    categories = mockCategories
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/background1.jpg"
              alt="Artisan workshop background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl lg:text-7xl font-bold text-white text-balance mb-8 drop-shadow-lg">
                Traditional African <span className="text-primary">Sisal</span> Crafts
              </h1>
              <p className="text-xl lg:text-2xl text-white/90 text-pretty mb-12 leading-relaxed drop-shadow-md max-w-3xl mx-auto">
                Discover authentic door mats, chairs, and decorative items crafted from traditional African sisal fiber. 
                Each piece from our workshop in Ntinda, Kampala tells a story of Ugandan heritage and skilled craftsmanship.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-white shadow-lg">
                  <Link href="/products">Shop All Products</Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="border-white text-white hover:bg-white hover:text-primary">
                  <Link href="/about">Meet Our Artisans</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 lg:py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-foreground">Shop by Category</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
                Explore our carefully curated collections of traditional African sisal products, each category representing different
                aspects of Ugandan craftsmanship and cultural heritage.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {categories?.map((category) => (
                <Link key={category.id} href={`/products/${category.name.toLowerCase()}`}>
                  <Card className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 shadow-lg hover:scale-105 bg-white/70 backdrop-blur-md">
                    <div className="aspect-square relative overflow-hidden">
                      <Image
                        src={category.image_url || "/placeholder.svg?height=300&width=300"}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <CardContent className="p-8 text-center">
                      <h3 className="font-bold text-xl mb-3 text-foreground group-hover:text-primary transition-colors duration-300">{category.name}</h3>
                      <p className="text-muted-foreground text-pretty leading-relaxed">{category.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-12 lg:py-20 bg-gradient-to-b from-muted/30 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-foreground">Featured Products</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
                Handpicked favorites from our Ntinda workshop. These special pieces showcase exceptional
                Ugandan craftsmanship and traditional African sisal weaving techniques.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {featuredProducts?.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <Card className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 shadow-lg hover:scale-105 bg-white/75 backdrop-blur-md">
                    <div className="aspect-square relative overflow-hidden">
                      <Image
                        src={product.image_url || "/placeholder.svg?height=400&width=400"}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <Badge className="absolute top-4 left-4 bg-primary text-white shadow-lg">Featured</Badge>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <CardContent className="p-8">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-xl text-balance text-foreground group-hover:text-primary transition-colors duration-300">{product.name}</h3>
                        <span className="text-2xl font-bold text-primary">${product.price}</span>
                      </div>
                      <p className="text-muted-foreground mb-4 text-pretty leading-relaxed">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{product.categories?.name}</Badge>
                        <span className="text-sm text-muted-foreground font-medium">{product.stock_quantity} in stock</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mt-16">
              <Button size="lg" variant="outline" asChild className="border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300">
                <Link href="/products">View All Products</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Craftsmanship Story Section */}
        <section className="py-12 lg:py-20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <h2 className="text-4xl lg:text-5xl font-bold mb-8 text-balance text-foreground">The Art of African Sisal</h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Every piece in our collection is created by skilled artisans in Ntinda, Kampala who have dedicated their lives to
                  perfecting the traditional art of sisal weaving. From door mats to chairs, from baskets to decorative items,
                  each piece carries the passion and expertise of Ugandan craftsmanship.
                </p>
                <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                  When you choose our sisal products, you're not just buying a product – you're supporting
                  traditional Ugandan techniques, sustainable practices, and the livelihoods of talented creators in our
                  Ntinda artisan community.
                </p>
                <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-white shadow-lg">
                  <Link href="/about">Learn Our Story</Link>
                </Button>
              </div>
              <div className="relative aspect-square lg:aspect-[4/3] order-1 lg:order-2">
                <Image
                  src="/worker 4.jpg"
                  alt="Artisan crafting pottery"
                  fill
                  className="object-cover rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
