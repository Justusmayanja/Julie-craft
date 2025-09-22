import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Truck, Package, Clock, Shield } from "lucide-react"

export default function ShippingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-r from-card to-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl lg:text-5xl font-bold text-balance mb-6">Shipping Information</h1>
              <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                We carefully package and ship your handmade treasures with the utmost care to ensure they arrive safely
                at your door.
              </p>
            </div>
          </div>
        </section>

        {/* Shipping Options */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Truck className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Free Shipping</h3>
                  <p className="text-sm text-muted-foreground">On orders over $150</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Package className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Secure Packaging</h3>
                  <p className="text-sm text-muted-foreground">Eco-friendly materials</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Fast Processing</h3>
                  <p className="text-sm text-muted-foreground">1-3 business days</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Insured Delivery</h3>
                  <p className="text-sm text-muted-foreground">Full value protection</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Shipping Rates */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Rates & Times</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Standard Shipping</h4>
                      <p className="text-sm text-muted-foreground">5-7 business days</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">$12.99</Badge>
                      <p className="text-xs text-muted-foreground mt-1">Free over $150</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Express Shipping</h4>
                      <p className="text-sm text-muted-foreground">2-3 business days</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">$24.99</Badge>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Overnight Shipping</h4>
                      <p className="text-sm text-muted-foreground">1 business day</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">$49.99</Badge>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div>
                      <h4 className="font-semibold">Large Item Delivery</h4>
                      <p className="text-sm text-muted-foreground">Furniture & large crafts</p>
                    </div>
                    <div className="text-right">
                      <Badge>Contact Us</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Processing & Packaging */}
              <Card>
                <CardHeader>
                  <CardTitle>Processing & Packaging</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Processing Time</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Most items ship within 1-3 business days. Custom orders and large furniture pieces may require 4-8
                      weeks for completion.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Packaging</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      We use sustainable packaging materials including recycled cardboard, biodegradable packing
                      peanuts, and protective wrapping to ensure your items arrive safely.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Special Handling</h4>
                    <p className="text-sm text-muted-foreground">
                      Fragile items like pottery and glassware receive extra padding and "Fragile" labels. Large
                      furniture pieces are professionally crated for maximum protection.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* International Shipping */}
        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">International Shipping</h2>
              <Card>
                <CardContent className="p-8">
                  <p className="text-muted-foreground mb-6 text-center">
                    We're happy to ship our handmade crafts worldwide! International shipping rates and times vary by
                    destination.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Shipping Times</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Canada: 7-14 business days</li>
                        <li>• Europe: 10-21 business days</li>
                        <li>• Asia/Pacific: 14-28 business days</li>
                        <li>• Other regions: 21-35 business days</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Important Notes</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Customs duties may apply</li>
                        <li>• Tracking provided for all orders</li>
                        <li>• Insurance included on all shipments</li>
                        <li>• Contact us for large item shipping</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
