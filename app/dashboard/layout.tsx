import { AppSidebar } from "@/app/dashboard/app-sidebar"
import { SiteHeader } from "@/app/dashboard/site-header"
import { LoadingBar } from "@/app/dashboard/loading-bar"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider className="min-h-screen">
      <div className="flex h-screen overflow-hidden relative">
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
  )
} 