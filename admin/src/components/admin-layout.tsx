"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { useAuth } from "@/lib/auth/auth-context"
import { Loader2 } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Redirect to welcome page if not authenticated and not on welcome/login pages
  useEffect(() => {
    if (!loading && !user && pathname !== '/admin/login' && pathname !== '/admin/welcome') {
      router.push('/admin/welcome')
    }
  }, [user, loading, pathname, router])

  const closeSidebar = () => setSidebarOpen(false)

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-600" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render layout for login and welcome pages
  if (pathname === '/admin/login' || pathname === '/admin/welcome') {
    return <>{children}</>
  }

  // Don't render layout if not authenticated
  if (!user) {
    return null
  }

  return (
    <div className="h-full flex min-w-0">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 
        fixed md:relative 
        z-50 md:z-auto 
        transition-transform duration-300 ease-in-out
        md:transition-none
      `}>
        <AdminSidebar onClose={closeSidebar} />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50/30 min-h-0">
          {children}
        </main>
      </div>
    </div>
  )
}
