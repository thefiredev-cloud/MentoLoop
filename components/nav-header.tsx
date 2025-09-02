'use client'

import Link from 'next/link'
import { Menu, X, Home, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React from 'react'
import { motion, useMotionValue } from 'framer-motion'
import { usePathname } from 'next/navigation'

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { ThemeToggle } from '@/components/theme-toggle'
import { CustomSignupModal } from '@/components/custom-signup-modal'

import { dark } from '@clerk/themes'
import { useTheme } from "next-themes"

const menuItems = [
    { name: 'Home', href: '/' },
    { name: 'For Students', href: '/student-intake' },
    { name: 'For Preceptors', href: '/preceptor-intake' },
    { name: 'For Institutions', href: '/institutions' },
    { name: 'Help Center', href: '/help' },
]

export const NavHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [showSignupModal, setShowSignupModal] = React.useState(false)
    const { theme } = useTheme()
    const { isSignedIn, isLoaded } = useUser()
    const pathname = usePathname()

    // Don't render the header on dashboard pages
    if (pathname?.startsWith('/dashboard')) {
        return null
    }

    const appearance = {
        baseTheme: theme === "dark" ? dark : undefined,
        elements: {
            footerAction: "hidden", // Hide "What is Clerk?" link
        },
        layout: {
          helpPageUrl: "/help",
          privacyPageUrl: "/privacy",
          termsPageUrl: "/terms"
        }
    }

    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    
    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect()
        mouseX.set(e.clientX - rect.left)
        mouseY.set(e.clientY - rect.top)
    }

    return (
        <>
        <motion.header 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="glass-navbar-enhanced sticky top-0 z-50 w-full border-b border-white/10"
            onMouseMove={handleMouseMove}>
            <nav className="flex h-14 items-center px-4 lg:px-6">
                <div className="flex flex-1 items-center justify-between">
                    {/* Logo with Glow Effect */}
                    <Link
                        href="/"
                        aria-label="home"
                        className="group flex items-center space-x-2 relative">
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:from-secondary group-hover:to-accent transition-all duration-500">
                            MentoLoop
                        </span>
                        <Sparkles className="w-3 h-3 text-yellow-400 absolute -top-1 -right-2 animate-pulse" />
                    </Link>

                    {/* Desktop Navigation with Magnetic Effect */}
                    <div className="hidden md:flex md:items-center md:space-x-6">
                        {menuItems.map((item, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link
                                    href={item.href}
                                    className="relative text-sm font-medium transition-all duration-300 hover:text-primary group">
                                    <span className="relative z-10">{item.name}</span>
                                    <motion.span
                                        className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"
                                        layoutId="navHighlight"
                                    />
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary group-hover:w-full transition-all duration-300" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Auth Section */}
                    <div className="flex items-center space-x-2">
                        <ThemeToggle />
                        
                        <AuthLoading>
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </AuthLoading>
                        
                        <Authenticated>
                            <Button asChild size="sm" variant="ghost">
                                <Link href="/dashboard">
                                    <Home className="h-4 w-4 mr-2" />
                                    Dashboard
                                </Link>
                            </Button>
                            <UserButton 
                                appearance={appearance}
                                afterSignOutUrl="/"
                            />
                        </Authenticated>

                        <Unauthenticated>
                            <SignInButton mode="modal">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-white/10 transition-all duration-300">
                                    Sign In
                                </Button>
                            </SignInButton>
                            <Button 
                                size="sm"
                                className="relative overflow-hidden group"
                                onClick={() => setShowSignupModal(true)}>
                                <span className="relative z-10">Get Started</span>
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary"
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                    style={{ backgroundSize: "200% 100%" }}
                                />
                            </Button>
                        </Unauthenticated>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMenuState(!menuState)}
                            aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                            className="md:hidden">
                            {menuState ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation */}
            {menuState && (
                <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="px-4 py-4 space-y-3">
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className="block text-sm font-medium transition-colors hover:text-primary"
                                onClick={() => setMenuState(false)}>
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </motion.header>

        {/* Custom Signup Modal */}
        {isLoaded && !isSignedIn && (
            <CustomSignupModal 
                isOpen={showSignupModal}
                onClose={() => setShowSignupModal(false)}
            />
        )}
        </>
    )
}