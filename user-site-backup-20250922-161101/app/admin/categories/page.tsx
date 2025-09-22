import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { CategoriesManagement } from "@/components/categories-management"

export default async function AdminCategoriesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login?redirect=/admin/categories")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", data.user.id).single()

  if (!profile?.is_admin) {
    redirect("/")
  }

  // Get categories with product count
  const { data: categories } = await supabase
    .from("categories")
    .select(`
      *,
      products (
        id
      )
    `)
    .order("name")

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Categories</h1>
              <p className="text-muted-foreground">Manage product categories</p>
            </div>

            <CategoriesManagement categories={categories || []} />
          </div>
        </main>
      </div>
    </div>
  )
}
