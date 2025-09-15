'use client'

import Link from 'next/link'
import { Home, BookOpen, HelpCircle, Bell, Settings, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React from 'react'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

import { UserButton } from "@clerk/nextjs"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"



const quickLinks = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Resources', href: '/resources', icon: BookOpen },
  { name: 'Support', href: '/support', icon: HelpCircle },
  { name: 'Notifications', href: '/notifications', icon: Bell },
]

export const DashboardNavbar = () => {

  const pathname = usePathname()

  const appearance = {
    elements: {
      footerAction: "hidden",
    },
    layout: {
      helpPageUrl: "/help",
      privacyPageUrl: "/privacy",
      termsPageUrl: "/terms"
    }
  }

  // Check if user is admin for settings button only
  const isAdmin = pathname?.includes('/admin')

  return (
    <header 
      className="fixed top-0 z-[60] w-full h-14 bg-white border-b border-gray-200">
      <nav className="flex h-full items-center px-4 lg:px-6">
        <div className="flex flex-1 items-center justify-between">
          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {/* Brand Logo */}
            <Link href="/" className="mr-2">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                MentoLoop
              </span>
            </Link>
            
            {/* Quick Navigation for All Users */}
                <div className="hidden md:flex items-center space-x-1">
                  {quickLinks.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                        "hover:bg-white/10 hover:text-primary",
                        pathname === item.href && "bg-white/10 text-primary"
                      )}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>

            {/* Mobile Quick Links Dropdown */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hover:bg-white/10">
                    Quick Links
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {quickLinks.map((item, index) => (
                    <DropdownMenuItem key={index} asChild>
                      <Link href={item.href} className="flex items-center space-x-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Dashboard Type Badge */}
            <div className="hidden sm:block">
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                "bg-gradient-to-r from-primary/20 to-secondary/20",
                "border border-primary/30"
              )}>
                {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
              </span>
            </div>

            {/* Settings Button */}
            {isAdmin && (
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-white/10"
                asChild>
                <Link href="/dashboard/admin">
                  <Settings className="h-5 w-5" />
                </Link>
              </Button>
            )}

            {/* User Menu */}
            <UserButton 
              appearance={appearance}
              afterSignOutUrl="/"
              showName={false}
            />
          </div>
        </div>
      </nav>
    </header>
  )
}
