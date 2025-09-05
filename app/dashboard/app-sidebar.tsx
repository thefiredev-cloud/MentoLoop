"use client"

import * as React from "react"
import {
  IconChartBar,
  IconMessageCircle,
  IconFileAi,
  IconFileDescription,
  IconHelp,
  IconReport,
  IconSettings,
  IconUsers,
  IconBrandOpenai,
  IconCalendar,
  IconClock,
  IconTarget,
  IconUser,
  IconSchool,
  IconStethoscope,
  IconCreditCard,
  IconMail,
} from "@tabler/icons-react"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { NavDocuments } from "@/app/dashboard/nav-documents"
import { NavMain } from "@/app/dashboard/nav-main"
import { NavSecondary } from "@/app/dashboard/nav-secondary"
import { NavUser } from "@/app/dashboard/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
// import { ChatMaxingIconColoured } from "@/components/logo"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const studentNavData = {
  navMain: [
    {
      title: "My Matches",
      url: "/dashboard/student/matches",
      icon: IconTarget,
    },
    {
      title: "My Rotations",
      url: "/dashboard/student/rotations",
      icon: IconCalendar,
    },
    {
      title: "Hours Tracking",
      url: "/dashboard/student/hours",
      icon: IconClock,
    },
    {
      title: "Messages",
      url: "/dashboard/messages",
      icon: IconMessageCircle,
    },
  ],
  navSecondary: [
    {
      title: "Profile",
      url: "/dashboard/student/profile",
      icon: IconUser,
    },
    {
      title: "Billing",
      url: "/dashboard/billing",
      icon: IconCreditCard,
    },
    {
      title: "Help Center",
      url: "/help",
      icon: IconHelp,
    },
  ],
  documents: [
    {
      name: "Documents",
      url: "/dashboard/student/documents",
      icon: IconFileDescription,
    },
    {
      name: "Evaluations",
      url: "/dashboard/student/evaluations",
      icon: IconFileAi,
    },
  ],
}

const preceptorNavData = {
  navMain: [
    {
      title: "Student Matches",
      url: "/dashboard/preceptor/matches",
      icon: IconUsers,
    },
    {
      title: "My Students",
      url: "/dashboard/preceptor/students",
      icon: IconSchool,
    },
    {
      title: "Schedule",
      url: "/dashboard/preceptor/schedule",
      icon: IconCalendar,
    },
    {
      title: "Messages",
      url: "/dashboard/messages",
      icon: IconMessageCircle,
    },
  ],
  navSecondary: [
    {
      title: "Profile",
      url: "/dashboard/preceptor/profile",
      icon: IconStethoscope,
    },
    {
      title: "Help Center",
      url: "/help",
      icon: IconHelp,
    },
  ],
  documents: [
    {
      name: "Documents",
      url: "/dashboard/preceptor/documents",
      icon: IconFileDescription,
    },
    {
      name: "Evaluations",
      url: "/dashboard/preceptor/evaluations",
      icon: IconFileAi,
    },
  ],
}

const adminNavData = {
  navMain: [
    {
      title: "Admin Dashboard",
      url: "/dashboard/admin",
      icon: IconUsers,
    },
    {
      title: "User Management",
      url: "/dashboard/admin/users",
      icon: IconUser,
    },
    {
      title: "Match Management",
      url: "/dashboard/admin/matches",
      icon: IconTarget,
    },
    {
      title: "Financial Management",
      url: "/dashboard/admin/finance",
      icon: IconCreditCard,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: IconChartBar,
    },
    {
      title: "Email Analytics",
      url: "/dashboard/admin/emails",
      icon: IconMail,
    },
    {
      title: "SMS Analytics",
      url: "/dashboard/admin/sms",
      icon: IconMessageCircle,
    },
    {
      title: "Audit Logs",
      url: "/dashboard/admin/audit",
      icon: IconReport,
    },
    {
      title: "AI Matching Test",
      url: "/dashboard/ai-matching-test",
      icon: IconBrandOpenai,
    },
    {
      title: "Test Communications",
      url: "/dashboard/test-communications",
      icon: IconMessageCircle,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "/help",
      icon: IconHelp,
    },
  ],
  documents: [],
}

const enterpriseNavData = {
  navMain: [
    {
      title: "Students",
      url: "/dashboard/enterprise/students",
      icon: IconSchool,
    },
    {
      title: "Preceptors",
      url: "/dashboard/enterprise/preceptors",
      icon: IconStethoscope,
    },
    {
      title: "Analytics",
      url: "/dashboard/enterprise/analytics",
      icon: IconChartBar,
    },
    {
      title: "Reports",
      url: "/dashboard/enterprise/reports",
      icon: IconReport,
    },
  ],
  navSecondary: [
    {
      title: "Organization Settings",
      url: "/dashboard/enterprise/settings",
      icon: IconSettings,
    },
    {
      title: "Billing",
      url: "/dashboard/enterprise/billing",
      icon: IconCreditCard,
    },
    {
      title: "Help Center",
      url: "/help",
      icon: IconHelp,
    },
  ],
  documents: [
    {
      name: "Agreements",
      url: "/dashboard/enterprise/agreements",
      icon: IconFileDescription,
    },
    {
      name: "Compliance Reports",
      url: "/dashboard/enterprise/compliance",
      icon: IconFileAi,
    },
  ],
}

// const defaultNavData = {
//   navMain: [
//     {
//       title: "Dashboard",
//       url: "/dashboard",
//       icon: IconDashboard,
//     },
//     {
//       title: "Payment gated",
//       url: "/dashboard/payment-gated",
//       icon: IconSparkles,
//     },
//   ],
//   navSecondary: [
//     {
//       title: "Settings",
//       url: "#",
//       icon: IconSettings,
//     },
//     {
//       title: "Get Help",
//       url: "/help",
//       icon: IconHelp,
//     },
//   ],
//   documents: [],
// }

export function AppSidebar({ ...props }: Omit<React.ComponentProps<typeof Sidebar>, 'variant'>) {
  const user = useQuery(api.users.current)
  const unreadCount = useQuery(api.messages.getUnreadMessageCount) || 0
  
  // Determine navigation data based on user type
  const navigationData = React.useMemo(() => {
    let navData;
    switch(user?.userType) {
      case 'student':
        navData = studentNavData
        break
      case 'preceptor':
        navData = preceptorNavData
        break
      case 'enterprise':
        navData = enterpriseNavData
        break
      case 'admin':
        navData = adminNavData
        break
      default:
        // Return minimal navigation for users without a role
        navData = {
          navMain: [],
          navSecondary: [{
            title: "Help Center",
            url: "/help",
            icon: IconHelp,
          }],
          documents: []
        }
    }

    // Add unread message count to Messages item
    if ((user?.userType === 'student' || user?.userType === 'preceptor') && unreadCount > 0) {
      const updatedNavData = {
        ...navData,
        navMain: navData.navMain.map(item => 
          item.title === 'Messages' 
            ? { ...item, badge: unreadCount > 99 ? '99+' : unreadCount.toString() }
            : item
        )
      };
      return updatedNavData;
    }

    return navData;
  }, [user?.userType, unreadCount])

  // Get role-specific styling
  const getRoleBadgeVariant = () => {
    switch(user?.userType) {
      case 'admin': return 'destructive'
      case 'enterprise': return 'default'
      case 'preceptor': return 'secondary'
      case 'student': return 'outline'
      default: return 'outline'
    }
  }

  const getRoleIcon = () => {
    switch(user?.userType) {
      case 'admin': return <IconUsers className="size-4" />
      case 'enterprise': return <IconSchool className="size-4" />
      case 'preceptor': return <IconStethoscope className="size-4" />
      case 'student': return <IconUser className="size-4" />
      default: return null
    }
  }

  return (
    <Sidebar collapsible="offcanvas" className="border-r" {...props}>
      <SidebarHeader className="border-b px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-0 h-auto hover:bg-transparent"
            >
              <Link href="/" className="flex flex-col items-start gap-2">
                <div className="flex items-center">
                  <span className="text-lg font-bold">MentoLoop</span>
                </div>
                {user?.userType && (
                  <Badge 
                    variant={getRoleBadgeVariant()} 
                    className="text-xs capitalize flex items-center gap-1"
                  >
                    {getRoleIcon()}
                    {user.userType} Portal
                  </Badge>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-3 py-2">
        <div className="space-y-4">
          <NavMain items={navigationData.navMain} />
          {navigationData.documents.length > 0 && (
            <NavDocuments items={navigationData.documents} />
          )}
        </div>
        <NavSecondary items={navigationData.navSecondary} className="mt-auto mb-2" />
      </SidebarContent>
      <SidebarFooter className="border-t">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
