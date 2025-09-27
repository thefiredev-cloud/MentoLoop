/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as adminCleanup from "../adminCleanup.js";
import type * as adminCleanupFinal from "../adminCleanupFinal.js";
import type * as adminRoleManager from "../adminRoleManager.js";
import type * as adminSetup from "../adminSetup.js";
import type * as aiMatching from "../aiMatching.js";
import type * as auth from "../auth.js";
import type * as billing from "../billing.js";
import type * as ceuCourses from "../ceuCourses.js";
import type * as chatbot from "../chatbot.js";
import type * as clinicalHours from "../clinicalHours.js";
import type * as constants_planCatalog from "../constants/planCatalog.js";
import type * as documents from "../documents.js";
import type * as emails from "../emails.js";
import type * as enterpriseManagement from "../enterpriseManagement.js";
import type * as enterprises from "../enterprises.js";
import type * as evaluations from "../evaluations.js";
import type * as fixSupportUser from "../fixSupportUser.js";
import type * as gpt5 from "../gpt5.js";
import type * as http from "../http.js";
import type * as init from "../init.js";
import type * as intakePayments from "../intakePayments.js";
import type * as matchHelpers from "../matchHelpers.js";
import type * as matches from "../matches.js";
import type * as mentorfit from "../mentorfit.js";
import type * as messages from "../messages.js";
import type * as paymentAttemptTypes from "../paymentAttemptTypes.js";
import type * as paymentAttempts from "../paymentAttempts.js";
import type * as payments from "../payments.js";
import type * as paymentsNode from "../paymentsNode.js";
import type * as platformStats from "../platformStats.js";
import type * as preceptors from "../preceptors.js";
import type * as scheduledTasks from "../scheduledTasks.js";
import type * as schools from "../schools.js";
import type * as seedData from "../seedData.js";
import type * as services_matches_MatchAnalyticsManager from "../services/matches/MatchAnalyticsManager.js";
import type * as services_matches_MatchScoringManager from "../services/matches/MatchScoringManager.js";
import type * as services_matches_MatchSelectionManager from "../services/matches/MatchSelectionManager.js";
import type * as services_messages_MessageSendManager from "../services/messages/MessageSendManager.js";
import type * as services_payments_ConfirmCheckoutSessionManager from "../services/payments/ConfirmCheckoutSessionManager.js";
import type * as services_payments_IdempotencyKeyManager from "../services/payments/IdempotencyKeyManager.js";
import type * as services_payments_PaymentCheckoutManager from "../services/payments/PaymentCheckoutManager.js";
import type * as services_payments_PaymentCustomerManager from "../services/payments/PaymentCustomerManager.js";
import type * as services_payments_PaymentIntentManager from "../services/payments/PaymentIntentManager.js";
import type * as services_payments_PaymentInvoiceManager from "../services/payments/PaymentInvoiceManager.js";
import type * as services_payments_PaymentPortalManager from "../services/payments/PaymentPortalManager.js";
import type * as services_payments_PaymentRefundManager from "../services/payments/PaymentRefundManager.js";
import type * as services_payments_PaymentSessionResolver from "../services/payments/PaymentSessionResolver.js";
import type * as services_payments_PaymentSubscriptionManager from "../services/payments/PaymentSubscriptionManager.js";
import type * as services_payments_PaymentWebhookService from "../services/payments/PaymentWebhookService.js";
import type * as sms from "../sms.js";
import type * as stripeEvents from "../stripeEvents.js";
import type * as students from "../students.js";
import type * as surveys from "../surveys.js";
import type * as testimonials from "../testimonials.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminCleanup: typeof adminCleanup;
  adminCleanupFinal: typeof adminCleanupFinal;
  adminRoleManager: typeof adminRoleManager;
  adminSetup: typeof adminSetup;
  aiMatching: typeof aiMatching;
  auth: typeof auth;
  billing: typeof billing;
  ceuCourses: typeof ceuCourses;
  chatbot: typeof chatbot;
  clinicalHours: typeof clinicalHours;
  "constants/planCatalog": typeof constants_planCatalog;
  documents: typeof documents;
  emails: typeof emails;
  enterpriseManagement: typeof enterpriseManagement;
  enterprises: typeof enterprises;
  evaluations: typeof evaluations;
  fixSupportUser: typeof fixSupportUser;
  gpt5: typeof gpt5;
  http: typeof http;
  init: typeof init;
  intakePayments: typeof intakePayments;
  matchHelpers: typeof matchHelpers;
  matches: typeof matches;
  mentorfit: typeof mentorfit;
  messages: typeof messages;
  paymentAttemptTypes: typeof paymentAttemptTypes;
  paymentAttempts: typeof paymentAttempts;
  payments: typeof payments;
  paymentsNode: typeof paymentsNode;
  platformStats: typeof platformStats;
  preceptors: typeof preceptors;
  scheduledTasks: typeof scheduledTasks;
  schools: typeof schools;
  seedData: typeof seedData;
  "services/matches/MatchAnalyticsManager": typeof services_matches_MatchAnalyticsManager;
  "services/matches/MatchScoringManager": typeof services_matches_MatchScoringManager;
  "services/matches/MatchSelectionManager": typeof services_matches_MatchSelectionManager;
  "services/messages/MessageSendManager": typeof services_messages_MessageSendManager;
  "services/payments/ConfirmCheckoutSessionManager": typeof services_payments_ConfirmCheckoutSessionManager;
  "services/payments/IdempotencyKeyManager": typeof services_payments_IdempotencyKeyManager;
  "services/payments/PaymentCheckoutManager": typeof services_payments_PaymentCheckoutManager;
  "services/payments/PaymentCustomerManager": typeof services_payments_PaymentCustomerManager;
  "services/payments/PaymentIntentManager": typeof services_payments_PaymentIntentManager;
  "services/payments/PaymentInvoiceManager": typeof services_payments_PaymentInvoiceManager;
  "services/payments/PaymentPortalManager": typeof services_payments_PaymentPortalManager;
  "services/payments/PaymentRefundManager": typeof services_payments_PaymentRefundManager;
  "services/payments/PaymentSessionResolver": typeof services_payments_PaymentSessionResolver;
  "services/payments/PaymentSubscriptionManager": typeof services_payments_PaymentSubscriptionManager;
  "services/payments/PaymentWebhookService": typeof services_payments_PaymentWebhookService;
  sms: typeof sms;
  stripeEvents: typeof stripeEvents;
  students: typeof students;
  surveys: typeof surveys;
  testimonials: typeof testimonials;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
