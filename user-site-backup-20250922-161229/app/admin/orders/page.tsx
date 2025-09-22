import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { OrdersTable } from "@/components/orders-table"

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login?redirect=/admin/orders")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", data.user.id).single()

  if (!profile?.is_admin) {
    redirect("/")
  }

  // Get orders with customer and order items data
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      profiles (
        first_name,
        last_name,
        email
      ),
      order_items (
        *,
        products (
          name,
          image_url
        )
      )
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Orders</h1>
              <p className="text-muted-foreground">Manage customer orders</p>
            </div>

            <OrdersTable orders={orders || []} />
          </div>
        </main>
      </div>
    </div>
  )
}
