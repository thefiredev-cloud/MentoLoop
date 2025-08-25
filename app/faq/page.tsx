'use client'

import { useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface FAQItem {
  question: string
  answer: string
  category: string
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const faqs: FAQItem[] = [
    // General Questions
    {
      category: 'General',
      question: 'What is MentoLoop?',
      answer: 'MentoLoop is a comprehensive platform that connects nurse practitioner students with verified clinical preceptors. We use advanced matching technology to ensure compatible placements based on learning styles, clinical needs, and scheduling preferences.'
    },
    {
      category: 'General',
      question: 'How does MentoLoop differ from other placement services?',
      answer: 'MentoLoop offers proprietary compatibility matching, guaranteed placements, comprehensive support throughout your rotation, and a vetted network of quality preceptors. Our average placement time is 7-10 days compared to the industry standard of 3-6 months.'
    },
    {
      category: 'General',
      question: 'Is MentoLoop available in my state?',
      answer: 'MentoLoop operates nationwide across all 50 states. Our network includes preceptors in urban, suburban, and rural settings. We can help you find placements both locally and in other states if you are willing to travel.'
    },
    
    // Pricing Questions
    {
      category: 'Pricing',
      question: 'How much does MentoLoop cost?',
      answer: 'MentoLoop offers several pricing tiers to meet different needs. Our Basic plan provides essential matching services, while our Premium plans include advanced compatibility matching, priority placement, and dedicated support. Institution pricing is available for schools. Contact us for detailed pricing information.'
    },
    {
      category: 'Pricing',
      question: 'What is included in the placement fee?',
      answer: 'The placement fee includes: preceptor matching services, verification and credentialing checks, paperwork coordination, ongoing support throughout your rotation, and a stipend that goes directly to your preceptor as a thank you for their mentorship.'
    },
    {
      category: 'Pricing',
      question: 'Do you offer refunds?',
      answer: 'We offer a full refund if we cannot match you with a preceptor within our guaranteed timeframe. Once a match is confirmed and accepted, fees are non-refundable as they cover the preceptor stipend and our coordination services.'
    },
    {
      category: 'Pricing',
      question: 'Are there payment plans available?',
      answer: 'Yes, we offer flexible payment plans for students. You can choose to pay in full or in installments. Institution partners have additional billing options including semester-based and annual contracts.'
    },
    
    // Student Questions
    {
      category: 'Students',
      question: 'How long does it take to get matched?',
      answer: 'Our average matching time is 7-10 days from completing your intake form. Premium members receive priority matching within 3-5 days. This is significantly faster than the industry average of 3-6 months.'
    },
    {
      category: 'Students',
      question: 'What if I don\'t like my matched preceptor?',
      answer: 'We work hard to ensure compatibility through our matching process. If issues arise, our support team will work with you to address concerns. In rare cases where a rematch is necessary, we will help facilitate a new placement at no additional cost.'
    },
    {
      category: 'Students',
      question: 'Can I choose my own preceptor?',
      answer: 'Yes! You can browse our network of verified preceptors and request specific matches. You can also refer a preceptor you know to join our network. All preceptors go through our verification process to ensure quality and safety.'
    },
    {
      category: 'Students',
      question: 'What documentation do I need?',
      answer: 'You\'ll need: proof of enrollment in an accredited NP program, current immunization records, professional liability insurance, and any school-specific requirements. We help coordinate all paperwork between you, your school, and your preceptor.'
    },
    
    // Preceptor Questions
    {
      category: 'Preceptors',
      question: 'How do I become a preceptor?',
      answer: 'Complete our preceptor intake form with your credentials, practice information, and availability. We verify your license, NPI, and credentials. Once approved, you\'ll receive match requests based on your preferences and availability.'
    },
    {
      category: 'Preceptors',
      question: 'What compensation do preceptors receive?',
      answer: 'Preceptors receive a stipend for each student rotation as a thank you for their mentorship. The amount varies based on rotation length and type. This is in addition to any compensation arrangements with the student\'s school.'
    },
    {
      category: 'Preceptors',
      question: 'What support does MentoLoop provide to preceptors?',
      answer: 'We handle all administrative coordination, paperwork processing, and student-school communication. You also receive access to our preceptor resources, continuing education opportunities, and dedicated support team.'
    },
    {
      category: 'Preceptors',
      question: 'Can I choose which students to accept?',
      answer: 'Absolutely. You have full control over which students you accept. We send you matched student profiles based on your preferences, and you decide whether to accept, decline, or request more information.'
    },
    
    // Institution Questions
    {
      category: 'Institutions',
      question: 'How does institutional partnership work?',
      answer: 'Institutional partners receive bulk enrollment for their cohorts, a dedicated account manager, custom portal access, real-time analytics, priority placement for all students, and volume-based pricing. Contact us to discuss your program\'s specific needs.'
    },
    {
      category: 'Institutions',
      question: 'Can MentoLoop handle our entire cohort?',
      answer: 'Yes, we specialize in managing placements for entire cohorts, from small programs with 20 students to large universities with 200+ students per semester. Our institutional tools make bulk management efficient and transparent.'
    },
    {
      category: 'Institutions',
      question: 'How does MentoLoop ensure quality?',
      answer: 'All preceptors are verified through license checks, NPI verification, and reference checks. We monitor rotation quality through student feedback, completion rates, and our support team\'s regular check-ins. Institutions receive quarterly quality reports.'
    },
    
    // Process Questions
    {
      category: 'Process',
      question: 'What happens after I submit my intake form?',
      answer: 'After submission: 1) We review your requirements and preferences, 2) Our matching system identifies compatible preceptors, 3) We present you with match options, 4) You confirm your selection, 5) We coordinate introduction and paperwork, 6) Your rotation begins with ongoing support.'
    },
    {
      category: 'Process',
      question: 'How does the matching process work?',
      answer: 'Our system considers multiple factors including: clinical specialty needs, geographic preferences, schedule compatibility, learning style alignment, and specific requirements from your school. Premium members get access to our advanced compatibility scoring for optimal matches.'
    },
    {
      category: 'Process',
      question: 'What if I need to change my rotation dates?',
      answer: 'We understand schedules can change. Contact our support team as soon as possible. We\'ll work with you and your preceptor to accommodate changes when feasible. Some changes may require finding a new match depending on preceptor availability.'
    }
  ]

  const categories = ['all', ...Array.from(new Set(faqs.map(faq => faq.category)))]

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const groupedFAQs = filteredFAQs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = []
    }
    acc[faq.category].push(faq)
    return acc
  }, {} as Record<string, FAQItem[]>)

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about MentoLoop
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize"
                  >
                    {category === 'all' ? 'All Questions' : category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Items */}
        {Object.keys(groupedFAQs).length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No questions found. Try adjusting your search or filter.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedFAQs).map(([category, categoryFAQs]) => (
              <div key={category}>
                <h2 className="text-xl font-semibold mb-4">{category}</h2>
                <div className="space-y-3">
                  {categoryFAQs.map((faq, index) => {
                    const globalIndex = faqs.indexOf(faq)
                    const isOpen = openIndex === globalIndex
                    
                    return (
                      <Card key={globalIndex} className="overflow-hidden">
                        <button
                          className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                          onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                        >
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium pr-4">{faq.question}</h3>
                            <ChevronDown 
                              className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                        </button>
                        {isOpen && (
                          <CardContent className="pt-0 pb-6">
                            <p className="text-muted-foreground">{faq.answer}</p>
                          </CardContent>
                        )}
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Still Have Questions */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Still have questions?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/help">Visit Help Center</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}