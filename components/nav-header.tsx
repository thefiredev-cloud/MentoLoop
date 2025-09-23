'use client'

import Link from 'next/link'
import { Menu, X, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React, { memo, useMemo, useCallback, useState } from 'react'
import { motion, useMotionValue } from 'motion/react'
import { usePathname } from 'next/navigation'

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

import { CustomSignupModal } from '@/components/custom-signup-modal'
import { LogoIcon } from '@/components/logo'

// Move static data outside component to prevent recreation
const menuItems = [
    { name: 'Home', href: '/' },
    { name: 'For Students', href: '/students' },
    { name: 'For Preceptors', href: '/preceptors' },
    { name: 'For Institutions', href: '/institutions' },
    { name: 'Help Center', href: '/help' },
] as const;

export const NavHeader = memo(function NavHeader() {
    const [menuState, setMenuState] = useState(false)
    const [showSignupModal, setShowSignupModal] = useState(false)

    const { isSignedIn, isLoaded } = useUser()
    const pathname = usePathname()
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    // Memoize appearance config to prevent recreation
    const appearance = useMemo(() => ({
        elements: {
            footerAction: "hidden", // Hide "What is Clerk?" link
        },
        layout: {
          helpPageUrl: "/help",
          privacyPageUrl: "/privacy",
          termsPageUrl: "/terms"
        }
    }), []);
    
    // Memoize mouse move handler with useCallback
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect()
        mouseX.set(e.clientX - rect.left)
        mouseY.set(e.clientY - rect.top)
    }, [mouseX, mouseY]);

    // Memoize menu toggle handler
    const toggleMenu = useCallback(() => {
        setMenuState(prev => !prev)
    }, []);

    // Memoize modal handlers
    const openSignupModal = useCallback(() => {
        setShowSignupModal(true)
    }, []);

    const closeSignupModal = useCallback(() => {
        setShowSignupModal(false)
    }, []);

    const closeMobileMenu = useCallback(() => {
        setMenuState(false)
    }, []);

    // Don't render the header on dashboard pages (moved after hooks)
    if (pathname?.startsWith('/dashboard')) {
        return null
    }

    return (
        <>
        <motion.header 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="glass-navbar-enhanced sticky top-0 z-50 w-full border-b border-border/40"
            onMouseMove={handleMouseMove}>
            <nav className="flex h-14 items-center px-4 lg:px-6">
                <div className="flex flex-1 items-center justify-between">
                    {/* Logo */}
                    <Link
                        href="/"
                        aria-label="home"
                        className="group flex items-center gap-2 relative">
                        <LogoIcon className="h-5 w-5 text-foreground" />
                        <span className="text-lg font-semibold text-foreground">MentoLoop</span>
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
                                    className="hover:bg-foreground/10 transition-all duration-300">
                                    Sign In
                                </Button>
                            </SignInButton>
                            <Button 
                                size="sm"
                                className="relative overflow-hidden group"
                                onClick={openSignupModal}>
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
                            type="button"
                            onClick={toggleMenu}
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
                                onClick={closeMobileMenu}>
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
                onClose={closeSignupModal}
            />
        )}
        </>
    )
});
