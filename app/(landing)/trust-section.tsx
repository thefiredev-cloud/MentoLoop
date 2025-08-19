import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, Shield, Users2 } from 'lucide-react'

export default function TrustSection() {
    return (
        <section className="py-16 md:py-32 bg-background">
            <div className="mx-auto w-full max-w-6xl px-6">
                <div className="text-center mb-16">
                    <h2 className="text-foreground text-4xl font-semibold mb-4">Built for Trust. Designed by NPs</h2>
                    <p className="text-muted-foreground text-balance text-lg max-w-3xl mx-auto">
                        We prioritize student safety and data privacy with every interaction.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    <Card className="p-8 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 rounded-full bg-primary/10">
                                <GraduationCap className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <h3 className="text-foreground text-xl font-semibold mb-3">Created by NPs Who've Been There</h3>
                        <p className="text-muted-foreground">
                            MentoLoop was built by nurse practitioners who have firsthand experience with clinical placement.
                        </p>
                    </Card>

                    <Card className="p-8 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 rounded-full bg-primary/10">
                                <Shield className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <h3 className="text-foreground text-xl font-semibold mb-3">HIPAA-Compliant & FERPA-Aware</h3>
                        <p className="text-muted-foreground">
                            We prioritize student safety and data privacy with every interaction.
                        </p>
                    </Card>

                    <Card className="p-8 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 rounded-full bg-primary/10">
                                <Users2 className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <h3 className="text-foreground text-xl font-semibold mb-3">Collaborating with NP Programs</h3>
                        <p className="text-muted-foreground">
                            Our team works closely with schools and faculty to ensure smooth, compliant clinical placements.
                        </p>
                    </Card>
                </div>
            </div>
        </section>
    )
}