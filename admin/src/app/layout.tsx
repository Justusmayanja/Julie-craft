import type { Metadata } from "next";
import "./globals.css";
import { AdminLayout } from "@/components/admin-layout";
import { AuthProvider } from "@/lib/auth/auth-context";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "JulieCraft Admin - Handmade Business Management",
  description: "Professional admin dashboard for managing JulieCraft handmade business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="font-sans antialiased h-full bg-gray-50 overflow-hidden">
        <AuthProvider>
          <ToastProvider>
            <AdminLayout>{children}</AdminLayout>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
