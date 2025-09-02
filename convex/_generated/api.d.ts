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
import type * as adminSetup from "../adminSetup.js";
import type * as aiMatching from "../aiMatching.js";
import type * as auth from "../auth.js";
import type * as clinicalHours from "../clinicalHours.js";
import type * as emails from "../emails.js";
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
import type * as preceptors from "../preceptors.js";
import type * as scheduledTasks from "../scheduledTasks.js";
import type * as schools from "../schools.js";
import type * as sms from "../sms.js";
import type * as students from "../students.js";
import type * as surveys from "../surveys.js";
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
  adminSetup: typeof adminSetup;
  aiMatching: typeof aiMatching;
  auth: typeof auth;
  clinicalHours: typeof clinicalHours;
  emails: typeof emails;
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
  preceptors: typeof preceptors;
  scheduledTasks: typeof scheduledTasks;
  schools: typeof schools;
  sms: typeof sms;
  students: typeof students;
  surveys: typeof surveys;
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
