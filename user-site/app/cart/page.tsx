import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CartContent } from "@/components/cart-content"

export default function CartPage() {
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
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-8 text-white text-center drop-shadow-lg">
            Shopping <span className="text-primary">Cart</span>
          </h1>
          <CartContent />
        </div>
      </main>

      <Footer />
    </div>
  )
}
