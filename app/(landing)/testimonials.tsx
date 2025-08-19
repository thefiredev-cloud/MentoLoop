import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'

type Testimonial = {
    name: string
    role: string
    image: string
    quote: string
}

const testimonials: Testimonial[] = [
    {
        name: 'Sarah Chen',
        role: 'FNP Student, University of California',
        image: 'https://randomuser.me/api/portraits/women/1.jpg',
        quote: 'MentoLoop found me the perfect preceptor match in just 10 days. The MentorFit algorithm really understood my learning style and paired me with someone who challenged me in all the right ways.',
    },
    {
        name: 'Dr. Maria Rodriguez',
        role: 'Family Nurse Practitioner, Primary Care',
        image: 'https://randomuser.me/api/portraits/women/6.jpg',
        quote: 'As a preceptor, MentoLoop makes it so easy to find students who are truly ready to learn. The screening process ensures I get motivated, prepared students every time.',
    },
    {
        name: 'Jessica Thompson',
        role: 'PMHNP Student, Johns Hopkins',
        image: 'https://randomuser.me/api/portraits/women/7.jpg',
        quote: 'After struggling to find a psych preceptor for months, MentoLoop matched me within 2 weeks. The paperwork support was incredible - they handled everything!',
    },
    {
        name: 'Dr. Michael Park',
        role: 'Psychiatric Nurse Practitioner',
        image: 'https://randomuser.me/api/portraits/men/4.jpg',
        quote: 'MentoLoop has completely transformed how I approach student mentorship. The platform helps me find students whose goals and style align with mine, making the teaching experience so much more rewarding.',
    },
    {
        name: 'Emily Davis',
        role: 'AGNP Student, Duke University',
        image: 'https://randomuser.me/api/portraits/women/2.jpg',
        quote: 'The stress of finding clinical placements was overwhelming until I found MentoLoop. Their team supported me through every step and I felt confident going into my rotations.',
    },
    {
        name: 'Dr. Jennifer Adams',
        role: 'Women\'s Health NP, Private Practice',
        image: 'https://randomuser.me/api/portraits/women/8.jpg',
        quote: 'MentoLoop understands the unique challenges of NP education. They connected me with passionate students and provided the support structure that made mentoring feel natural and fulfilling.',
    },
]

const chunkArray = (array: Testimonial[], chunkSize: number): Testimonial[][] => {
    const result: Testimonial[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize))
    }
    return result
}

const testimonialChunks = chunkArray(testimonials, Math.ceil(testimonials.length / 3))

export default function WallOfLoveSection() {
    return (
        <section>
            <div className="py-16 md:py-32">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="text-center">
                        <h2 className="text-foreground text-4xl font-semibold">Trusted by Students & Preceptors</h2>
                        <p className="text-muted-foreground mb-12 mt-4 text-balance text-lg">See how MentoLoop is transforming NP education, one match at a time.</p>
                    </div>
                    <div className="mt-8 grid gap-3 sm:grid-cols-2 md:mt-12 lg:grid-cols-3">
                        {testimonialChunks.map((chunk, chunkIndex) => (
                            <div
                                key={chunkIndex}
                                className="space-y-3">
                                {chunk.map(({ name, role, quote, image }, index) => (
                                    <Card key={index}>
                                        <CardContent className="grid grid-cols-[auto_1fr] gap-3 pt-6">
                                            <Avatar className="size-9">
                                                <AvatarImage
                                                    alt={name}
                                                    src={image}
                                                    loading="lazy"
                                                    width="120"
                                                    height="120"
                                                />
                                                <AvatarFallback>ST</AvatarFallback>
                                            </Avatar>

                                            <div>
                                                <h3 className="font-medium">{name}</h3>

                                                <span className="text-muted-foreground block text-sm tracking-wide">{role}</span>

                                                <blockquote className="mt-3">
                                                    <p className="text-gray-700 dark:text-gray-300">{quote}</p>
                                                </blockquote>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
