import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

export default function AboutPage() {
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
        {/* Hero Section */}
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl lg:text-6xl font-bold text-white text-balance mb-8 drop-shadow-lg">
                Meet Julie & Our <span className="text-primary">Artisan Community</span>
              </h1>
              <p className="text-xl lg:text-2xl text-white/90 text-pretty leading-relaxed drop-shadow-md">
                Welcome to Julie's Crafts, where passion meets tradition and every piece tells a story of dedication,
                skill, and love for traditional African sisal craftsmanship.
              </p>
            </div>
          </div>
        </section>

        {/* Julie's Story */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-square lg:aspect-[4/3]">
                <Image
                  src="/julie-working-on-handmade-craft-chair-in-workshop.jpg"
                  alt="Julie crafting a handmade chair"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-balance">Julie's Journey</h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  What started as a hobby in my garage has grown into a thriving community of skilled artisans. I began
                  crafting chairs and furniture pieces over 15 years ago, driven by a love for working with my hands and
                  creating something beautiful and functional.
                </p>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Today, Julie's Craft represents not just my work, but the incredible talents of dozens of artisans who
                  share the same passion for quality, sustainability, and the timeless appeal of handmade goods.
                </p>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Every craft chair, pottery piece, textile, and wooden creation in our collection is made with care,
                  using traditional techniques passed down through generations.
                </p>
                <Button size="lg" asChild>
                  <Link href="/products">Shop Our Collection</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Our Artisans */}
        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Our Talented Artisans</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                Meet some of the incredible craftspeople who bring our vision to life through their dedication to
                traditional techniques and innovative designs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="overflow-hidden">
                <div className="aspect-square relative">
                  <Image src="/master-woodworker-crafting-chair.jpg" alt="Master woodworker" fill className="object-cover" />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">Marcus Chen</h3>
                  <p className="text-sm text-muted-foreground mb-3">Master Woodworker</p>
                  <p className="text-sm text-muted-foreground text-pretty">
                    Specializes in handcrafted chairs and furniture with 20+ years of experience in traditional joinery
                    techniques.
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <div className="aspect-square relative">
                  <Image src="/potter-working-at-pottery-wheel.jpg" alt="Master potter" fill className="object-cover" />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">Sarah Williams</h3>
                  <p className="text-sm text-muted-foreground mb-3">Ceramic Artist</p>
                  <p className="text-sm text-muted-foreground text-pretty">
                    Creates beautiful pottery pieces using traditional wheel throwing and glazing techniques.
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <div className="aspect-square relative">
                  <Image src="/textile-artist-weaving-on-loom.jpg" alt="Textile artist" fill className="object-cover" />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">Elena Rodriguez</h3>
                  <p className="text-sm text-muted-foreground mb-3">Textile Artist</p>
                  <p className="text-sm text-muted-foreground text-pretty">
                    Hand-weaves beautiful textiles and creates unique jewelry pieces using traditional methods.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Our Values</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                Everything we do is guided by our commitment to quality, sustainability, and supporting artisan
                communities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-primary-foreground">🌱</span>
                </div>
                <h3 className="font-semibold text-lg mb-3">Sustainable Practices</h3>
                <p className="text-muted-foreground text-pretty">
                  We use eco-friendly materials and traditional techniques that have minimal environmental impact.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-primary-foreground">✋</span>
                </div>
                <h3 className="font-semibold text-lg mb-3">Handmade Quality</h3>
                <p className="text-muted-foreground text-pretty">
                  Every piece is carefully crafted by hand, ensuring unique character and exceptional quality.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-primary-foreground">🤝</span>
                </div>
                <h3 className="font-semibold text-lg mb-3">Community Support</h3>
                <p className="text-muted-foreground text-pretty">
                  We support local artisans and traditional crafts, helping preserve cultural heritage.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
