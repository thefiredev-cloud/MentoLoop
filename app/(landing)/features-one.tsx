import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Users, Zap, FileCheck } from 'lucide-react'

export default function FeaturesOne() {
    return (
        <section id="how-it-works" className="py-16 md:py-32 bg-muted/30">
            <div className="py-24">
                <div className="mx-auto w-full max-w-6xl px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-foreground text-4xl font-semibold mb-4">Why MentoLoop?</h2>
                        <p className="text-muted-foreground text-balance text-lg max-w-3xl mx-auto">
                            We are more than just matchmakers. We are your dedicated partner in your clinical journey, 
                            offering unique support and guidance.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="p-6 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 rounded-full bg-primary/10">
                                    <Shield className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                            <h3 className="text-foreground text-lg font-semibold mb-2">Verified Preceptors</h3>
                            <p className="text-muted-foreground text-sm">
                                Each preceptor in our network is meticulously vetted and holds a specialization in nurse practitioner education. 
                                This ensures you receive the highest quality guidance.
                            </p>
                        </Card>

                        <Card className="p-6 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 rounded-full bg-primary/10">
                                    <Zap className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                            <h3 className="text-foreground text-lg font-semibold mb-2">AI-Powered Matching</h3>
                            <p className="text-muted-foreground text-sm">
                                Our unique algorithm finds your perfect match, with human oversight, ensuring connections are 
                                based on both data and personal compatibility.
                            </p>
                        </Card>

                        <Card className="p-6 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 rounded-full bg-primary/10">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                            <h3 className="text-foreground text-lg font-semibold mb-2">Mentorship Loop</h3>
                            <p className="text-muted-foreground text-sm">
                                We create a sustainable ecosystem where current students become future preceptors, 
                                ensuring a continuous cycle of support and learning.
                            </p>
                        </Card>

                        <Card className="p-6 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 rounded-full bg-primary/10">
                                    <FileCheck className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                            <h3 className="text-foreground text-lg font-semibold mb-2">Seamless Paperwork</h3>
                            <p className="text-muted-foreground text-sm">
                                Full-service support including documentation assistance, scheduling coordination, 
                                and ongoing guidance to relieve administrative burdens.
                            </p>
                        </Card>
                    </div>

                    <div className="mt-20 text-center">
                        <div className="flex flex-wrap justify-center gap-4 mb-8">
                            <Badge variant="secondary" className="px-4 py-2">
                                HIPAA-Compliant
                            </Badge>
                            <Badge variant="secondary" className="px-4 py-2">
                                FERPA-Aware
                            </Badge>
                            <Badge variant="secondary" className="px-4 py-2">
                                Built by NPs
                            </Badge>
                            <Badge variant="secondary" className="px-4 py-2">
                                Designed by NPs
                            </Badge>
                        </div>
                        
                        <blockquote className="before:bg-primary relative mt-12 max-w-2xl mx-auto pl-6 before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-full">
                            <p className="text-foreground text-lg italic">
                                "This isn't about filling spots. It's about fixing the pipeline. MentoLoop exists to transform NP education - 
                                one match, one mentor, one future provider at a time."
                            </p>
                        </blockquote>
                    </div>
                </div>
            </div>
        </section>
    )
}
