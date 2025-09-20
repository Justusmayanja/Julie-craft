import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"

interface Customer {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  city: string | null
  state: string | null
  created_at: string
  orders: Array<{
    id: string
    total_amount: number
    created_at: string
  }>
}

interface CustomersTableProps {
  customers: Customer[]
}

export function CustomersTable({ customers }: CustomersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Customers ({customers.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {customers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No customers yet</h3>
            <p className="text-muted-foreground">Customer accounts will appear here when users sign up.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {customers.map((customer) => {
              const totalSpent = customer.orders.reduce((sum, order) => sum + order.total_amount, 0)
              const orderCount = customer.orders.length

              return (
                <div key={customer.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {customer.first_name && customer.last_name
                          ? `${customer.first_name} ${customer.last_name}`
                          : customer.email || "Unknown Customer"}
                      </h3>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                      {customer.phone && <p className="text-sm text-muted-foreground">{customer.phone}</p>}
                      {customer.city && customer.state && (
                        <p className="text-sm text-muted-foreground">
                          {customer.city}, {customer.state}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(customer.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant="secondary">{orderCount} orders</Badge>
                      <p className="font-bold">${totalSpent.toFixed(2)} total</p>
                      {customer.orders.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Last order: {new Date(customer.orders[0].created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
