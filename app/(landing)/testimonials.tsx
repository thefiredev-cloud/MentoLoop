"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

type Testimonial = {
    name: string
    role: string
    image: string
    quote: string
    rating?: number
}

// Avatar mapping for testimonials (using consistent random user images)
const avatarMap: Record<string, string> = {
    'Sarah Chen': 'https://randomuser.me/api/portraits/women/1.jpg',
    'Dr. Maria Rodriguez': 'https://randomuser.me/api/portraits/women/6.jpg', 
    'Jessica Thompson': 'https://randomuser.me/api/portraits/women/7.jpg',
    'Dr. Michael Park': 'https://randomuser.me/api/portraits/men/4.jpg',
    'Emily Davis': 'https://randomuser.me/api/portraits/women/2.jpg',
    'Dr. Jennifer Adams': 'https://randomuser.me/api/portraits/women/8.jpg',
}

function TestimonialCard({ testimonial, index }: { testimonial: Testimonial; index: number }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.3 })
    
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50, rotateX: -15 }}
            animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
            transition={{ delay: index * 0.1, duration: 0.8, type: "spring" }}
            whileHover={{ scale: 1.05, rotateY: 5, z: 50 }}
            className="transform-3d"
        >
            <Card className="relative overflow-hidden h-full glass backdrop-blur-md border-white/10 hover:border-white/20 transition-all duration-300 group">
                <div className="absolute top-0 right-0 p-4">
                    <Quote className="w-8 h-8 text-primary/20 group-hover:text-primary/30 transition-colors" />
                </div>
                
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-start space-x-4">
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Avatar className="size-12 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                                <AvatarImage
                                    alt={testimonial.name}
                                    src={testimonial.image}
                                    loading="lazy"
                                />
                                <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                        </motion.div>
                        
                        <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{testimonial.name}</h3>
                            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                            {testimonial.rating && (
                                <div className="flex mt-1">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <blockquote className="relative">
                        <p className="text-sm leading-relaxed text-foreground/90 italic">
                            &ldquo;{testimonial.quote}&rdquo;
                        </p>
                    </blockquote>
                </CardContent>
                
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </Card>
        </motion.div>
    )
}

export default function WallOfLoveSection() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const containerRef = useRef(null)
    const isInView = useInView(containerRef, { once: true })
    
    // Get featured testimonials from Convex
    const testimonialsFromDB = useQuery(api.testimonials.getPublicTestimonials, {
        featured: true,
        limit: 6
    })
    
    // Transform database testimonials to match expected format
    const testimonials: Testimonial[] = testimonialsFromDB?.map(t => ({
        name: t.name,
        role: t.title,
        image: avatarMap[t.name] || `https://randomuser.me/api/portraits/${t.userType === 'preceptor' ? 'men' : 'women'}/${Math.floor(Math.random() * 10)}.jpg`,
        quote: t.content,
        rating: t.rating
    })) || []
    
    const nextTestimonial = () => {
        if (testimonials.length === 0) return
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }
    
    const prevTestimonial = () => {
        if (testimonials.length === 0) return
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    }
    
    useEffect(() => {
        if (testimonials.length === 0) return
        const interval = setInterval(nextTestimonial, 5000)
        return () => clearInterval(interval)
    }, [testimonials.length])
    
    // Don't render if no testimonials are loaded yet
    if (!testimonialsFromDB || testimonials.length === 0) {
        return (
            <section className="relative py-16 md:py-32 overflow-hidden">
                <div className="relative mx-auto max-w-7xl px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                            Trusted by Students & Preceptors
                        </h2>
                        <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
                            Loading testimonials...
                        </p>
                    </div>
                </div>
            </section>
        )
    }
    
    return (
        <section className="relative py-16 md:py-32 overflow-hidden" ref={containerRef}>
            {/* Aurora Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
            
            <div className="relative mx-auto max-w-7xl px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                        Trusted by Students & Preceptors
                    </h2>
                    <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
                        See how MentoLoop is transforming NP education, one match at a time.
                    </p>
                </motion.div>
                
                {/* Desktop Grid View */}
                <div className="hidden lg:grid grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard key={index} testimonial={testimonial} index={index} />
                    ))}
                </div>
                
                {/* Mobile Carousel View */}
                <div className="lg:hidden relative">
                    <div className="overflow-hidden">
                        <motion.div
                            className="flex"
                            animate={{ x: `-${currentIndex * 100}%` }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            {testimonials.map((testimonial, index) => (
                                <div key={index} className="w-full flex-shrink-0 px-2">
                                    <TestimonialCard testimonial={testimonial} index={0} />
                                </div>
                            ))}
                        </motion.div>
                    </div>
                    
                    <div className="flex justify-center items-center mt-6 space-x-4">
                        <Button
                            onClick={prevTestimonial}
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-primary/10"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        
                        <div className="flex space-x-2">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all duration-300",
                                        currentIndex === index 
                                            ? "w-8 bg-primary" 
                                            : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                                    )}
                                />
                            ))}
                        </div>
                        
                        <Button
                            onClick={nextTestimonial}
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-primary/10"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
