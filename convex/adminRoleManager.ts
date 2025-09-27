import { mutation } from "./_generated/server";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

const MAX_ASSIGNMENTS = 20;

type Role = "admin" | "student" | "preceptor" | "enterprise";

interface AssignmentResult {
  email: string;
  role: Role;
  status: "updated" | "unchanged" | "not_found";
  userId?: Doc<"users">["_id"];
}

const ADMIN_PERMISSION: Doc<"users">["permissions"] = ["full_admin_access"];

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const shouldRemovePermissions = (role: Role) => role !== "admin";

const hasAdminPermissions = (user: Doc<"users">) =>
  user.permissions?.includes("full_admin_access") ?? false;

export const assignRolesByEmail = mutation({
  args: {
    secret: v.string(),
    assignments: v.array(
      v.object({
        email: v.string(),
        role: v.union(
          v.literal("admin"),
          v.literal("student"),
          v.literal("preceptor"),
          v.literal("enterprise"),
        ),
      }),
    ),
  },
  handler: async (ctx, { secret, assignments }) => {
    if (assignments.length === 0) {
      return { updatedCount: 0, results: [] as AssignmentResult[] };
    }

    if (assignments.length > MAX_ASSIGNMENTS) {
      throw new Error(`Too many assignments requested (max ${MAX_ASSIGNMENTS}).`);
    }

    const expectedSecret =
      process.env.ROLE_ASSIGN_SECRET ??
      process.env.CONVEX_ADMIN_KEY ??
      process.env.CONVEX_ACCESS_KEY ??
      "";

    if (!expectedSecret) {
      throw new Error("Role assignment secret is not configured on the server.");
    }

    if (secret !== expectedSecret) {
      throw new Error("Unauthorized role assignment attempt.");
    }

    const results: AssignmentResult[] = [];
    let updatedCount = 0;

    for (const assignment of assignments) {
      const email = normalizeEmail(assignment.email);

      if (!email) {
        results.push({
          email: assignment.email,
          role: assignment.role,
          status: "not_found",
        });
        continue;
      }

      const user = await ctx.runQuery(internal.users.getUserByEmail, {
        email,
      });

      if (!user) {
        results.push({
          email,
          role: assignment.role,
          status: "not_found",
        });
        continue;
      }

      const role = assignment.role;
      const desiredPermissions = role === "admin" ? ADMIN_PERMISSION : undefined;

      const alreadyCorrectRole = user.userType === role;
      const alreadyCorrectPermissions = role === "admin"
        ? hasAdminPermissions(user)
        : !(user.permissions?.length);

      if (alreadyCorrectRole && alreadyCorrectPermissions) {
        results.push({
          email,
          role,
          status: "unchanged",
          userId: user._id,
        });
        continue;
      }

      const update: Partial<Doc<"users">> = { userType: role };

      if (role === "admin") {
        update.permissions = ADMIN_PERMISSION;
      } else if (shouldRemovePermissions(role) && user.permissions) {
        update.permissions = undefined;
      }

      await ctx.db.patch(user._id, update);

      updatedCount += 1;
      results.push({
        email,
        role,
        status: "updated",
        userId: user._id,
      });
    }

    return { updatedCount, results };
  },
});

