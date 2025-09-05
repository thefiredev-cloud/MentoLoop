import { v } from "convex/values"
import { mutation } from "./_generated/server"

// Seed initial testimonials data
export const seedTestimonials = mutation({
  args: {},
  handler: async (ctx, args) => {
    // Check if testimonials already exist
    const existingTestimonials = await ctx.db.query("testimonials").first()
    if (existingTestimonials) {
      return { message: "Testimonials already exist, skipping seed" }
    }

    const now = Date.now()

    // Landing page testimonials
    const landingTestimonials = [
      {
        name: 'Sarah Chen',
        title: 'FNP Student, University of California',
        institution: 'University of California',
        userType: 'student' as const,
        rating: 5,
        content: 'MentoLoop found me the perfect preceptor match in just 10 days. The MentorFit algorithm really understood my learning style and paired me with someone who challenged me in all the right ways.',
        featured: true,
        approved: true,
        isPublic: true,
        location: { city: 'Los Angeles', state: 'CA' },
        rotationType: 'family-practice',
        createdAt: now,
      },
      {
        name: 'Dr. Maria Rodriguez',
        title: 'Family Nurse Practitioner, Primary Care',
        institution: 'Primary Care Associates',
        userType: 'preceptor' as const,
        rating: 5,
        content: 'As a preceptor, MentoLoop makes it so easy to find students who are truly ready to learn. The screening process ensures I get motivated, prepared students every time.',
        featured: true,
        approved: true,
        isPublic: true,
        location: { city: 'Miami', state: 'FL' },
        rotationType: 'family-practice',
        createdAt: now,
      },
      {
        name: 'Jessica Thompson',
        title: 'PMHNP Student, Johns Hopkins',
        institution: 'Johns Hopkins University',
        userType: 'student' as const,
        rating: 5,
        content: 'After struggling to find a psych preceptor for months, MentoLoop matched me within 2 weeks. The paperwork support was incredible - they handled everything!',
        featured: true,
        approved: true,
        isPublic: true,
        location: { city: 'Baltimore', state: 'MD' },
        rotationType: 'psych-mental-health',
        createdAt: now,
      },
      {
        name: 'Dr. Michael Park',
        title: 'Psychiatric Nurse Practitioner',
        institution: 'Mental Health Center',
        userType: 'preceptor' as const,
        rating: 5,
        content: 'MentoLoop has completely transformed how I approach student mentorship. The platform helps me find students whose goals and style align with mine, making the teaching experience so much more rewarding.',
        featured: true,
        approved: true,
        isPublic: true,
        location: { city: 'Seattle', state: 'WA' },
        rotationType: 'psych-mental-health',
        createdAt: now,
      },
      {
        name: 'Emily Davis',
        title: 'AGNP Student, Duke University',
        institution: 'Duke University',
        userType: 'student' as const,
        rating: 5,
        content: 'The stress of finding clinical placements was overwhelming until I found MentoLoop. Their team supported me through every step and I felt confident going into my rotations.',
        featured: true,
        approved: true,
        isPublic: true,
        location: { city: 'Durham', state: 'NC' },
        rotationType: 'adult-gero',
        createdAt: now,
      },
      {
        name: 'Dr. Jennifer Adams',
        title: 'Women\'s Health NP, Private Practice',
        institution: 'Women\'s Health Associates',
        userType: 'preceptor' as const,
        rating: 5,
        content: 'MentoLoop understands the unique challenges of NP education. They connected me with passionate students and provided the support structure that made mentoring feel natural and fulfilling.',
        featured: true,
        approved: true,
        isPublic: true,
        location: { city: 'Austin', state: 'TX' },
        rotationType: 'womens-health',
        createdAt: now,
      },
    ]

    // Student page testimonials
    const studentTestimonials = [
      {
        name: "Sarah Johnson",
        title: "FNP Student, UCLA",
        institution: "UCLA",
        userType: 'student' as const,
        rating: 5,
        content: "MentoLoop found me an amazing preceptor in just one week! The process was seamless and the support team was incredible.",
        featured: false,
        approved: true,
        isPublic: true,
        location: { city: 'Los Angeles', state: 'CA' },
        rotationType: 'family-practice',
        createdAt: now,
      },
      {
        name: "Michael Chen",
        title: "AGNP Student, Johns Hopkins",
        institution: "Johns Hopkins University",
        userType: 'student' as const,
        rating: 5,
        content: "After struggling for months to find a preceptor, MentoLoop matched me with the perfect mentor. Worth every penny!",
        featured: false,
        approved: true,
        isPublic: true,
        location: { city: 'Baltimore', state: 'MD' },
        rotationType: 'adult-gero',
        createdAt: now,
      },
      {
        name: "Emily Rodriguez",
        title: "PNP Student, Duke",
        institution: "Duke University",
        userType: 'student' as const,
        rating: 5,
        content: "The matching algorithm really works! My preceptor was exactly what I needed for my pediatric rotation.",
        featured: false,
        approved: true,
        isPublic: true,
        location: { city: 'Durham', state: 'NC' },
        rotationType: 'pediatrics',
        createdAt: now,
      }
    ]

    // Preceptor page testimonials
    const preceptorTestimonials = [
      {
        name: "Dr. Patricia Williams",
        title: "Family Nurse Practitioner",
        institution: "Family Health Clinic",
        userType: 'preceptor' as const,
        rating: 5,
        content: "MentoLoop makes precepting so easy! They handle everything so I can focus on teaching. The students are well-prepared and eager to learn.",
        featured: false,
        approved: true,
        isPublic: true,
        location: { city: 'Phoenix', state: 'AZ' },
        rotationType: 'family-practice',
        createdAt: now,
      },
      {
        name: "Dr. James Martinez",
        title: "Adult-Gerontology NP",
        institution: "Senior Care Associates",
        userType: 'preceptor' as const,
        rating: 5,
        content: "I love giving back to the profession. The honorarium is a nice bonus, but the real reward is seeing students grow into confident practitioners.",
        featured: false,
        approved: true,
        isPublic: true,
        location: { city: 'Denver', state: 'CO' },
        rotationType: 'adult-gero',
        createdAt: now,
      },
      {
        name: "Dr. Amanda Foster",
        title: "Psychiatric NP",
        institution: "Mental Health Partners",
        userType: 'preceptor' as const,
        rating: 5,
        content: "The platform matches me with students who truly align with my practice. It's been a wonderful experience mentoring through MentoLoop.",
        featured: false,
        approved: true,
        isPublic: true,
        location: { city: 'Oklahoma City', state: 'OK' },
        rotationType: 'psych-mental-health',
        createdAt: now,
      }
    ]

    // Insert all testimonials
    const allTestimonials = [...landingTestimonials, ...studentTestimonials, ...preceptorTestimonials]
    const insertResults = []

    for (const testimonial of allTestimonials) {
      const id = await ctx.db.insert("testimonials", testimonial)
      insertResults.push({ id, name: testimonial.name })
    }

    return {
      message: "Testimonials seeded successfully",
      count: insertResults.length,
      testimonials: insertResults
    }
  },
})

// Seed initial platform statistics
export const seedPlatformStats = mutation({
  args: {},
  handler: async (ctx, args) => {
    // Check if stats already exist
    const existingStats = await ctx.db.query("platformStats").first()
    if (existingStats) {
      return { message: "Platform stats already exist, skipping seed" }
    }

    const now = Date.now()

    const initialStats = [
      {
        metric: "success_rate",
        value: 95,
        description: "Successful match rate",
        displayFormat: "percentage" as const,
        category: "performance" as const,
        isActive: true,
        updatedAt: now,
        calculatedAt: now,
      },
      {
        metric: "avg_placement_time",
        value: "1-3 weeks",
        description: "Average placement time",
        displayFormat: "text" as const,
        category: "performance" as const,
        isActive: true,
        updatedAt: now,
        calculatedAt: now,
      },
      {
        metric: "total_matches",
        value: 2500,
        description: "Total successful matches made",
        displayFormat: "number" as const,
        category: "growth" as const,
        isActive: true,
        updatedAt: now,
        calculatedAt: now,
      },
      {
        metric: "active_preceptors",
        value: 1200,
        description: "Active preceptors in network",
        displayFormat: "number" as const,
        category: "growth" as const,
        isActive: true,
        updatedAt: now,
        calculatedAt: now,
      },
      {
        metric: "student_satisfaction",
        value: 4.9,
        description: "Average student satisfaction rating",
        displayFormat: "number" as const,
        category: "quality" as const,
        isActive: true,
        updatedAt: now,
        calculatedAt: now,
        metadata: { scale: "5-point", unit: "stars" },
      },
      {
        metric: "response_time",
        value: "2.3 hours",
        description: "Average response time",
        displayFormat: "text" as const,
        category: "performance" as const,
        isActive: true,
        updatedAt: now,
        calculatedAt: now,
      },
    ]

    const insertResults = []
    for (const stat of initialStats) {
      const id = await ctx.db.insert("platformStats", stat)
      insertResults.push({ id, metric: stat.metric, value: stat.value })
    }

    return {
      message: "Platform stats seeded successfully",
      count: insertResults.length,
      stats: insertResults
    }
  },
})