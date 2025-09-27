'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
 
import { Award, Clock, DollarSign, Shield, Star, Users } from 'lucide-react'

import HeroSection from '@/components/preceptors/HeroSection'
import BenefitsSection from '@/components/preceptors/BenefitsSection'
import RecognitionSection from '@/components/preceptors/RecognitionSection'
import ProcessSection from '@/components/preceptors/ProcessSection'
import RequirementsSection from '@/components/preceptors/RequirementsSection'
 
import CtaSection from '@/components/preceptors/CtaSection'
import {
  PreceptorBenefit,
  PreceptorHeroCopy,
  PreceptorProcessStep,
  PreceptorRecognitionItem,
  PreceptorRequirement
} from '@/components/preceptors/types'

const MentoLoopBackground = dynamic(() => import('@/components/mentoloop-background'), {
  ssr: false,
  loading: () => <div className="min-h-fit" />
})

 

export default function PreceptorsPage() {

  const heroCopy: PreceptorHeroCopy = {
    titleLead: 'Mentor the Next Generation',
    highlightedTitle: 'of Nurse Practitioners',
    subtitle: 'Shape the Future of Healthcare',
    description: 'On your terms. Your schedule. Your way.',
    supportingCopy:
      'MentoLoop makes precepting flexible and rewarding. Earn honorariums, gain recognition, and focus on mentoring while we handle the logistics.'
  }

  const heroHighlights = [
    'Flexible scheduling',
    'Competitive honorariums',
    'Dedicated support team'
  ] as const

  const benefits = useMemo(
    () => [
      new PreceptorBenefit(
        <DollarSign className="h-6 w-6" />, 
        'Earn Honorariums',
        'Receive transparent compensation per rotation with simple 1099 reporting.'
      ),
      new PreceptorBenefit(
        <Clock className="h-6 w-6" />, 
        'Control Your Schedule',
        'Choose when and how many students to support based on your availability.'
      ),
      new PreceptorBenefit(
        <Shield className="h-6 w-6" />, 
        'Vetted Students',
        'Mentor learners who have been verified for readiness and program alignment.'
      ),
      new PreceptorBenefit(
        <Users className="h-6 w-6" />, 
        'Full Admin Support',
        'We handle onboarding, paperwork, scheduling, and documentation so you can teach.'
      ),
      new PreceptorBenefit(
        <Star className="h-6 w-6" />, 
        'Recognition Badges',
        'Earn MentorFit™ badges and celebrate milestones within the community.'
      )
    ],
    []
  )

  const recognitionItems = useMemo(
    () => [
      new PreceptorRecognitionItem(
        <Star className="h-6 w-6" />, 
        'MentorFit™ Badges',
        'Milestone recognition for consistent mentorship.'
      ),
      new PreceptorRecognitionItem(
        <Users className="h-6 w-6" />, 
        'Peer Community',
        'Connect with fellow preceptors through LoopExchange™.'
      ),
      new PreceptorRecognitionItem(
        <Award className="h-6 w-6" />, 
        'CEU Workshops',
        'Access exclusive continuing education opportunities.'
      ),
      new PreceptorRecognitionItem(
        <DollarSign className="h-6 w-6" />, 
        'Referral Rewards',
        'Receive bonuses for introducing verified preceptors.'
      )
    ],
    []
  )

  const processSteps = useMemo(
    () => [
      new PreceptorProcessStep(1, 'Create Your Profile', 'Share your availability, specialties, and placement preferences.'),
      new PreceptorProcessStep(2, 'Get Matched', 'MentorFit™ pairs you with students who align with your scope and schedule.'),
      new PreceptorProcessStep(3, 'Mentor with Confidence', 'We manage contracts and tracking so you can focus on clinical teaching.')
    ],
    []
  )

  const requirements = useMemo(
    () => [
      new PreceptorRequirement('Active, unrestricted NP license'),
      new PreceptorRequirement('Minimum of two years in clinical practice'),
      new PreceptorRequirement('Commitment to provide constructive feedback and evaluations'),
      new PreceptorRequirement('Professional liability insurance (we can help arrange coverage)'),
      new PreceptorRequirement('Willingness to collaborate with program faculty')
    ],
    []
  )

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        copy={heroCopy}
        highlights={heroHighlights}
        primaryCta={{ href: '/sign-up/preceptor', label: 'Become a Preceptor' }}
        BackgroundComponent={MentoLoopBackground}
      />

      <div className="relative bg-gradient-to-b from-background via-[#0b162d]/85 to-[#123974]">
        <BenefitsSection
          heading="Why Preceptors Join MentoLoop"
          description="Support students, grow professionally, and let us handle the administration."
          benefits={benefits}
        />

        <RecognitionSection
          heading="Recognition & Community"
          description="Celebrate your impact and stay connected with peers who mentor alongside you."
          items={recognitionItems}
        />

        <ProcessSection
          heading="How It Works"
          steps={processSteps}
          cta={{ href: '/sign-up/preceptor', label: 'Apply Now' }}
        />

        <RequirementsSection
          heading="Requirements"
          description="We partner with dedicated clinicians who provide high-quality mentorship."
          requirements={requirements}
          note="Need liability coverage? Our team can connect you with discounted partners."
        />

        <CtaSection
          heading="Ready to Make a Difference?"
          description="Join our growing community of preceptors and help shape the next generation of nurse practitioners."
          primaryCta={{ href: '/sign-up/preceptor', label: 'Sign Up as a Preceptor' }}
          secondaryAction={
            <a
              className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-foreground/10"
              href="/contact"
            >
              Have Questions?
            </a>
          }
          subcopy="Flexible commitment • Dedicated support • Cancel anytime"
        />
      </div>
    </div>
  )
}

