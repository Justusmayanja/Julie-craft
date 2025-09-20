import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ProductsManagement } from "@/components/products-management"

export default async function AdminProductsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login?redirect=/admin/products")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", data.user.id).single()

  if (!profile?.is_admin) {
    redirect("/")
  }

  // Get products and categories
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("name"),
  ])

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Products</h1>
              <p className="text-muted-foreground">Manage your product catalog</p>
            </div>

            <ProductsManagement products={products || []} categories={categories || []} />
          </div>
        </main>
      </div>
    </div>
  )
}
