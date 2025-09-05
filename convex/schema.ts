import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
      name: v.string(),
      // this the Clerk ID, stored in the subject JWT field
      externalId: v.string(),
      userType: v.optional(v.union(v.literal("student"), v.literal("preceptor"), v.literal("admin"), v.literal("enterprise"))),
      enterpriseId: v.optional(v.id("enterprises")),
      permissions: v.optional(v.array(v.string())),
      email: v.optional(v.string()),
      createdAt: v.optional(v.number()),
      // Location tracking for supported states
      location: v.optional(v.object({
        city: v.string(),
        state: v.string(), // AR, AZ, CA, CO, FL, LA, NM, OK, TX
        zipCode: v.string(),
        county: v.optional(v.string()),
        metroArea: v.optional(v.string()), // Major metro areas in each state
        region: v.optional(v.string()), // Regional designation within state
        ipAddress: v.optional(v.string()),
        lat: v.optional(v.number()),
        lng: v.optional(v.number()),
        verifiedAt: v.optional(v.number()),
        verificationMethod: v.optional(v.union(
          v.literal("ip-geolocation"), 
          v.literal("user-provided"), 
          v.literal("admin-verified")
        )),
      })),
    }).index("byExternalId", ["externalId"])
      .index("byUserType", ["userType"])
      .index("byEmail", ["email"])
      .index("byLocation", ["location.state", "location.city"])
      .index("byMetroArea", ["location.metroArea"])
      .index("byZipCode", ["location.zipCode"]),
    
    // Payment attempts and Stripe transactions
    paymentAttempts: defineTable({
      matchId: v.id("matches"),
      stripeSessionId: v.string(),
      amount: v.number(), // Amount in cents
      currency: v.optional(v.string()),
      status: v.union(v.literal("pending"), v.literal("succeeded"), v.literal("failed")),
      failureReason: v.optional(v.string()),
      paidAt: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.optional(v.number()),
    }).index("byMatchId", ["matchId"])
      .index("byStripeSessionId", ["stripeSessionId"])
      .index("byStatus", ["status"]),

    // Student intake payment attempts
    intakePaymentAttempts: defineTable({
      customerEmail: v.string(),
      customerName: v.string(),
      membershipPlan: v.string(), // core, pro, premium
      stripeSessionId: v.string(),
      stripeCustomerId: v.optional(v.string()),
      amount: v.number(), // Amount in cents
      currency: v.optional(v.string()),
      status: v.union(v.literal("pending"), v.literal("succeeded"), v.literal("failed")),
      failureReason: v.optional(v.string()),
      discountCode: v.optional(v.string()), // Discount code used
      discountPercent: v.optional(v.number()), // Percentage discounted
      paidAt: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.optional(v.number()),
    }).index("byStripeSessionId", ["stripeSessionId"])
      .index("byCustomerEmail", ["customerEmail"])
      .index("byStatus", ["status"]),

    // Payments table for completed transactions
    payments: defineTable({
      userId: v.id("users"),
      matchId: v.optional(v.id("matches")),
      stripePaymentIntentId: v.string(),
      stripeCustomerId: v.optional(v.string()),
      amount: v.number(), // Amount in cents
      currency: v.string(),
      status: v.union(v.literal("succeeded"), v.literal("refunded"), v.literal("partially_refunded")),
      description: v.optional(v.string()),
      receiptUrl: v.optional(v.string()),
      refundedAmount: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.optional(v.number()),
    }).index("byUserId", ["userId"])
      .index("byMatchId", ["matchId"])
      .index("byStripePaymentIntentId", ["stripePaymentIntentId"])
      .index("byStatus", ["status"]),

    // Preceptor earnings - payments FROM MentoLoop TO preceptors
    preceptorEarnings: defineTable({
      preceptorId: v.id("users"),
      matchId: v.id("matches"),
      studentId: v.id("users"),
      amount: v.number(), // Amount in cents
      currency: v.string(),
      status: v.union(v.literal("pending"), v.literal("paid"), v.literal("cancelled")),
      description: v.string(),
      rotationStartDate: v.optional(v.string()),
      rotationEndDate: v.optional(v.string()),
      paymentMethod: v.optional(v.union(v.literal("direct_deposit"), v.literal("check"), v.literal("paypal"))),
      paymentReference: v.optional(v.string()), // Transaction ID or check number
      paidAt: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.optional(v.number()),
    }).index("byPreceptorId", ["preceptorId"])
      .index("byMatchId", ["matchId"])
      .index("byStatus", ["status"])
      .index("byPaidAt", ["paidAt"])
      .index("byCreatedAt", ["createdAt"]),

    // Preceptor payment information
    preceptorPaymentInfo: defineTable({
      preceptorId: v.id("users"),
      paymentMethod: v.union(v.literal("direct_deposit"), v.literal("check"), v.literal("paypal")),
      // Direct deposit info (encrypted in production)
      bankAccountNumber: v.optional(v.string()),
      routingNumber: v.optional(v.string()),
      accountType: v.optional(v.union(v.literal("checking"), v.literal("savings"))),
      // Mailing address for checks
      mailingAddress: v.optional(v.object({
        street: v.string(),
        city: v.string(),
        state: v.string(),
        zipCode: v.string(),
      })),
      // PayPal info
      paypalEmail: v.optional(v.string()),
      // Tax information
      taxId: v.optional(v.string()), // SSN or EIN (encrypted)
      taxFormType: v.optional(v.union(v.literal("W9"), v.literal("W8BEN"))),
      taxFormSubmitted: v.optional(v.boolean()),
      taxFormSubmittedAt: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.optional(v.number()),
    }).index("byPreceptorId", ["preceptorId"]),

    // Student profiles and intake data
    students: defineTable({
      userId: v.id("users"),
      // Personal Information
      personalInfo: v.object({
        fullName: v.string(),
        email: v.string(),
        phone: v.string(),
        dateOfBirth: v.string(),
        preferredContact: v.union(v.literal("email"), v.literal("phone"), v.literal("text")),
        linkedinOrResume: v.optional(v.string()),
      }),
      // School Information
      schoolInfo: v.object({
        programName: v.string(),
        degreeTrack: v.union(
          v.literal("FNP"), v.literal("PNP"), v.literal("PMHNP"), 
          v.literal("AGNP"), v.literal("ACNP"), v.literal("WHNP"), 
          v.literal("NNP"), v.literal("DNP")
        ),
        schoolLocation: v.object({
          city: v.string(),
          state: v.string(),
        }),
        programFormat: v.union(v.literal("online"), v.literal("in-person"), v.literal("hybrid")),
        expectedGraduation: v.string(),
        clinicalCoordinatorName: v.optional(v.string()),
        clinicalCoordinatorEmail: v.optional(v.string()),
      }),
      // Rotation Needs
      rotationNeeds: v.object({
        rotationTypes: v.array(v.union(
          v.literal("family-practice"), v.literal("pediatrics"), v.literal("psych-mental-health"),
          v.literal("womens-health"), v.literal("adult-gero"), v.literal("acute-care"),
          v.literal("telehealth"), v.literal("other")
        )),
        otherRotationType: v.optional(v.string()),
        startDate: v.string(),
        endDate: v.string(),
        weeklyHours: v.union(
          v.literal("<8"), v.literal("8-16"), v.literal("16-24"), 
          v.literal("24-32"), v.literal("32+")
        ),
        daysAvailable: v.array(v.union(
          v.literal("monday"), v.literal("tuesday"), v.literal("wednesday"),
          v.literal("thursday"), v.literal("friday"), v.literal("saturday"), v.literal("sunday")
        )),
        willingToTravel: v.boolean(),
        preferredLocation: v.optional(v.object({
          city: v.string(),
          state: v.string(),
        })),
      }),
      // Matching Preferences
      matchingPreferences: v.object({
        comfortableWithSharedPlacements: v.optional(v.boolean()),
        languagesSpoken: v.optional(v.array(v.string())),
        idealPreceptorQualities: v.optional(v.string()),
      }),
      // MentorFit Learning Style Assessment
      learningStyle: v.object({
        // Basic questions (1-10)
        learningMethod: v.union(v.literal("hands-on"), v.literal("step-by-step"), v.literal("independent")),
        clinicalComfort: v.union(v.literal("not-comfortable"), v.literal("somewhat-comfortable"), v.literal("very-comfortable")),
        feedbackPreference: v.union(v.literal("real-time"), v.literal("end-of-day"), v.literal("minimal")),
        structurePreference: v.union(v.literal("clear-schedules"), v.literal("general-guidance"), v.literal("open-ended")),
        mentorRelationship: v.union(v.literal("teacher-coach"), v.literal("collaborator"), v.literal("supervisor")),
        observationPreference: v.union(v.literal("observe-first"), v.literal("mix-both"), v.literal("jump-in")),
        correctionStyle: v.union(v.literal("direct-immediate"), v.literal("supportive-private"), v.literal("written-summaries")),
        retentionStyle: v.union(v.literal("watching-doing"), v.literal("note-taking"), v.literal("questions-discussion")),
        additionalResources: v.union(v.literal("yes-love"), v.literal("occasionally"), v.literal("not-necessary")),
        proactiveQuestions: v.number(), // 1-5 scale
        // Phase 2.0 Extended questions (11-18)
        feedbackType: v.optional(v.union(v.literal("verbal-examples"), v.literal("specific-critiques"), v.literal("encouragement-affirmation"))),
        mistakeApproach: v.optional(v.union(v.literal("corrected-immediately"), v.literal("talk-through-after"), v.literal("reflect-silently"))),
        motivationType: v.optional(v.union(v.literal("trusted-responsibility"), v.literal("seeing-progress"), v.literal("positive-feedback"))),
        preparationStyle: v.optional(v.union(v.literal("coached-through"), v.literal("present-get-feedback"), v.literal("try-fully-alone"))),
        learningCurve: v.optional(v.union(v.literal("challenge-early-often"), v.literal("build-gradually"), v.literal("repetition-reinforcement"))),
        frustrations: v.optional(v.union(v.literal("lack-expectations"), v.literal("minimal-vague-feedback"), v.literal("being-micromanaged"))),
        environment: v.optional(v.union(v.literal("calm-controlled"), v.literal("some-pressure"), v.literal("high-energy"))),
        observationNeeds: v.optional(v.union(v.literal("watch-1-2-first"), v.literal("just-one-enough"), v.literal("ready-start-immediately"))),
        // Personality & Values (shared with preceptors)
        professionalValues: v.optional(v.array(v.union(
          v.literal("compassion"), v.literal("efficiency"), v.literal("collaboration"), 
          v.literal("lifelong-learning"), v.literal("integrity"), v.literal("equity-inclusion"), v.literal("advocacy")
        ))),
        clinicalEnvironment: v.optional(v.union(v.literal("calm-methodical"), v.literal("busy-fast-paced"), v.literal("flexible-informal"), v.literal("structured-clear-goals"))),
        // Experience Level
        programStage: v.optional(v.union(v.literal("just-starting"), v.literal("mid-program"), v.literal("near-graduation"))),
        // Flexibility
        scheduleFlexibility: v.optional(v.union(v.literal("very-flexible"), v.literal("somewhat-flexible"), v.literal("prefer-fixed"))),
      }),
      // Agreement and signatures
      agreements: v.object({
        agreedToPaymentTerms: v.boolean(),
        agreedToTermsAndPrivacy: v.boolean(),
        digitalSignature: v.string(),
        submissionDate: v.string(),
      }),
      // Membership and payment information
      membershipPlan: v.optional(v.union(v.literal("core"), v.literal("pro"), v.literal("premium"))),
      stripeCustomerId: v.optional(v.string()),
      paymentStatus: v.optional(v.union(v.literal("pending"), v.literal("paid"), v.literal("failed"))),
      // Status tracking
      status: v.union(
        v.literal("incomplete"), v.literal("submitted"), 
        v.literal("under-review"), v.literal("matched"), v.literal("active")
      ),
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index("byUserId", ["userId"])
      .index("byStatus", ["status"])
      .index("byDegreeTrack", ["schoolInfo.degreeTrack"]),

    // Preceptor profiles and availability
    preceptors: defineTable({
      userId: v.id("users"),
      // Personal and Contact Information
      personalInfo: v.object({
        fullName: v.string(),
        email: v.string(),
        mobilePhone: v.string(),
        licenseType: v.union(v.literal("NP"), v.literal("MD/DO"), v.literal("PA"), v.literal("other")),
        specialty: v.union(
          v.literal("FNP"), v.literal("PNP"), v.literal("PMHNP"), 
          v.literal("AGNP"), v.literal("ACNP"), v.literal("WHNP"), 
          v.literal("NNP"), v.literal("other")
        ),
        statesLicensed: v.array(v.string()),
        npiNumber: v.string(),
        linkedinOrCV: v.optional(v.string()),
      }),
      // Practice Information
      practiceInfo: v.object({
        practiceName: v.string(),
        practiceSettings: v.array(v.union(
          v.literal("private-practice"), v.literal("urgent-care"), 
          v.literal("hospital"), v.literal("clinic"), v.literal("telehealth"), v.literal("other")
        )),
        address: v.string(),
        city: v.string(),
        state: v.string(),
        zipCode: v.string(),
        website: v.optional(v.string()),
        emrUsed: v.optional(v.string()),
      }),
      // Precepting Availability
      availability: v.object({
        currentlyAccepting: v.boolean(),
        availableRotations: v.array(v.union(
          v.literal("family-practice"), v.literal("pediatrics"), v.literal("psych-mental-health"),
          v.literal("adult-gero"), v.literal("womens-health"), v.literal("acute-care"), v.literal("other")
        )),
        maxStudentsPerRotation: v.union(v.literal("1"), v.literal("2"), v.literal("3+")),
        rotationDurationPreferred: v.union(
          v.literal("4-weeks"), v.literal("8-weeks"), v.literal("12-weeks"), v.literal("flexible")
        ),
        preferredStartDates: v.array(v.string()),
        daysAvailable: v.array(v.union(
          v.literal("monday"), v.literal("tuesday"), v.literal("wednesday"),
          v.literal("thursday"), v.literal("friday"), v.literal("saturday"), v.literal("sunday")
        )),
      }),
      // Matching Preferences
      matchingPreferences: v.object({
        studentDegreeLevelPreferred: v.union(
          v.literal("BSN-to-DNP"), v.literal("MSN"), v.literal("post-masters"), v.literal("no-preference")
        ),
        comfortableWithFirstRotation: v.boolean(),
        schoolsWorkedWith: v.optional(v.array(v.string())),
        languagesSpoken: v.optional(v.array(v.string())),
      }),
      // MentorFit Mentoring Style Assessment
      mentoringStyle: v.object({
        // Basic questions (1-10)
        mentoringApproach: v.union(v.literal("coach-guide"), v.literal("support-needed"), v.literal("expect-initiative")),
        rotationStart: v.union(v.literal("orient-goals"), v.literal("observe-adjust"), v.literal("dive-in-learn")),
        feedbackApproach: v.union(v.literal("real-time"), v.literal("daily-checkins"), v.literal("weekly-written")),
        learningMaterials: v.union(v.literal("always"), v.literal("sometimes"), v.literal("rarely")),
        patientInteractions: v.union(v.literal("lead-then-shadow"), v.literal("shadow-then-lead"), v.literal("lead-from-day-one")),
        questionPreference: v.union(v.literal("anytime-during"), v.literal("breaks-downtime"), v.literal("end-of-day")),
        autonomyLevel: v.union(v.literal("close-supervision"), v.literal("shared-decisions"), v.literal("high-independence")),
        evaluationFrequency: v.union(v.literal("every-shift"), v.literal("weekly"), v.literal("end-of-rotation")),
        newStudentPreference: v.union(v.literal("prefer-coaching"), v.literal("flexible"), v.literal("prefer-independent")),
        idealDynamic: v.union(v.literal("learner-teacher"), v.literal("teammates"), v.literal("supervisee-clinician")),
        // Phase 2.0 Extended questions (11-18)
        mistakeHandling: v.optional(v.union(v.literal("correct-immediately"), v.literal("wait-debrief-after"), v.literal("let-self-identify"))),
        growthPlanning: v.optional(v.union(v.literal("clear-progression"), v.literal("evolve-organically"), v.literal("student-driven"))),
        supervisionBalance: v.optional(v.union(v.literal("hands-on-whole-way"), v.literal("space-with-backup"), v.literal("student-led-learning"))),
        growthPace: v.optional(v.union(v.literal("fast-push-quickly"), v.literal("steady-based-milestones"), v.literal("flexible-find-rhythm"))),
        feedbackType: v.optional(v.union(v.literal("tactical-skills"), v.literal("reflective-attitude"), v.literal("balanced-mix"))),
        goalSetting: v.optional(v.union(v.literal("yes-beginning"), v.literal("midway-through"), v.literal("no-go-with-flow"))),
        learningEnvironment: v.optional(v.union(v.literal("one-on-one-shadowing"), v.literal("independent-checkins"), v.literal("team-based-shared"))),
        teachingFrustrations: v.optional(v.union(v.literal("lack-preparation"), v.literal("needing-constant-guidance"), v.literal("disengagement-poor-communication"))),
        // Personality & Values (shared with students)
        professionalValues: v.optional(v.array(v.union(
          v.literal("compassion"), v.literal("efficiency"), v.literal("collaboration"), 
          v.literal("lifelong-learning"), v.literal("integrity"), v.literal("equity-inclusion"), v.literal("advocacy")
        ))),
        // Experience Level
        studentsPrecepted: v.optional(v.union(v.literal("none-yet"), v.literal("1-3"), v.literal("4-10"), v.literal("10-plus"))),
        // Expectations & Dealbreakers
        studentBehaviorPreferences: v.optional(v.array(v.union(
          v.literal("punctuality"), v.literal("proactive-communication"), v.literal("patient-rapport-skills"), 
          v.literal("emr-documentation-confidence"), v.literal("other")
        ))),
        otherExpectation: v.optional(v.string()),
      }),
      // Agreements and Follow-up
      agreements: v.object({
        openToScreening: v.boolean(),
        wantSpotlightFeature: v.optional(v.boolean()),
        agreedToTermsAndPrivacy: v.boolean(),
        digitalSignature: v.string(),
        submissionDate: v.string(),
      }),
      // Verification status
      verificationStatus: v.union(
        v.literal("pending"), v.literal("under-review"), 
        v.literal("verified"), v.literal("rejected")
      ),
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index("byUserId", ["userId"])
      .index("byVerificationStatus", ["verificationStatus"])
      .index("bySpecialty", ["personalInfo.specialty"])
      .index("byState", ["practiceInfo.state"])
      .index("byAcceptingStatus", ["availability.currentlyAccepting"]),

    // Matches between students and preceptors
    matches: defineTable({
      studentId: v.id("students"),
      preceptorId: v.id("preceptors"),
      status: v.union(
        v.literal("suggested"), v.literal("pending"), v.literal("confirmed"), 
        v.literal("active"), v.literal("completed"), v.literal("cancelled")
      ),
      mentorFitScore: v.number(), // 0-10 compatibility score
      rotationDetails: v.object({
        startDate: v.string(),
        endDate: v.string(),
        weeklyHours: v.number(),
        rotationType: v.string(),
        location: v.optional(v.string()),
      }),
      // Location data for analytics (multi-state)
      locationData: v.optional(v.object({
        city: v.string(),
        state: v.string(), // AR, AZ, CA, CO, FL, LA, NM, OK, TX
        zipCode: v.string(),
        county: v.optional(v.string()),
        metroArea: v.optional(v.string()),
        region: v.optional(v.string()),
      })),
      paymentStatus: v.union(
        v.literal("unpaid"), v.literal("paid"), v.literal("refunded"), v.literal("cancelled")
      ),
      // AI Analysis Results
      aiAnalysis: v.optional(v.object({
        enhancedScore: v.number(), // AI-enhanced compatibility score
        analysis: v.string(), // Detailed AI analysis
        confidence: v.string(), // high, medium, low
        recommendations: v.array(v.string()),
        strengths: v.array(v.string()),
        concerns: v.array(v.string()),
        analyzedAt: v.number(),
      })),
      adminNotes: v.optional(v.string()),
      acceptedAt: v.optional(v.number()),
      declinedAt: v.optional(v.number()),
      matchedAt: v.optional(v.number()),
      completedAt: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index("byStudentId", ["studentId"])
      .index("byPreceptorId", ["preceptorId"])
      .index("byStatus", ["status"])
      .index("byMentorFitScore", ["mentorFitScore"])
      .index("byLocation", ["locationData.state", "locationData.city"])
      .index("byMetroArea", ["locationData.metroArea"])
      .index("byRegion", ["locationData.region"]),

    // NP Schools and Programs
    schools: defineTable({
      name: v.string(),
      location: v.object({
        city: v.string(),
        state: v.string(),
        country: v.string(),
      }),
      accreditation: v.string(),
      website: v.optional(v.string()),
      programs: v.array(v.object({
        name: v.string(),
        degreeType: v.string(),
        format: v.union(v.literal("online"), v.literal("in-person"), v.literal("hybrid")),
      })),
      clinicalRequirements: v.optional(v.object({
        totalHours: v.number(),
        backgroundCheckRequired: v.boolean(),
        additionalRequirements: v.optional(v.array(v.string())),
      })),
      isActive: v.boolean(),
    }).index("byState", ["location.state"])
      .index("byName", ["name"])
      .index("byActive", ["isActive"]),

    // Post-rotation surveys and feedback
    surveys: defineTable({
      matchId: v.id("matches"),
      respondentType: v.union(v.literal("student"), v.literal("preceptor")),
      respondentId: v.string(), // userId of respondent
      responses: v.object({
        // Common questions (1-5 scale)
        teachStyleMatch: v.optional(v.number()),
        commEffectiveness: v.optional(v.number()),
        caseMixAlignment: v.optional(v.number()),
        supportHoursComp: v.optional(v.number()),
        wouldRecommend: v.optional(v.number()),
        // Student-specific
        studentPreparedness: v.optional(v.number()),
        studentComm: v.optional(v.number()),
        teachability: v.optional(v.number()),
        competenceGrowth: v.optional(v.number()),
        // Open-ended feedback
        comments: v.optional(v.string()),
      }),
      // Location data for regional analytics (multi-state)
      locationData: v.optional(v.object({
        city: v.string(),
        state: v.string(), // AR, AZ, CA, CO, FL, LA, NM, OK, TX
        zipCode: v.string(),
        county: v.optional(v.string()),
        metroArea: v.optional(v.string()),
        region: v.optional(v.string()),
      })),
      submittedAt: v.number(),
    }).index("byMatchId", ["matchId"])
      .index("byRespondentType", ["respondentType"])
      .index("bySubmissionDate", ["submittedAt"])
      .index("byLocation", ["locationData.state", "locationData.city"])
      .index("byMetroArea", ["locationData.metroArea"]),

  // Email tracking for automation monitoring
  emailLogs: defineTable({
    templateKey: v.string(),
    recipientEmail: v.string(),
    recipientType: v.union(v.literal("student"), v.literal("preceptor"), v.literal("admin")),
    subject: v.string(),
    status: v.union(v.literal("sent"), v.literal("failed"), v.literal("pending")),
    sentAt: v.number(),
    failureReason: v.optional(v.string()),
    relatedMatchId: v.optional(v.id("matches")),
    relatedUserId: v.optional(v.string()),
  }).index("byRecipient", ["recipientEmail"])
    .index("byTemplate", ["templateKey"])
    .index("bySentDate", ["sentAt"])
    .index("byStatus", ["status"]),

  // SMS tracking for automation monitoring
  smsLogs: defineTable({
    templateKey: v.string(),
    recipientPhone: v.string(),
    recipientType: v.union(v.literal("student"), v.literal("preceptor"), v.literal("admin")),
    message: v.string(),
    status: v.union(v.literal("sent"), v.literal("failed"), v.literal("pending")),
    sentAt: v.number(),
    failureReason: v.optional(v.string()),
    twilioSid: v.optional(v.string()),
    relatedMatchId: v.optional(v.id("matches")),
    relatedUserId: v.optional(v.string()),
  }).index("byRecipient", ["recipientPhone"])
    .index("byTemplate", ["templateKey"])
    .index("bySentDate", ["sentAt"])
    .index("byStatus", ["status"]),

  // Enterprise organizations (schools, health systems, clinics)
  enterprises: defineTable({
    name: v.string(),
    type: v.union(v.literal("school"), v.literal("clinic"), v.literal("health-system")),
    organizationInfo: v.object({
      address: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      phone: v.string(),
      website: v.optional(v.string()),
      ein: v.optional(v.string()), // Employer Identification Number
      accreditation: v.optional(v.string()),
    }),
    adminUsers: v.array(v.id("users")), // Users who can manage this enterprise
    students: v.optional(v.array(v.id("students"))), // Students associated with this enterprise
    preceptors: v.optional(v.array(v.id("preceptors"))), // Preceptors associated with this enterprise
    billingInfo: v.optional(v.object({
      billingEmail: v.string(),
      paymentMethod: v.optional(v.string()),
      subscriptionTier: v.optional(v.union(v.literal("basic"), v.literal("pro"), v.literal("enterprise"))),
      monthlyStudentLimit: v.optional(v.number()),
      annualContract: v.optional(v.boolean()),
    })),
    preferences: v.optional(v.object({
      autoApproveStudents: v.boolean(),
      requireBackgroundChecks: v.boolean(),
      customRequirements: v.optional(v.array(v.string())),
      preferredNotificationMethod: v.union(v.literal("email"), v.literal("dashboard"), v.literal("both")),
    })),
    agreements: v.object({
      signedAt: v.number(),
      signedBy: v.string(), // Name of person who signed
      agreementVersion: v.string(),
      customTerms: v.optional(v.string()),
    }),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("pending"), v.literal("suspended")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("byType", ["type"])
    .index("byStatus", ["status"])
    .index("byState", ["organizationInfo.state"])
    .index("byName", ["name"]),

  // Audit logs for admin actions and system events
  auditLogs: defineTable({
    action: v.string(), // "create_match", "override_score", "approve_preceptor", etc.
    entityType: v.string(), // "match", "user", "payment", etc.
    entityId: v.string(), // ID of the affected entity
    performedBy: v.id("users"), // Admin who performed the action
    details: v.object({
      previousValue: v.optional(v.any()),
      newValue: v.optional(v.any()),
      reason: v.optional(v.string()),
      metadata: v.optional(v.record(v.string(), v.any())),
    }),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
  }).index("byAction", ["action"])
    .index("byEntityType", ["entityType"])
    .index("byPerformedBy", ["performedBy"])
    .index("byTimestamp", ["timestamp"])
    .index("byEntity", ["entityType", "entityId"]),


  // Conversations between students and preceptors
  conversations: defineTable({
    matchId: v.id("matches"), // Associated match for context
    studentId: v.id("students"),
    preceptorId: v.id("preceptors"),
    studentUserId: v.string(), // User ID for real-time queries
    preceptorUserId: v.string(), // User ID for real-time queries
    status: v.union(v.literal("active"), v.literal("archived"), v.literal("disabled")),
    lastMessageAt: v.optional(v.number()),
    lastMessagePreview: v.optional(v.string()),
    studentUnreadCount: v.number(),
    preceptorUnreadCount: v.number(),
    metadata: v.optional(v.object({
      rotationType: v.optional(v.string()),
      rotationDates: v.optional(v.object({
        startDate: v.string(),
        endDate: v.string(),
      })),
    })),
    // Typing indicator fields
    typingUserId: v.optional(v.string()),
    lastTypingUpdate: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("byMatch", ["matchId"])
    .index("byStudent", ["studentId"])
    .index("byPreceptor", ["preceptorId"])
    .index("byStudentUser", ["studentUserId"])
    .index("byPreceptorUser", ["preceptorUserId"])
    .index("byLastMessage", ["lastMessageAt"])
    .index("byStatus", ["status"]),

  // Individual messages within conversations
  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.string(), // User ID of sender
    senderType: v.union(v.literal("student"), v.literal("preceptor"), v.literal("system")),
    messageType: v.union(v.literal("text"), v.literal("file"), v.literal("system_notification")),
    content: v.string(),
    metadata: v.optional(v.object({
      // For file messages
      fileName: v.optional(v.string()),
      fileSize: v.optional(v.number()),
      fileType: v.optional(v.string()),
      fileUrl: v.optional(v.string()),
      storageId: v.optional(v.string()),
      // For system messages
      systemEventType: v.optional(v.string()),
      systemEventData: v.optional(v.record(v.string(), v.any())),
      // For message reactions
      reactions: v.optional(v.array(v.object({
        userId: v.string(),
        reaction: v.string(),
        addedAt: v.number(),
      }))),
    })),
    readBy: v.optional(v.array(v.object({
      userId: v.string(),
      readAt: v.number(),
    }))),
    editedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("byConversation", ["conversationId"])
    .index("bySender", ["senderId"])
    .index("byCreatedAt", ["createdAt"])
    .index("byConversationAndTime", ["conversationId", "createdAt"]),

  // Clinical hours tracking for students
  clinicalHours: defineTable({
    studentId: v.id("students"),
    matchId: v.optional(v.id("matches")), // Associated rotation/match
    date: v.string(), // Date of clinical work (YYYY-MM-DD format)
    hoursWorked: v.number(), // Hours worked (can be decimal like 7.5)
    startTime: v.optional(v.string()), // Start time (HH:MM format)
    endTime: v.optional(v.string()), // End time (HH:MM format)
    rotationType: v.string(), // Type of rotation (family-practice, pediatrics, etc.)
    site: v.string(), // Clinical site/practice name
    preceptorName: v.optional(v.string()), // Preceptor supervising
    activities: v.string(), // Description of clinical activities performed
    learningObjectives: v.optional(v.string()), // Learning objectives met
    patientPopulation: v.optional(v.string()), // Patient demographics/types
    procedures: v.optional(v.array(v.string())), // Procedures performed
    diagnoses: v.optional(v.array(v.string())), // Diagnoses encountered
    competenciesAddressed: v.optional(v.array(v.string())), // Competencies addressed
    reflectiveNotes: v.optional(v.string()), // Student reflection on experience
    preceptorFeedback: v.optional(v.string()), // Preceptor feedback if provided
    status: v.union(
      v.literal("draft"), v.literal("submitted"), v.literal("approved"), 
      v.literal("rejected"), v.literal("needs-revision")
    ),
    submittedAt: v.optional(v.number()),
    approvedAt: v.optional(v.number()),
    approvedBy: v.optional(v.id("users")), // Preceptor or admin who approved
    rejectionReason: v.optional(v.string()),
    // Metadata for analytics
    weekOfYear: v.number(), // Week number of the year
    monthOfYear: v.number(), // Month number (1-12)
    academicYear: v.string(), // Academic year (e.g., "2024-2025")
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("byStudent", ["studentId"])
    .index("byMatch", ["matchId"])
    .index("byDate", ["date"])
    .index("byStatus", ["status"])
    .index("byRotationType", ["rotationType"])
    .index("byWeek", ["weekOfYear"])
    .index("byMonth", ["monthOfYear"])
    .index("byAcademicYear", ["academicYear"])
    .index("byStudentAndDate", ["studentId", "date"])
    .index("byStudentAndStatus", ["studentId", "status"])
    .index("bySubmissionDate", ["submittedAt"]),

  // Security alerts and monitoring
  securityAlerts: defineTable({
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    title: v.string(),
    description: v.string(),
    userId: v.optional(v.id("users")),
    metadata: v.optional(v.any()),
    resolved: v.boolean(),
    resolvedBy: v.optional(v.id("users")),
    resolvedAt: v.optional(v.number()),
    resolution: v.optional(v.string()),
    timestamp: v.number(),
  }).index("bySeverity", ["severity"])
    .index("byResolved", ["resolved"])
    .index("byTimestamp", ["timestamp"])
    .index("byUser", ["userId"])
    .index("byResolvedBy", ["resolvedBy"])
    .index("bySeverityAndResolved", ["severity", "resolved"]),

  // Session management for security tracking
  userSessions: defineTable({
    userId: v.id("users"),
    sessionId: v.string(),
    ipAddress: v.string(),
    userAgent: v.string(),
    loginTime: v.number(),
    lastActivity: v.number(),
    logoutTime: v.optional(v.number()),
    active: v.boolean(),
    location: v.optional(v.object({
      country: v.optional(v.string()),
      region: v.optional(v.string()),
      city: v.optional(v.string()),
    })),
  }).index("byUser", ["userId"])
    .index("bySessionId", ["sessionId"])
    .index("byActive", ["active"])
    .index("byLoginTime", ["loginTime"])
    .index("byLastActivity", ["lastActivity"])
    .index("byUserAndActive", ["userId", "active"]),

  // Failed login attempts for security monitoring
  failedLogins: defineTable({
    email: v.optional(v.string()),
    ipAddress: v.string(),
    userAgent: v.string(),
    attemptTime: v.number(),
    reason: v.string(),
    blocked: v.optional(v.boolean()),
    blockedUntil: v.optional(v.number()),
  }).index("byEmail", ["email"])
    .index("byIpAddress", ["ipAddress"])
    .index("byAttemptTime", ["attemptTime"])
    .index("byBlocked", ["blocked"])
    .index("byEmailAndTime", ["email", "attemptTime"])
    .index("byIpAndTime", ["ipAddress", "attemptTime"]),

  // Data access logs for HIPAA compliance
  dataAccessLogs: defineTable({
    userId: v.id("users"),
    accessedTable: v.string(),
    accessedRecordId: v.string(),
    accessType: v.union(v.literal("read"), v.literal("write"), v.literal("delete")),
    timestamp: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    result: v.union(v.literal("success"), v.literal("failure")),
    reason: v.optional(v.string()),
  }).index("byUser", ["userId"])
    .index("byTable", ["accessedTable"])
    .index("byRecord", ["accessedRecordId"])
    .index("byAccessType", ["accessType"])
    .index("byTimestamp", ["timestamp"])
    .index("byResult", ["result"])
    .index("byUserAndTable", ["userId", "accessedTable"])
    .index("byTableAndRecord", ["accessedTable", "accessedRecordId"]),

  // Discount codes for promotional offers
  discountCodes: defineTable({
    couponId: v.string(), // Stripe coupon ID
    code: v.string(), // User-facing discount code (e.g., "NP12345")
    percentOff: v.number(), // Percentage discount (0-100)
    duration: v.string(), // "once", "repeating", or "forever"
    maxRedemptions: v.optional(v.number()), // Maximum number of times code can be used
    redeemBy: v.optional(v.number()), // Expiration timestamp
    metadata: v.optional(v.record(v.string(), v.string())), // Additional metadata
    active: v.boolean(), // Whether the code is currently active
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("byCode", ["code"])
    .index("byCouponId", ["couponId"])
    .index("byActive", ["active"]),

  // Track discount code usage
  discountUsage: defineTable({
    couponId: v.id("discountCodes"), // Reference to the discount code
    customerEmail: v.string(), // Email of the customer who used the code
    stripeSessionId: v.string(), // Stripe checkout session where the code was used
    amountDiscounted: v.number(), // Amount discounted in cents
    usedAt: v.number(), // Timestamp when the code was used
  }).index("byCouponId", ["couponId"])
    .index("byCustomerEmail", ["customerEmail"])
    .index("byCouponAndEmail", ["couponId", "customerEmail"])
    .index("byStripeSessionId", ["stripeSessionId"]),

  // Documents table for storing student/preceptor documents
  documents: defineTable({
    name: v.string(),
    documentType: v.union(
      v.literal("Agreement"),
      v.literal("Template"),
      v.literal("Hours Log"),
      v.literal("Credential"),
      v.literal("Evaluation"),
      v.literal("Other")
    ),
    fileUrl: v.string(),
    fileSize: v.number(), // Size in bytes
    fileType: v.string(), // pdf, docx, xlsx, etc
    ownerId: v.id("users"), // User who uploaded
    preceptorId: v.optional(v.id("users")), // Associated preceptor
    studentId: v.optional(v.id("users")), // Associated student
    studentName: v.optional(v.string()),
    uploadDate: v.number(),
    createdAt: v.number(),
  }).index("byOwnerId", ["ownerId"])
    .index("byStudentId", ["studentId"])
    .index("byPreceptorId", ["preceptorId"])
    .index("byDocumentType", ["documentType"]),

  // Evaluations table for student performance evaluations
  evaluations: defineTable({
    preceptorId: v.id("users"),
    studentId: v.id("users"),
    studentProgram: v.string(), // FNP, AGACNP, etc
    evaluationType: v.union(
      v.literal("Initial Assessment"),
      v.literal("Mid-Rotation"),
      v.literal("Final Evaluation"),
      v.literal("Weekly Check-in")
    ),
    dateCreated: v.optional(v.string()),
    dateDue: v.string(),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("overdue")),
    overallScore: v.optional(v.number()), // Score out of 5
    feedback: v.optional(v.string()),
    strengths: v.optional(v.array(v.string())),
    areasForImprovement: v.optional(v.array(v.string())),
    rotationSpecialty: v.string(),
    rotationWeek: v.number(),
    rotationTotalWeeks: v.number(),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("byPreceptorId", ["preceptorId"])
    .index("byStudentId", ["studentId"])
    .index("byStatus", ["status"])
    .index("byEvaluationType", ["evaluationType"]),
  });