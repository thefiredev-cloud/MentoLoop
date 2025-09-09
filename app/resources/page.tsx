'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  FileText, 
  Video, 
  Users, 
  GraduationCap, 
  Stethoscope,
  Download,
  ExternalLink,
  Clock,
  Star
} from 'lucide-react'
import Link from 'next/link'

const resources = [
  {
    category: 'Getting Started',
    items: [
      {
        title: 'Student Onboarding Guide',
        description: 'Complete guide for new students to navigate the platform',
        type: 'document',
        duration: '10 min read',
        icon: GraduationCap,
        link: '/help#student-onboarding',
        badge: 'Essential'
      },
      {
        title: 'Preceptor Welcome Kit',
        description: 'Everything preceptors need to know to get started',
        type: 'document',
        duration: '15 min read',
        icon: Stethoscope,
        link: '/help#preceptor-onboarding',
        badge: 'Essential'
      },
      {
        title: 'Platform Tour Video',
        description: 'Video walkthrough of key features and navigation',
        type: 'video',
        duration: '5 min watch',
        icon: Video,
        link: '/help#video-tour',
        badge: 'Popular'
      }
    ]
  },
  {
    category: 'Clinical Resources',
    items: [
      {
        title: 'Clinical Hour Tracking Template',
        description: 'Excel template for tracking your clinical hours',
        type: 'download',
        duration: 'Download',
        icon: FileText,
        link: '#',
        badge: 'Template'
      },
      {
        title: 'Rotation Planning Guide',
        description: 'How to plan and organize your clinical rotations',
        type: 'document',
        duration: '20 min read',
        icon: BookOpen,
        link: '/help#rotation-planning'
      },
      {
        title: 'Preceptor Communication Best Practices',
        description: 'Tips for effective communication with your preceptor',
        type: 'document',
        duration: '8 min read',
        icon: Users,
        link: '/help#communication'
      }
    ]
  },
  {
    category: 'Educational Materials',
    items: [
      {
        title: 'NP Program Requirements Guide',
        description: 'Understanding clinical requirements for NP programs',
        type: 'document',
        duration: '15 min read',
        icon: GraduationCap,
        link: '/help#requirements'
      },
      {
        title: 'Clinical Skills Checklist',
        description: 'Comprehensive checklist of essential clinical skills',
        type: 'download',
        duration: 'Download',
        icon: FileText,
        link: '#',
        badge: 'Updated'
      },
      {
        title: 'Evaluation Preparation Guide',
        description: 'How to prepare for clinical evaluations',
        type: 'document',
        duration: '12 min read',
        icon: Star,
        link: '/help#evaluations'
      }
    ]
  },
  {
    category: 'Support & Help',
    items: [
      {
        title: 'FAQ Database',
        description: 'Answers to frequently asked questions',
        type: 'document',
        duration: 'Browse',
        icon: BookOpen,
        link: '/help#faq'
      },
      {
        title: 'Contact Support',
        description: 'Get help from our support team',
        type: 'contact',
        duration: 'Immediate',
        icon: Users,
        link: '/contact'
      }
    ]
  }
]

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'document':
      return <FileText className="h-4 w-4" />
    case 'video':
      return <Video className="h-4 w-4" />
    case 'download':
      return <Download className="h-4 w-4" />
    case 'external':
    case 'contact':
      return <ExternalLink className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

const getTypeBadgeVariant = (type: string): "default" | "secondary" | "outline" | "destructive" => {
  switch (type) {
    case 'video':
      return 'default'
    case 'download':
      return 'secondary'
    default:
      return 'outline'
  }
}

export default function ResourcesPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Resources</h1>
        <p className="text-muted-foreground">
          Guides, templates, and educational materials to support your clinical journey
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Button variant="outline" className="justify-start" asChild>
          <Link href="/help">
            <BookOpen className="h-4 w-4 mr-2" />
            Help Center
          </Link>
        </Button>
        <Button variant="outline" className="justify-start" asChild>
          <Link href="/help#video-tour">
            <Video className="h-4 w-4 mr-2" />
            Video Tutorials
          </Link>
        </Button>
        <Button variant="outline" className="justify-start" asChild>
          <Link href="/contact">
            <Users className="h-4 w-4 mr-2" />
            Contact Support
          </Link>
        </Button>
        <Button variant="outline" className="justify-start" asChild>
          <Link href="/help#faq">
            <FileText className="h-4 w-4 mr-2" />
            FAQs
          </Link>
        </Button>
      </div>

      {/* Resource Categories */}
      <div className="space-y-8">
        {resources.map((category) => (
          <div key={category.category}>
            <h2 className="text-xl font-semibold mb-4">{category.category}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {category.items.map((resource) => {
                const Icon = resource.icon
                return (
                  <Card key={resource.title} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        {resource.badge && (
                          <Badge variant={resource.badge === 'Essential' ? 'default' : 'secondary'}>
                            {resource.badge}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base mt-3">{resource.title}</CardTitle>
                      <CardDescription>{resource.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{resource.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getTypeBadgeVariant(resource.type)} className="text-xs">
                            {getTypeIcon(resource.type)}
                            <span className="ml-1 capitalize">{resource.type}</span>
                          </Badge>
                          {resource.link !== '#' ? (
                            <Button size="sm" variant="ghost" asChild>
                              <Link href={resource.link}>
                                View
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Link>
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" disabled>
                              Coming Soon
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <Card className="mt-8 bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Need More Help?</CardTitle>
          <CardDescription>
            Can&apos;t find what you&apos;re looking for? Our support team is here to help.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/contact">
                Contact Support
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/help">
                Browse Help Center
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}