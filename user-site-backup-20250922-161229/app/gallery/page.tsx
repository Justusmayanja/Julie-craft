import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export default async function GalleryPage() {
  const supabase = await createClient()

  // Mock gallery data for traditional crafts
  const galleryItems = [
    {
      id: "1",
      title: "Traditional Sisal Door Mat",
      description: "Handwoven African sisal door mat with traditional patterns",
      image_url: "/mart1.jpg",
      category: "Door Mats"
    },
    {
      id: "2",
      title: "Sisal Woven Chair",
      description: "Comfortable chair crafted from traditional African sisal fiber",
      image_url: "/image2.jpg",
      category: "Sisal Chairs"
    },
    {
      id: "3",
      title: "Decorative Sisal Basket",
      description: "Beautiful handwoven sisal basket for storage and decoration",
      image_url: "/mart3.jpg",
      category: "Sisal Baskets"
    },
    {
      id: "4",
      title: "Sisal Wall Hanging",
      description: "Decorative sisal wall hanging with traditional motifs",
      image_url: "/worker.jpg",
      category: "Sisal Decor"
    },
    {
      id: "5",
      title: "Traditional Sisal Rug",
      description: "Large sisal rug perfect for living spaces",
      image_url: "/worker 4.jpg",
      category: "Door Mats"
    },
    {
      id: "6",
      title: "Sisal Storage Baskets",
      description: "Set of woven sisal storage baskets",
      image_url: "/employee1.jpg",
      category: "Sisal Baskets"
    }
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{
      backgroundImage: "url('/background 3.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed"
    }}>
      <div className="absolute inset-0 bg-black/40"></div>
      
      <Header />

      <main className="flex-1 relative z-10">
        <div className="container mx-auto px-4 py-12">
          {/* Gallery Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Our <span className="text-primary">Gallery</span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              Explore our collection of traditional African sisal crafts. Each piece is handcrafted 
              with love and represents the rich cultural heritage of Uganda.
            </p>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryItems.map((item) => (
              <Card key={item.id} className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 shadow-lg hover:scale-105 bg-white/80 backdrop-blur-md">
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 left-4 bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {item.category}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-pretty leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
