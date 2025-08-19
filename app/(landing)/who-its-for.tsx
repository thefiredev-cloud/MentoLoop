import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GraduationCap, Stethoscope, Building2 } from 'lucide-react'
import Link from 'next/link'

export default function WhoItsFor() {
    const audiences = [
        {
            icon: GraduationCap,
            title: "NP Students",
            description: "Find clinical rotations without the stress - we handle the match, you focus on learning.",
            features: [
                "AI-powered preceptor matching",
                "Paperwork and coordination support", 
                "Flexible scheduling options",
                "Quality-vetted preceptors"
            ],
            buttonText: "Find My Preceptor",
            buttonLink: "/student-intake"
        },
        {
            icon: Stethoscope,
            title: "Preceptors",
            description: "Give back to the community, earn incentives, and shape the next generation of NPs.",
            features: [
                "Rewarding professional experience",
                "Financial compensation",
                "Carefully matched students", 
                "Administrative support"
            ],
            buttonText: "Become a Preceptor", 
            buttonLink: "/preceptor-intake"
        },
        {
            icon: Building2,
            title: "Schools & Clinics",
            description: "Streamline student placement, reporting, and support - all in one place.",
            features: [
                "Centralized placement management",
                "Automated reporting",
                "Compliance tracking",
                "Partnership opportunities"
            ],
            buttonText: "Partner With Us",
            buttonLink: "/contact"
        }
    ]

    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-7xl px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-semibold mb-4">Who It's For</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        MentoLoop serves the entire NP education ecosystem, connecting students, preceptors, 
                        and institutions to create better clinical experiences.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {audiences.map((audience, index) => {
                        const IconComponent = audience.icon
                        return (
                            <Card key={index} className="text-center h-full flex flex-col">
                                <CardHeader className="pb-4">
                                    <div className="flex justify-center mb-4">
                                        <div className="p-4 rounded-full bg-primary/10">
                                            <IconComponent className="h-8 w-8 text-primary" />
                                        </div>
                                    </div>
                                    <CardTitle className="text-2xl">{audience.title}</CardTitle>
                                    <p className="text-muted-foreground">{audience.description}</p>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-between">
                                    <ul className="space-y-2 mb-6 text-left">
                                        {audience.features.map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                                                <span className="text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button asChild className="w-full" size="lg">
                                        <Link href={audience.buttonLink}>
                                            {audience.buttonText}
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}