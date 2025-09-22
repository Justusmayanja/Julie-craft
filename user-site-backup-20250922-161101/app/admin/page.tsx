import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login?redirect=/admin")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", data.user.id).single()

  if (!profile?.is_admin) {
    redirect("/")
  }

  // Get dashboard data
  const [{ data: products }, { data: orders }, { data: categories }, { data: recentOrders }] = await Promise.all([
    supabase.from("products").select("*"),
    supabase.from("orders").select("*"),
    supabase.from("categories").select("*"),
    supabase
      .from("orders")
      .select(`
        *,
        profiles (
          first_name,
          last_name,
          email
        )
      `)
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  const stats = {
    totalProducts: products?.length || 0,
    totalOrders: orders?.length || 0,
    totalCategories: categories?.length || 0,
    totalRevenue: orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0,
  }

  return <AdminDashboard stats={stats} recentOrders={recentOrders || []} />
}
