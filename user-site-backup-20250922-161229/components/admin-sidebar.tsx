"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FolderOpen, 
  Users, 
  Settings, 
  BarChart3,
  Warehouse,
  Palette,
  TrendingUp
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    name: "Categories",
    href: "/admin/categories",
    icon: FolderOpen,
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    name: "Inventory",
    href: "/admin/inventory",
    icon: Warehouse,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: TrendingUp,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700 min-h-screen shadow-lg">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">CraftAdmin</h1>
            <p className="text-sm text-amber-400 font-medium">Handmade Business</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-slate-800 text-amber-300 border-r-2 border-amber-400 shadow-sm"
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-amber-300 hover:shadow-sm",
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 transition-colors",
                isActive ? "text-amber-400" : "text-slate-400 group-hover:text-amber-400"
              )} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
      
      <div className="absolute bottom-6 left-4 right-4">
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm font-medium text-white">System Status</span>
          </div>
          <p className="text-xs text-slate-300">All systems operational</p>
        </div>
      </div>
    </div>
  )
}
