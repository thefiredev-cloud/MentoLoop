"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FAQs() {
    return (
        <section className="py-20 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-y-12 px-2 lg:[grid-template-columns:1fr_auto]">
                    <div className="text-center lg:text-left">
                        <h2 className="mb-4 text-3xl font-semibold md:text-4xl">
                            Frequently <br className="hidden lg:block" /> Asked <br className="hidden lg:block" />
                            Questions
                        </h2>
                        <p>Everything you need to know about MentoLoop</p>
                    </div>

                    <Tabs defaultValue="students" className="w-full sm:mx-auto sm:max-w-lg lg:mx-0">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="students">Students</TabsTrigger>
                            <TabsTrigger value="preceptors">Preceptors</TabsTrigger>
                            <TabsTrigger value="process">Process</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="students" className="mt-6 space-y-6">
                            <div className="divide-y divide-dashed">
                                <div className="pb-6">
                                    <h3 className="font-medium">How do I create a student profile?</h3>
                                    <p className="text-muted-foreground mt-4">Creating your student profile takes just a few minutes. You&apos;ll complete a simple intake form that captures:</p>
                                    <ul className="list-outside list-disc space-y-2 pl-4 mt-2">
                                        <li className="text-muted-foreground">Your NP program & graduation date</li>
                                        <li className="text-muted-foreground">Clinical rotation needs (specialty, timeline, location)</li>
                                        <li className="text-muted-foreground">Learning style & communication preferences</li>
                                        <li className="text-muted-foreground">Any flagged school requirements (forms, evaluations, etc.)</li>
                                    </ul>
                                    <p className="text-muted-foreground mt-2">Once submitted, you&apos;ll receive a confirmation email and be entered into our matching system. You can update your preferences anytime.</p>
                                </div>
                                
                                <div className="py-6">
                                    <h3 className="font-medium">How does the matching process work?</h3>
                                    <p className="text-muted-foreground mt-4">We combine automation with human oversight to ensure the best fit:</p>
                                    <ol className="list-outside list-decimal space-y-2 pl-4 mt-2">
                                        <li className="text-muted-foreground">Your profile enters our matching engine</li>
                                        <li className="text-muted-foreground">Top matches are scored and reviewed</li>
                                        <li className="text-muted-foreground">Our team confirms availability and alignment</li>
                                        <li className="text-muted-foreground">You receive your best match and next-best options</li>
                                        <li className="text-muted-foreground">Once confirmed, we initiate onboarding and paperwork</li>
                                    </ol>
                                    <p className="text-muted-foreground mt-2">You&apos;ll receive updates every step of the way.</p>
                                </div>

                                <div className="pt-6">
                                    <h3 className="font-medium">How does your pricing work?</h3>
                                    <p className="text-muted-foreground mt-4">MentoLoop offers simple, transparent pricing:</p>
                                    <ul className="list-outside list-disc space-y-2 pl-4 mt-2">
                                        <li className="text-muted-foreground">Student Match Fee - Covers access to our network, matching, and paperwork support</li>
                                        <li className="text-muted-foreground">Preceptor Compensation - Varies by specialty, hours, and region</li>
                                        <li className="text-muted-foreground">Flexible Payment - Fees are due only when a match is confirmed. No charge for unmatched searches</li>
                                    </ul>
                                </div>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="preceptors" className="mt-6 space-y-6">
                            <div className="divide-y divide-dashed">
                                <div className="pb-6">
                                    <h3 className="font-medium">How do I create a preceptor profile?</h3>
                                    <p className="text-muted-foreground mt-4">Preceptors can join MentoLoop by filling out a quick onboarding form that includes:</p>
                                    <ul className="list-outside list-disc space-y-2 pl-4 mt-2">
                                        <li className="text-muted-foreground">Specialty & licensure information</li>
                                        <li className="text-muted-foreground">Practice setting and accepted rotation types</li>
                                        <li className="text-muted-foreground">Availability windows and student capacity</li>
                                        <li className="text-muted-foreground">Mentoring style and supervision approach</li>
                                    </ul>
                                    <p className="text-muted-foreground mt-2">Our team will verify your credentials and contact you for any follow-up before activating your profile.</p>
                                </div>
                                
                                <div className="pt-6">
                                    <h3 className="font-medium">What are the benefits of becoming a preceptor?</h3>
                                    <p className="text-muted-foreground mt-4">MentoLoop preceptors enjoy:</p>
                                    <ul className="list-outside list-disc space-y-2 pl-4 mt-2">
                                        <li className="text-muted-foreground">Fair compensation for your time and expertise</li>
                                        <li className="text-muted-foreground">Flexible scheduling that works with your practice</li>
                                        <li className="text-muted-foreground">Pre-screened, motivated students</li>
                                        <li className="text-muted-foreground">Full administrative support for paperwork</li>
                                        <li className="text-muted-foreground">Opportunity to shape the next generation of NPs</li>
                                    </ul>
                                </div>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="process" className="mt-6 space-y-6">
                            <div className="divide-y divide-dashed">
                                <div className="pb-6">
                                    <h3 className="font-medium">How does our verification process work?</h3>
                                    <p className="text-muted-foreground mt-4">Every preceptor goes through a five-step review:</p>
                                    <ul className="list-outside list-disc space-y-2 pl-4 mt-2">
                                        <li className="text-muted-foreground">License and certification check</li>
                                        <li className="text-muted-foreground">Specialty and experience verification</li>
                                        <li className="text-muted-foreground">Background check (if required by school)</li>
                                        <li className="text-muted-foreground">Mentoring readiness & fit questionnaire</li>
                                        <li className="text-muted-foreground">Reference or feedback review (when available)</li>
                                    </ul>
                                    <p className="text-muted-foreground mt-2">Only verified, qualified preceptors are added to our match network.</p>
                                </div>

                                <div className="pt-6">
                                    <h3 className="font-medium">How does the matching algorithm work?</h3>
                                    <p className="text-muted-foreground mt-4">It uses a proprietary scoring system to evaluate compatibility between students and preceptors. It considers several professional and personal factors to help ensure each match is built for success.</p>
                                    <p className="text-muted-foreground mt-2">While the exact formula is confidential, it&apos;s designed to go beyond logistics - helping foster strong mentorship relationships.</p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </section>
    )
}
