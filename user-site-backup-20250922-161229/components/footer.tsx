import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-muted/30 to-muted/60 border-t border-primary/20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg"></div>
              <span className="text-2xl font-bold text-foreground">Julie's Crafts</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Discover authentic traditional African sisal door mats, chairs, and decorative items crafted with love in Ntinda, Kampala.
              Each piece tells a story of Ugandan heritage and skilled craftsmanship.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary transition-colors duration-300">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary transition-colors duration-300">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary transition-colors duration-300">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h3 className="font-semibold">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/products/pottery"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pottery
                </Link>
              </li>
              <li>
                <Link
                  href="/products/jewelry"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Jewelry
                </Link>
              </li>
              <li>
                <Link
                  href="/products/textiles"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Textiles
                </Link>
              </li>
              <li>
                <Link
                  href="/products/woodwork"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Woodwork
                </Link>
              </li>
              <li>
                <Link
                  href="/products/featured"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Featured Items
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-muted-foreground hover:text-foreground transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-muted-foreground hover:text-foreground transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/care" className="text-muted-foreground hover:text-foreground transition-colors">
                  Care Instructions
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold">Stay Connected</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for new arrivals and artisan stories.
            </p>
            <div className="flex space-x-2">
              <Input placeholder="Your email" className="flex-1" />
              <Button size="icon">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">© 2024 Julie's Craft. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
