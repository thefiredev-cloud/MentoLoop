"use client"

import { AppSidebar } from "@/app/dashboard/app-sidebar"
import { SiteHeader } from "@/app/dashboard/site-header"
import { LoadingBar } from "@/app/dashboard/loading-bar"
import { DashboardNavbar } from "@/app/dashboard/dashboard-navbar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { PageTransition } from "@/components/ui/page-transition"
// Dashboard uses a simplified footer to avoid layout overlap
import { Suspense } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Top Navbar - Fixed at top */}
      <Suspense fallback={<div className="h-14 bg-background border-b" />}>
        <DashboardNavbar />
      </Suspense>
      
      {/* Main Dashboard Container - Below Navbar */}
      <div className="min-h-screen pt-14 flex flex-col dashboard-shell">
        <SidebarProvider>
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Sidebar - fixed width, no z-index conflicts */}
            <Suspense fallback={<div className="w-64 bg-background border-r" />}>
              <AppSidebar />
            </Suspense>
            
            {/* Main Content Area - with proper margin for sidebar */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Loading Bar */}
              <LoadingBar />
              
              {/* Header */}
              <SiteHeader />
              
              {/* Main Content */}
              <main className="flex-1 overflow-y-auto bg-background/90 dashboard-content relative">
                <PageTransition preset="blur-fade">
                  <div className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8 mt-2">
                    {children}
                  </div>
                </PageTransition>
              </main>
            </div>
          </div>
        </SidebarProvider>
        {/* Footer */}
        <div className="w-full border-t border-border bg-card">
          <div className="container max-w-7xl mx-auto p-4 text-xs text-muted-foreground">
            © MentoLoop. Need help? Call 512-710-3320
          </div>
        </div>
      </div>
    </>
  )
} 
