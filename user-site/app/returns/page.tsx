import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Shield, Clock, Heart } from "lucide-react"
import Link from "next/link"

export default function ReturnsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-r from-card to-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl lg:text-5xl font-bold text-balance mb-6">Returns & Exchanges</h1>
              <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                Your satisfaction is our priority. We want you to love your handmade treasures, and we're here to help
                if something isn't quite right.
              </p>
            </div>
          </div>
        </section>

        {/* Return Policy Overview */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">30-Day Returns</h3>
                  <p className="text-sm text-muted-foreground">Full refund period</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <RotateCcw className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Easy Process</h3>
                  <p className="text-sm text-muted-foreground">Simple return steps</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Quality Guarantee</h3>
                  <p className="text-sm text-muted-foreground">Defect protection</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Customer Care</h3>
                  <p className="text-sm text-muted-foreground">Personal support</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Return Policy */}
              <Card>
                <CardHeader>
                  <CardTitle>Return Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Badge variant="secondary">30 Days</Badge>
                      Return Window
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      You have 30 days from the delivery date to return items for a full refund. Items must be in
                      original condition with all packaging materials.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Eligible Items</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Pottery and ceramics (if undamaged)</li>
                      <li>• Jewelry and accessories</li>
                      <li>• Textiles and fabrics</li>
                      <li>• Small woodwork items</li>
                      <li>• Home decor pieces</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Non-Returnable Items</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Custom-made or personalized items</li>
                      <li>• Large furniture pieces (contact us first)</li>
                      <li>• Items damaged by customer use</li>
                      <li>• Perishable or consumable goods</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* How to Return */}
              <Card>
                <CardHeader>
                  <CardTitle>How to Return an Item</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Contact Us</h4>
                        <p className="text-sm text-muted-foreground">
                          Email us at returns@juliescraft.com or call (555) 123-4567 to initiate your return.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Get Return Label</h4>
                        <p className="text-sm text-muted-foreground">
                          We'll email you a prepaid return shipping label and instructions.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Package Securely</h4>
                        <p className="text-sm text-muted-foreground">
                          Pack the item in its original packaging or similar protective materials.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                        4
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Ship & Track</h4>
                        <p className="text-sm text-muted-foreground">
                          Drop off at any authorized shipping location and track your return.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button asChild className="w-full">
                      <Link href="/contact">Start a Return</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Exchanges & Refunds */}
        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">Exchanges & Refunds</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Exchanges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Need a different size, color, or style? We're happy to help you find the perfect piece.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Free exchanges within 30 days</li>
                      <li>• Subject to availability</li>
                      <li>• Price differences may apply</li>
                      <li>• Same return process applies</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Refund Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Once we receive your returned item, we'll process your refund quickly.
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Inspection: 1-2 business days</li>
                      <li>• Refund processing: 2-3 business days</li>
                      <li>• Bank processing: 3-5 business days</li>
                      <li>• Email confirmation sent</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Damaged Items */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Damaged or Defective Items</h2>
              <Card>
                <CardContent className="p-8">
                  <p className="text-muted-foreground mb-6">
                    While we take great care in packaging, sometimes items can be damaged during shipping. If you
                    receive a damaged or defective item, we'll make it right immediately.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div>
                      <h4 className="font-semibold mb-3">What to Do</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Contact us within 48 hours</li>
                        <li>• Take photos of the damage</li>
                        <li>• Keep all packaging materials</li>
                        <li>• Don't attempt repairs</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">We'll Provide</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Immediate replacement or refund</li>
                        <li>• Prepaid return shipping</li>
                        <li>• Priority processing</li>
                        <li>• Personal follow-up</li>
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
