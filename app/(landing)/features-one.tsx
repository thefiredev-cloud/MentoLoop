'use client'

import {
  Shield,
  Users,
  FileCheck,
  Brain,
  Clock,
  Award,
  Heart,
  Star,
  Target,
  Zap,
  BookOpen,
  CheckCircle,
} from 'lucide-react'
import { BentoGridCarousel, BentoGridItem, type BentoGridTheme } from '@/components/ui/bento-grid'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { Doc } from '@/convex/_generated/dataModel'

type PlatformStat = Doc<'platformStats'>

export default function FeaturesOne() {
    // Get platform statistics from database
    const platformStats = useQuery(api.platformStats.getActiveStats, {}) as PlatformStat[] | undefined
    
    // Helper function to get stat value
    const getStatValue = (metric: string, fallback: string | number) => {
        const stat = platformStats?.find((statItem: PlatformStat) => statItem.metric === metric)
        return stat ? stat.value : fallback
    }
    
    // Get dynamic values or fallbacks
    const successRate = getStatValue('success_rate', 98)
    const avgPlacementTime = getStatValue('avg_placement_time', '72 hours')
    const totalMatches = getStatValue('total_matches', 'Thousands')
    // Row 1 - Moving Left (6 features) with enhanced colored icons
    const featuresRow1: Array<{
        title: string
        description: string
        icon: React.ReactNode
        theme: BentoGridTheme
    }> = [
        {
            title: "Verified Preceptors",
            description: "Each preceptor is meticulously vetted with specialization in NP education.",
            icon: (
                <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/30 to-secondary/40" />
                    <Shield className="h-8 w-8 text-primary relative z-10" strokeWidth={2.5} />
                </div>
            ),
            theme: 'primary'
        },
        {
            title: "AI-Powered Matching",
            description: "Smart algorithm with human oversight for perfect matches.",
            icon: (
                <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-accent/30 via-primary/20 to-secondary/30" />
                    <Brain className="h-8 w-8 text-accent relative z-10" strokeWidth={2.5} />
                </div>
            ),
            theme: 'accent'
        },
        {
            title: "Fast Placements",
            description: `Average placement in ${avgPlacementTime} with our extensive network.`,
            icon: (
                <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-warning/30 to-warning/15" />
                    <Clock className="h-8 w-8 text-warning relative z-10" strokeWidth={2.5} />
                </div>
            ),
            theme: 'warning'
        },
        {
            title: "Excellence Guaranteed", 
            description: `${successRate}% success rate with quality assurance.`,
            icon: (
                <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-warning/25 to-accent/20" />
                    <Award className="h-8 w-8 text-warning relative z-10" strokeWidth={2.5} />
                </div>
            ),
            theme: 'success'
        },
        {
            title: "Mission Driven",
            description: "Committed to transforming NP education one match at a time.",
            icon: (
                <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-destructive/25 to-destructive/15" />
                    <Target className="h-8 w-8 text-destructive relative z-10" strokeWidth={2.5} />
                </div>
            ),
            theme: 'destructive'
        },
        {
            title: "Quality Focused",
            description: "Premium clinical experiences that exceed educational standards.",
            icon: (
                <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 to-primary/40" />
                    <Star className="h-8 w-8 text-primary relative z-10" strokeWidth={2.5} />
                </div>
            ),
            theme: 'secondary'
        }
    ];

    // Row 2 - Moving Right (6 features) with enhanced colored icons
    const featuresRow2: Array<{
        title: string
        description: string
        icon: React.ReactNode
        theme: BentoGridTheme
    }> = [
        {
            title: "Mentorship Loop",
            description: "Sustainable ecosystem where students become future preceptors.",
            icon: (
                <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-accent/30 to-accent/15" />
                    <Users className="h-8 w-8 text-accent relative z-10" strokeWidth={2.5} />
                </div>
            ),
            theme: 'accent'
        },
        {
            title: "Seamless Support",
            description: "Full documentation assistance and ongoing guidance throughout.",
            icon: (
                <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-success/25 to-success/15" />
                    <FileCheck className="h-8 w-8 text-success relative z-10" strokeWidth={2.5} />
                </div>
            ),
            theme: 'success'
        },
        {
            title: "Community First",
            description: "Building lasting relationships in healthcare education.",
            icon: (
                <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-secondary/30 via-primary/15 to-accent/20" />
                    <Heart className="h-8 w-8 text-secondary relative z-10" strokeWidth={2.5} />
                </div>
            ),
            theme: 'secondary'
        },
        {
            title: "Evidence Based",
            description: "Grounded in best practices and educational research.",
            icon: (
                <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/25 via-primary/10 to-accent/10" />
                    <BookOpen className="h-8 w-8 text-info relative z-10" strokeWidth={2.5} />
                </div>
            ),
            theme: 'info'
        },
        {
            title: "Instant Access",
            description: "Connect with preceptors through our streamlined platform.",
            icon: (
                <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-secondary/30 via-primary/30 to-accent/20" />
                    <Zap className="h-8 w-8 text-secondary relative z-10" strokeWidth={2.5} />
                </div>
            ),
            theme: 'secondary'
        },
        {
            title: "Success Stories",
            description: `${typeof totalMatches === 'number' ? totalMatches.toLocaleString() : totalMatches} successful placements and growing.`,
            icon: (
                <div className="relative flex items-center justify-center w-12 h-12">
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-success/20 to-success/10" />
                    <CheckCircle className="h-8 w-8 text-success relative z-10" strokeWidth={2.5} />
                </div>
            ),
            theme: 'success'
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
                                    theme={feature.theme}
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
                                    theme={feature.theme}
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
