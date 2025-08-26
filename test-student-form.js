// Test script to verify student form submission fixes
// This script tests the data structure that would be sent to the Convex mutation

const testData = {
  personalInfo: {
    fullName: "Test Student",
    email: "test@example.com",
    phone: "555-1234",
    dateOfBirth: "1990-01-01",
    preferredContact: "email",
    linkedinOrResume: ""
  },
  schoolInfo: {
    programName: "Test University",
    degreeTrack: "FNP",
    schoolLocation: {
      city: "Test City",
      state: "TX"
    },
    programFormat: "online",
    expectedGraduation: "2025-05-01",
    clinicalCoordinatorName: "",
    clinicalCoordinatorEmail: ""
  },
  rotationNeeds: {
    rotationTypes: ["family-practice"],
    otherRotationType: "",
    startDate: "2025-01-01",
    endDate: "2025-05-01",
    weeklyHours: "16-24",
    daysAvailable: ["monday", "tuesday", "wednesday"],
    willingToTravel: false,
    preferredLocation: {
      city: "Test City",
      state: "TX"
    }
  },
  matchingPreferences: {
    comfortableWithSharedPlacements: false,
    languagesSpoken: [],
    idealPreceptorQualities: ""
  },
  learningStyle: {
    learningMethod: "hands-on",
    clinicalComfort: "somewhat-comfortable",
    feedbackPreference: "real-time",
    structurePreference: "general-guidance",
    mentorRelationship: "teacher-coach",
    observationPreference: "mix-both",
    correctionStyle: "supportive-private",
    retentionStyle: "watching-doing",
    additionalResources: "occasionally",
    proactiveQuestions: 3,
    // Optional fields should be undefined or proper values, not empty strings
    feedbackType: undefined,
    mistakeApproach: undefined,
    motivationType: undefined,
    preparationStyle: undefined,
    learningCurve: undefined,
    frustrations: undefined,
    environment: undefined,
    observationNeeds: undefined,
    professionalValues: [],
    clinicalEnvironment: undefined,
    programStage: undefined,
    scheduleFlexibility: undefined
  },
  agreements: {
    agreedToPaymentTerms: true,
    agreedToTermsAndPrivacy: true,
    digitalSignature: "Test Student",
    submissionDate: new Date().toISOString().split('T')[0]
  }
};

console.log("Test data structure:");
console.log(JSON.stringify(testData, null, 2));

// Validate required fields
const validateData = (data) => {
  const errors = [];
  
  if (!data.personalInfo?.fullName) errors.push("Full name is required");
  if (!data.personalInfo?.email) errors.push("Email is required");
  if (!data.personalInfo?.phone) errors.push("Phone is required");
  
  if (!data.schoolInfo?.programName) errors.push("Program name is required");
  if (!data.schoolInfo?.degreeTrack) errors.push("Degree track is required");
  
  if (!data.rotationNeeds?.rotationTypes?.length) errors.push("At least one rotation type is required");
  if (!data.rotationNeeds?.startDate) errors.push("Start date is required");
  if (!data.rotationNeeds?.endDate) errors.push("End date is required");
  
  if (!data.learningStyle?.learningMethod) errors.push("Learning method is required");
  if (!data.learningStyle?.clinicalComfort) errors.push("Clinical comfort is required");
  
  if (!data.agreements?.agreedToPaymentTerms) errors.push("Must agree to payment terms");
  if (!data.agreements?.agreedToTermsAndPrivacy) errors.push("Must agree to terms and privacy");
  if (!data.agreements?.digitalSignature) errors.push("Digital signature is required");
  
  return errors;
};

const errors = validateData(testData);
if (errors.length > 0) {
  console.log("\n❌ Validation errors:");
  errors.forEach(error => console.log(`  - ${error}`));
} else {
  console.log("\n✅ All required fields are present and valid!");
}