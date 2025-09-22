import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login?redirect=/admin/analytics")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", data.user.id).single()

  if (!profile?.is_admin) {
    redirect("/")
  }

  // Get analytics data
  const [{ data: orders }, { data: products }, { data: orderItems }] = await Promise.all([
    supabase.from("orders").select("*"),
    supabase.from("products").select("*"),
    supabase.from("order_items").select(`
        *,
        products (
          name,
          categories (
            name
          )
        )
      `),
  ])

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Analytics</h1>
              <p className="text-muted-foreground">Business insights and performance metrics</p>
            </div>

            <AnalyticsDashboard orders={orders || []} products={products || []} orderItems={orderItems || []} />
          </div>
        </main>
      </div>
    </div>
  )
}
