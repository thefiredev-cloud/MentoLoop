import { useConvex, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

export interface PaymentStatus {
  hasPayment: boolean;
  membershipPlan: string | null;
  paidAt: number | null;
  loading: boolean;
}

/**
 * Hook to check if current user has completed payment for intake form access
 * This is used to protect comprehensive intake forms from being copied/stolen
 */
export function usePaymentProtection(): PaymentStatus {
  const { user, isLoaded } = useUser();
  const convex = useConvex();
  
  // Query payment status using user's email with error handling
  const paymentStatus = useQuery(
    api.payments.checkUserPaymentStatus,
    user?.emailAddresses?.[0]?.emailAddress 
      ? { userEmail: user.emailAddresses[0].emailAddress }
      : "skip"
  );

  if (!isLoaded || !user) {
    return {
      hasPayment: false,
      membershipPlan: null,
      paidAt: null,
      loading: true,
    };
  }

  // Handle query loading state
  if (paymentStatus === undefined) {
    return {
      hasPayment: false,
      membershipPlan: null,
      paidAt: null,
      loading: true,
    };
  }

  // Handle query error - fail safely by denying access
  if (paymentStatus instanceof Error) {
    console.error("Payment verification error:", paymentStatus);
    return {
      hasPayment: false,
      membershipPlan: null,
      paidAt: null,
      loading: false,
    };
  }

  // Handle null response - no payment found
  if (!paymentStatus) {
    return {
      hasPayment: false,
      membershipPlan: null,
      paidAt: null,
      loading: false,
    };
  }

  return {
    hasPayment: paymentStatus.hasPayment,
    membershipPlan: paymentStatus.membershipPlan,
    paidAt: paymentStatus.paidAt,
    loading: false,
  };
}

/**
 * Check if user can access comprehensive intake forms
 */
export function canAccessComprehensiveIntake(paymentStatus: PaymentStatus): boolean {
  return paymentStatus.hasPayment && !paymentStatus.loading;
}

/**
 * Get the required membership tier for specific form sections
 */
export function getRequiredMembershipForSection(section: string): string[] {
  switch (section) {
    case 'personal-info':
      return ['core', 'pro', 'premium'];
    case 'school-info':
      return ['core', 'pro', 'premium'];
    case 'rotation-needs':
      return ['pro', 'premium'];
    case 'matching-preferences':
      return ['pro', 'premium'];
    case 'learning-style':
      return ['premium'];
    case 'agreements':
      return ['core', 'pro', 'premium'];
    default:
      return ['premium'];
  }
}

/**
 * Check if user's membership plan allows access to specific form section
 */
export function canAccessFormSection(
  paymentStatus: PaymentStatus, 
  section: string
): boolean {
  if (!paymentStatus.hasPayment || paymentStatus.loading) {
    return false;
  }

  const requiredTiers = getRequiredMembershipForSection(section);
  const userTier = paymentStatus.membershipPlan;
  
  return userTier ? requiredTiers.includes(userTier) : false;
}

/**
 * Get preview text for locked form sections
 */
export function getLockedSectionPreview(section: string): string {
  switch (section) {
    case 'personal-info':
      return 'Complete personal details, contact preferences, and professional links';
    case 'school-info':
      return 'Detailed school information, program details, and coordinator contacts';
    case 'rotation-needs':
      return 'Specific rotation types, scheduling preferences, and availability';
    case 'matching-preferences':
      return 'Advanced matching criteria and preceptor preferences';
    case 'learning-style':
      return 'Comprehensive learning style assessment for optimal matching';
    case 'mentoring-style':
      return 'Detailed mentoring approach and teaching style preferences';
    default:
      return 'Premium content available after payment';
  }
}

/**
 * Get the membership tier required message
 */
export function getMembershipRequiredMessage(section: string): string {
  const requiredTiers = getRequiredMembershipForSection(section);
  
  if (requiredTiers.includes('core')) {
    return 'Complete payment to access this section';
  } else if (requiredTiers.includes('pro')) {
    return 'Pro or Premium membership required for this section';
  } else {
    return 'Premium membership required for this advanced section';
  }
}