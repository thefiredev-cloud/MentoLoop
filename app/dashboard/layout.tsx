"use client"

import { AppSidebar } from "@/app/dashboard/app-sidebar"
import { SiteHeader } from "@/app/dashboard/site-header"
import { LoadingBar } from "@/app/dashboard/loading-bar"
import { DashboardNavbar } from "@/app/dashboard/dashboard-navbar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar - Fixed at top */}
      <DashboardNavbar />
      
      {/* Main Dashboard Container - Below Navbar */}
      <SidebarProvider className="flex-1 pt-14">
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden relative">
          {/* Sidebar */}
          <AppSidebar />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Loading Bar */}
            <LoadingBar />
            
            {/* Header */}
            <SiteHeader />
            
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-background">
              <div className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8 mt-2">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  )
} 