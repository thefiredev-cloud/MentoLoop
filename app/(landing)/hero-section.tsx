"use client";

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, Sparkles, ArrowRight } from 'lucide-react'
import MentoLoopBackground from '@/components/mentoloop-background'
import { AnimatedText, GradientText, GlowingText } from '@/components/ui/animated-text'
import { motion } from 'motion/react'

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden">
                <MentoLoopBackground className="min-h-fit" showIcons={false}>
                    {/* Floating 3D Elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div
                            animate={{
                                y: [0, -20, 0],
                                rotate: [0, 10, 0],
                            }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl"
                        />
                        <motion.div
                            animate={{
                                y: [0, 20, 0],
                                rotate: [0, -10, 0],
                            }}
                            transition={{
                                duration: 10,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-3xl"
                        />
                    </div>
                    
                    <div className="py-20 md:py-32">
                        <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="glass-strong rounded-3xl p-8 md:p-12 shadow-2xl hover-lift transform-3d"
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                >
                                    <Link
                                        href="#"
                                        className="group hover:bg-white/10 mx-auto flex w-fit items-center justify-center gap-2 rounded-full px-4 py-2 transition-all duration-300 border border-white/20 backdrop-blur-md">
                                        <div className="relative flex items-center justify-center">
                                            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                                        </div>
                                        <span className="font-medium text-white">Built by NPs, for NPs</span>
                                        <ArrowRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </motion.div>
                                
                                <div className="mt-8">
                                    <AnimatedText
                                        text="Clinical Placements"
                                        className="mx-auto max-w-3xl text-balance text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white text-shadow-strong"
                                        type="word"
                                        delay={0.3}
                                    />
                                    <h1 className="mx-auto mt-2 max-w-3xl text-balance text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-shadow-strong">
                                        <GradientText gradient="from-white via-blue-200 to-white">
                                            Without the Stress
                                        </GradientText>
                                    </h1>
                                </div>
                                
                                <motion.p 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8, duration: 0.6 }}
                                    className="text-white/90 mx-auto my-6 max-w-xl text-balance text-xl md:text-2xl text-shadow-strong font-medium"
                                >
                                    <GlowingText className="text-white">
                                        Smarter matches. Supportive preceptors. Stress-free placements.
                                    </GlowingText>
                                </motion.p>
                                <p className="text-white/80 mx-auto my-4 max-w-2xl text-balance text-lg">
                                    MentoLoop was created to make the NP clinical placement process faster, fairer, and more personalized. 
                                    We connect nurse practitioner students with thoroughly vetted preceptors who align with your goals, 
                                    schedule, and learning style.
                                </p>
                                <p className="text-white/80 mx-auto my-6 mb-8 max-w-2xl text-balance text-lg">
                                    If you&apos;ve struggled to find a preceptor - or just want a better way - you&apos;re in the right place.
                                    Let us take the stress out of your search - so you can focus on becoming the NP you&apos;re meant to be.
                                </p>

                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.2, duration: 0.6 }}
                                    className="flex items-center justify-center gap-4"
                                >
                                    <Button
                                        asChild
                                        size="lg"
                                        className="group relative bg-white text-blue-700 hover:bg-white/90 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 overflow-hidden">
                                        <Link href="/sign-up/student">
                                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform text-blue-700" />
                                            <span className="relative text-nowrap font-semibold">Find My Preceptor</span>
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        size="lg"
                                        variant="outline"
                                        className="group border-white text-white bg-white/10 hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-white/50">
                                        <Link href="/sign-up/preceptor">
                                            <Shield className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-nowrap font-semibold">Become a Preceptor</span>
                                        </Link>
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </MentoLoopBackground>
        </section>
    )
}