'use client'

import { Shield, Users, FileCheck, Brain, Clock, Award, Heart, Star, Target, Zap, BookOpen, CheckCircle } from 'lucide-react'
import { BentoGridCarousel, BentoGridItem } from '@/components/ui/bento-grid'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export default function FeaturesOne() {
    // Get platform statistics from database
    const platformStats = useQuery(api.platformStats.getActiveStats, {})
    
    // Helper function to get stat value
    const getStatValue = (metric: string, fallback: string | number) => {
        const stat = platformStats?.find(s => s.metric === metric)
        return stat ? stat.value : fallback
    }
    
    // Get dynamic values or fallbacks
    const successRate = getStatValue('success_rate', 98)
    const avgPlacementTime = getStatValue('avg_placement_time', '72 hours')
    const totalMatches = getStatValue('total_matches', 'Thousands')
    const satisfactionRating = getStatValue('student_satisfaction', 4.9)
    // Row 1 - Moving Left (6 features) with enhanced colored icons
    const featuresRow1 = [
        {
            title: "Verified Preceptors",
            description: "Each preceptor is meticulously vetted with specialization in NP education.",
            icon: (
                <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg opacity-20" />
                    <Shield className="h-8 w-8 text-blue-600 relative z-10" strokeWidth={2.5} />
                </div>
            ),
            gradient: "from-blue-500/20 via-blue-400/10 to-transparent"
        },
        {
            title: "AI-Powered Matching",
            description: "Smart algorithm with human oversight for perfect matches.",
            icon: (
                <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg opacity-20" />
                    <Brain className="h-8 w-8 text-purple-600 relative z-10" strokeWidth={2.5} />
                </div>
            ),
            gradient: "from-purple-500/20 via-pink-400/10 to-transparent"
        },
        {
            title: "Fast Placements",
            description: `Average placement in ${avgPlacementTime} with our extensive network.`,
            icon: (
                <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg opacity-20" />
                    <Clock className="h-8 w-8 text-orange-600 relative z-10" strokeWidth={2.5} />
                </div>
            ),
            gradient: "from-orange-500/20 via-amber-400/10 to-transparent"
        },
        {
            title: "Excellence Guaranteed", 
            description: `${successRate}% success rate with quality assurance.`,
            icon: (
                <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg opacity-20" />
                    <Award className="h-8 w-8 text-yellow-600 relative z-10" strokeWidth={2.5} />
                </div>
            ),
            gradient: "from-yellow-500/20 via-yellow-400/10 to-transparent"
        },
        {
            title: "Mission Driven",
            description: "Committed to transforming NP education one match at a time.",
            icon: (
                <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg opacity-20" />
                    <Target className="h-8 w-8 text-red-600 relative z-10" strokeWidth={2.5} />
                </div>
            ),
            gradient: "from-red-500/20 via-rose-400/10 to-transparent"
        },
        {
            title: "Quality Focused",
            description: "Premium clinical experiences that exceed educational standards.",
            icon: (
                <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg opacity-20" />
                    <Star className="h-8 w-8 text-indigo-600 relative z-10" strokeWidth={2.5} />
                </div>
            ),
            gradient: "from-indigo-500/20 via-indigo-400/10 to-transparent"
        }
    ];

    // Row 2 - Moving Right (6 features) with enhanced colored icons
    const featuresRow2 = [
        {
            title: "Mentorship Loop",
            description: "Sustainable ecosystem where students become future preceptors.",
            icon: (
                <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg opacity-20" />
                    <Users className="h-8 w-8 text-teal-600 relative z-10" strokeWidth={2.5} />
                </div>
            ),
            gradient: "from-teal-500/20 via-cyan-400/10 to-transparent"
        },
        {
            title: "Seamless Support",
            description: "Full documentation assistance and ongoing guidance throughout.",
            icon: (
                <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg opacity-20" />
                    <FileCheck className="h-8 w-8 text-green-600 relative z-10" strokeWidth={2.5} />
                </div>
            ),
            gradient: "from-green-500/20 via-emerald-400/10 to-transparent"
        },
        {
            title: "Community First",
            description: "Building lasting relationships in healthcare education.",
            icon: (
                <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg opacity-20" />
                    <Heart className="h-8 w-8 text-pink-600 relative z-10" strokeWidth={2.5} />
                </div>
            ),
            gradient: "from-pink-500/20 via-rose-400/10 to-transparent"
        },
        {
            title: "Evidence Based",
            description: "Grounded in best practices and educational research.",
            icon: (
                <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-blue-500 rounded-lg opacity-20" />
                    <BookOpen className="h-8 w-8 text-sky-600 relative z-10" strokeWidth={2.5} />
                </div>
            ),
            gradient: "from-sky-500/20 via-blue-400/10 to-transparent"
        },
        {
            title: "Instant Access",
            description: "Connect with preceptors through our streamlined platform.",
            icon: (
                <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg opacity-20" />
                    <Zap className="h-8 w-8 text-violet-600 relative z-10" strokeWidth={2.5} />
                </div>
            ),
            gradient: "from-violet-500/20 via-purple-400/10 to-transparent"
        },
        {
            title: "Success Stories",
            description: `${typeof totalMatches === 'number' ? totalMatches.toLocaleString() : totalMatches} successful placements and growing.`,
            icon: (
                <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-lime-500 to-green-500 rounded-lg opacity-20" />
                    <CheckCircle className="h-8 w-8 text-lime-600 relative z-10" strokeWidth={2.5} />
                </div>
            ),
            gradient: "from-lime-500/20 via-green-400/10 to-transparent"
        }
    ];

    return (
        <section id="how-it-works" className="relative py-20 md:py-32 overflow-hidden">
            {/* Aurora gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
            
            <div className="relative">
                <div className="mx-auto w-full max-w-7xl px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-foreground text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                            Why MentoLoop?
                        </h2>
                        <p className="text-muted-foreground text-balance text-xl max-w-3xl mx-auto leading-relaxed">
                            We are more than just matchmakers. We are your dedicated partner in your clinical journey, 
                            offering unique support and guidance.
                        </p>
                    </div>

                    <div className="space-y-8">
                        {/* Row 1 - Moving Left */}
                        <BentoGridCarousel direction="left" className="mx-auto">
                            {featuresRow1.map((feature, i) => (
                                <BentoGridItem
                                    key={`row1-${i}`}
                                    title={feature.title}
                                    description={feature.description}
                                    icon={feature.icon}
                                    gradient={feature.gradient}
                                    carousel={true}
                                />
                            ))}
                        </BentoGridCarousel>

                        {/* Row 2 - Moving Right */}
                        <BentoGridCarousel direction="right" className="mx-auto">
                            {featuresRow2.map((feature, i) => (
                                <BentoGridItem
                                    key={`row2-${i}`}
                                    title={feature.title}
                                    description={feature.description}
                                    icon={feature.icon}
                                    gradient={feature.gradient}
                                    carousel={true}
                                />
                            ))}
                        </BentoGridCarousel>
                    </div>
                </div>
            </div>
        </section>
    )
}