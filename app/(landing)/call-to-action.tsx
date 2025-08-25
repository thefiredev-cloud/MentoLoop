import { Button } from '@/components/ui/button'
import Link from 'next/link'
import MentoLoopBackground from '@/components/mentoloop-background'

export default function CallToAction() {
    return (
        <section className="py-20 md:py-32 px-6">
            <div className="mx-auto max-w-5xl">
                <MentoLoopBackground className="rounded-3xl px-6 py-12 md:py-20 lg:py-32" showIcons={false}>
                    <div className="text-center">
                        <h2 className="text-balance text-4xl font-semibold lg:text-5xl text-white text-shadow-strong">Ready to Transform Your Clinical Experience?</h2>
                        <p className="mt-4 text-white/90 text-lg">Join thousands of NP students who&apos;ve found their perfect preceptor match through MentoLoop.</p>

                        <div className="mt-12 flex flex-wrap justify-center gap-4">
                            <Button
                                asChild
                                size="lg"
                                className="bg-white text-mentoloop-blue hover:bg-white/90 shadow-lg">
                                <Link href="/student-intake">
                                    <span>Find My Preceptor</span>
                                </Link>
                            </Button>

                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="border-white text-white bg-white/10 hover:bg-white/20 hover:text-white backdrop-blur-sm">
                                <Link href="/preceptor-intake">
                                    <span>Become a Preceptor</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                </MentoLoopBackground>
            </div>
        </section>
    )
}