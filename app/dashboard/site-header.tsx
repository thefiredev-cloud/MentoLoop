"use client"

import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

function getPageTitle(pathname: string): string {
  // Handle exact matches and patterns
  if (pathname === "/dashboard") return "Dashboard"
  if (pathname === "/dashboard/payment-gated") return "Payment Required"
  
  // Student pages
  if (pathname === "/dashboard/student") return "Student Dashboard"
  if (pathname === "/dashboard/student/matches") return "My Matches"
  if (pathname === "/dashboard/student/rotations") return "My Rotations"
  if (pathname === "/dashboard/student/hours") return "Hours Tracking"
  if (pathname === "/dashboard/student/documents") return "Documents"
  if (pathname === "/dashboard/student/evaluations") return "Evaluations"
  if (pathname === "/dashboard/student/profile") return "My Profile"
  if (pathname === "/dashboard/student/search") return "Find Preceptors"
  
  // Preceptor pages
  if (pathname === "/dashboard/preceptor") return "Preceptor Dashboard"
  if (pathname === "/dashboard/preceptor/matches") return "Student Matches"
  if (pathname === "/dashboard/preceptor/students") return "My Students"
  if (pathname === "/dashboard/preceptor/schedule") return "Schedule"
  if (pathname === "/dashboard/preceptor/documents") return "Documents"
  if (pathname === "/dashboard/preceptor/evaluations") return "Evaluations"
  if (pathname === "/dashboard/preceptor/profile") return "My Profile"
  
  // Enterprise pages
  if (pathname === "/dashboard/enterprise") return "Enterprise Dashboard"
  if (pathname === "/dashboard/enterprise/students") return "Students"
  if (pathname === "/dashboard/enterprise/preceptors") return "Preceptors"
  if (pathname === "/dashboard/enterprise/analytics") return "Analytics"
  if (pathname === "/dashboard/enterprise/reports") return "Reports"
  if (pathname === "/dashboard/enterprise/settings") return "Organization Settings"
  if (pathname === "/dashboard/enterprise/billing") return "Billing"
  if (pathname === "/dashboard/enterprise/agreements") return "Agreements"
  if (pathname === "/dashboard/enterprise/compliance") return "Compliance Reports"
  
  // Admin pages
  if (pathname === "/dashboard/admin") return "Admin Dashboard"
  if (pathname === "/dashboard/admin/users") return "User Management"
  if (pathname === "/dashboard/admin/matches") return "Match Management"
  if (pathname === "/dashboard/admin/finance") return "Financial Management"
  if (pathname === "/dashboard/admin/emails") return "Email Analytics"
  if (pathname === "/dashboard/admin/sms") return "SMS Analytics"
  if (pathname === "/dashboard/admin/audit") return "Audit Logs"
  
  // Common pages
  if (pathname === "/dashboard/messages") return "Messages"
  if (pathname === "/dashboard/billing") return "Billing"
  if (pathname === "/dashboard/analytics") return "Analytics"
  if (pathname === "/dashboard/ai-matching-test") return "AI Matching Test"
  if (pathname === "/dashboard/test-communications") return "Test Communications"
  
  return "Dashboard"
}

export function SiteHeader() {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)
  
  // Hide title on admin dashboard main page since navbar already shows it
  const hideTitle = pathname === "/dashboard/admin"

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background w-full">
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-1 lg:gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          {!hideTitle && <h1 className="text-base font-medium">{pageTitle}</h1>}
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
