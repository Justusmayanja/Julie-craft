import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { CustomersTable } from "@/components/customers-table"

export default async function AdminCustomersPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login?redirect=/admin/customers")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", data.user.id).single()

  if (!profile?.is_admin) {
    redirect("/")
  }

  // Get customers with order count
  const { data: customers } = await supabase
    .from("profiles")
    .select(`
      *,
      orders (
        id,
        total_amount,
        created_at
      )
    `)
    .eq("is_admin", false)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />

      <div className="flex">
        <AdminSidebar />

        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Customers</h1>
              <p className="text-muted-foreground">Manage customer accounts</p>
            </div>

            <CustomersTable customers={customers || []} />
          </div>
        </main>
      </div>
    </div>
  )
}
