import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HeroHeader } from "./header"
import { Sparkle } from 'lucide-react'
import MentoLoopBackground from '@/components/mentoloop-background'

export default function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main>
                <MentoLoopBackground className="min-h-screen">
                    <div className="py-20 md:py-36">
                        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
                            <div>
                                <Link
                                    href="#"
                                    className="hover:bg-foreground/10 mx-auto flex w-fit items-center justify-center gap-2 rounded-md py-0.5 pl-1 pr-3 transition-colors duration-150">
                                    <div
                                        aria-hidden
                                        className="border-foreground/20 bg-gradient-to-b from-foreground/20 to-foreground/10 relative flex size-5 items-center justify-center rounded border shadow-md ring-1 ring-foreground/10">
                                        <div className="absolute inset-x-0 inset-y-1.5 border-y border-dotted border-foreground/25"></div>
                                        <div className="absolute inset-x-1.5 inset-y-0 border-x border-dotted border-foreground/25"></div>
                                        <Sparkle className="size-3 fill-foreground stroke-foreground drop-shadow" />
                                    </div>
                                    <span className="font-medium text-foreground">Built by NPs, for NPs</span>
                                </Link>
                                <h1 className="mx-auto mt-8 max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl text-foreground text-shadow-strong">Clinical Placements Without the Stress</h1>
                                <p className="text-foreground/90 mx-auto my-6 max-w-xl text-balance text-xl text-shadow-strong">Smarter matches. Supportive preceptors. Stress-free placements.</p>
                                <p className="text-foreground/80 mx-auto my-4 max-w-2xl text-balance">
                                    MentoLoop was created to make the NP clinical placement process faster, fairer, and more personalized. 
                                    We connect nurse practitioner students with thoroughly vetted preceptors who align with your goals, 
                                    schedule, and learning style.
                                </p>
                                <p className="text-foreground/80 mx-auto my-4 max-w-2xl text-balance">
                                    If you&apos;ve struggled to find a preceptor - or just want a better way - you&apos;re in the right place.
                                    Let us take the stress out of your search - so you can focus on becoming the NP you&apos;re meant to be.
                                </p>

                                <div className="flex items-center justify-center gap-3">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="bg-background text-primary hover:bg-background/90 shadow-lg">
                                        <Link href="/student-intake">
                                            <span className="text-nowrap">Find My Preceptor</span>
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        size="lg"
                                        variant="outline"
                                        className="border-foreground/30 text-foreground hover:bg-foreground/10 hover:text-foreground">
                                        <Link href="/preceptor-intake">
                                            <span className="text-nowrap">Become a Preceptor</span>
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </MentoLoopBackground>
            </main>
        </>
    )
}