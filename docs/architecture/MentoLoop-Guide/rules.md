# MentoLoop Development Rules & Guidelines

## Project Overview
MentoLoop is a Next.js 15 SaaS platform connecting NP students with verified preceptors through AI-powered matching with human oversight.

## Core Brand Values
- **Compassion** - We prioritize student safety and preceptor support
- **Efficiency** - Streamlined processes without administrative burden
- **Trust** - HIPAA-compliant, FERPA-aware, and transparent
- **Community** - Building sustainable mentor-student ecosystems

## Content & Copywriting Rules

### Landing Page Requirements
- Remove all emojis from production copy
- Use clear, professional language
- Maintain the tagline: "Match. Mentor. Master."
- Emphasize human oversight alongside AI matching
- Quote: "This isn't about filling spots. It's about fixing the pipeline."

### Required Sections
1. **Why MentoLoop?** - Positioning as dedicated partner
2. **Verified Preceptors** - Highlight vetting process
3. **AI-Powered Matching, Human-Reviewed** - Emphasize dual approach
4. **Mentorship Loop** - Community sustainability message
5. **Seamless Paperwork** - Full-service support
6. **Built for Trust** - Created by NPs for NPs
7. **Who It's For** - Students, Preceptors, Schools & Clinics

## Data Collection & Form Requirements

### Student Intake Form - 5 Sections
1. **Personal Info** (7 fields)
   - Full Name, Email, Phone, DOB (all required)
   - Preferred Contact Method (dropdown: Email/Phone/Text)
   - LinkedIn/Resume (optional)

2. **School Information** (7 fields)
   - NP Program Name (dropdown from master list)
   - Degree Track (dropdown: FNP/PNP/PMHNP/AGNP/ACNP/WHNP/NNP/DNP)
   - School Location, Program Format, Expected Graduation Date
   - Clinical Coordinator info (optional)

3. **Rotation Needs** (7 fields)
   - Type(s) of Rotation (multi-select with "Other" text option)
   - Start/End Dates, Weekly Hours, Days Available
   - Travel willingness and preferred location

4. **Matching Preferences** (3 fields)
   - Shared placement comfort, Languages, Ideal qualities

5. **Payment & Agreement** (4 fields)
   - Payment terms agreement, Terms & Privacy consent
   - Digital signature, Auto-filled date

### Preceptor Intake Form - 5 Sections
1. **Personal & Contact Info** (7 fields)
   - Basic info, License Type, Specialty, State(s) Licensed
   - NPI Number (10-digit validation), Optional CV/LinkedIn

2. **Practice Information** (6 fields)
   - Practice details, setting, location, EMR system

3. **Precepting Availability** (6 fields)
   - Current acceptance status, available rotations
   - Student capacity, rotation duration, scheduling

4. **Matching Preferences** (4 fields)
   - Student level preference, first-rotation comfort
   - Previous schools, languages

5. **Agreements & Follow-Up** (4 fields)
   - Screening willingness, spotlight participation
   - Terms consent, digital signature

## MentorFit™ Algorithm Requirements

### Student Learning Style Questions (18 questions)
- Learning preferences (hands-on, step-by-step, independent)
- Clinical independence comfort level
- Feedback frequency preferences
- Structure and mentor relationship preferences
- Information retention methods

### Preceptor Mentoring Style Questions (18 questions)
- Mentoring approach and feedback delivery
- Student guidance methodology
- Resource provision and evaluation frequency
- Teaching environment and autonomy levels

### Compatibility Scoring System
- **Scoring Scale**: 0-10 points
- **Tier Display**:
  - 8-10: ✅ High Fit (GOLD)
  - 5-7: ⚖️ Moderate Fit (SILVER)
  - 0-4: ⚠️ Low Fit (BRONZE)

### Human Oversight Requirements
- Admin override capabilities for all matches
- Color-coded alerts for low MentorFit™ scores
- Manual match tracking and transparency
- Override justification logging

## Technical Requirements

### Environment Variables
- Convex deployment and Clerk authentication keys
- SendGrid email automation (default: noreply@mentoloop.com)
- Twilio SMS notifications
- App URL for survey links

### Database Storage
- Use Airtable or Webflow CMS for form responses
- Required field validation and NPI format checking
- Match status tracking and admin notifications

### Matching Logic Priority
**Top Priority:**
- Specialty alignment
- Rotation date overlap
- Preceptor availability
- Location/telehealth compatibility
- MentorFit™ compatibility score

**Secondary Priority:**
- Language compatibility
- Previous precepting experience

## Communication Templates

### SMS Messages (160 characters max)
- Welcome messages for students and preceptors
- Match confirmation notifications
- Payment received confirmations
- Rotation completion surveys

### Email Templates
- Welcome sequences with platform orientation
- Match confirmation with payment links
- Payment confirmation and next steps
- Post-rotation feedback surveys

## Payment & Billing Rules

### Membership Tiers
- **Core Block**: 60 hours → $695
- **Pro Block**: 120 hours → $1,295 
- **Premium Block**: 180 hours → $1,895

### Refund Policy
- Preceptor cancels: 100% refund anytime
- Student cancels >21 days: 100% refund minus $50 fee
- Student cancels 7-21 days: 50% refund
- Student cancels <7 days/no-show: No refund

## Legal & Compliance Requirements

### Required Agreement Text
**Student Agreement:** 6-point liability release including third-party platform disclaimer, preceptor verification responsibility, and fee structure acknowledgment.

**Preceptor Agreement:** 7-point participation agreement including voluntary participation, safe environment provision, and liability release.

### Privacy & Security
- HIPAA compliance standards
- FERPA awareness in all processes
- Secure data encryption and storage
- User data control and deletion rights

## Post-Rotation Survey Requirements

### Student → Preceptor Survey (5 scored questions + comments)
- Teaching style match assessment
- Communication effectiveness
- Clinical case mix alignment
- Support for competencies
- Recommendation likelihood

### Preceptor → Student Survey (5 scored questions + comments)
- Student preparedness evaluation
- Communication and feedback-seeking
- Receptiveness to mentorship
- Clinical competence growth
- Willingness to host again

## Development Standards
- Follow existing Next.js 15 + Convex + Clerk architecture
- Maintain TypeScript throughout
- Use TailwindCSS v4 styling
- Implement real-time data sync via Convex
- Ensure mobile responsiveness for all forms
- Include comprehensive error handling and validation

## Content Guidelines
- Maintain professional, supportive tone
- Emphasize safety and quality assurance
- Highlight human oversight in AI processes
- Use inclusive language for all healthcare professionals
- Keep messaging focused on educational outcomes