import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Get all documents for the current user (preceptor or student)
export const getAllDocuments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", q => q.eq("externalId", identity.subject))
      .first();
    
    if (!user) return [];

    // Get documents where user is either the owner or associated with
    const documents = await ctx.db
      .query("documents")
      .filter(q => 
        q.or(
          q.eq(q.field("ownerId"), user._id),
          q.eq(q.field("studentId"), user._id),
          q.eq(q.field("preceptorId"), user._id)
        )
      )
      .order("desc")
      .collect();

    return documents;
  }
});

// Get documents by type
export const getDocumentsByType = query({
  args: { 
    documentType: v.union(
      v.literal("Agreement"),
      v.literal("Template"),
      v.literal("Hours Log"),
      v.literal("Credential"),
      v.literal("Evaluation"),
      v.literal("Other")
    )
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", q => q.eq("externalId", identity.subject))
      .first();
    
    if (!user) return [];

    const documents = await ctx.db
      .query("documents")
      .filter(q => 
        q.and(
          q.eq(q.field("documentType"), args.documentType),
          q.or(
            q.eq(q.field("ownerId"), user._id),
            q.eq(q.field("studentId"), user._id),
            q.eq(q.field("preceptorId"), user._id)
          )
        )
      )
      .order("desc")
      .collect();

    return documents;
  }
});

// Upload a new document
export const uploadDocument = mutation({
  args: {
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
    fileSize: v.number(),
    fileType: v.string(),
    studentId: v.optional(v.id("users")),
    studentName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", q => q.eq("externalId", identity.subject))
      .first();
    
    if (!user) throw new Error("User not found");

    const document = await ctx.db.insert("documents", {
      name: args.name,
      documentType: args.documentType,
      fileUrl: args.fileUrl,
      fileSize: args.fileSize,
      fileType: args.fileType,
      ownerId: user._id,
      preceptorId: user.userType === "preceptor" ? user._id : undefined,
      studentId: args.studentId,
      studentName: args.studentName,
      uploadDate: Date.now(),
      createdAt: Date.now(),
    });

    return document;
  }
});

// Delete a document
export const deleteDocument = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", q => q.eq("externalId", identity.subject))
      .first();
    
    if (!user) throw new Error("User not found");

    const document = await ctx.db.get(args.documentId);
    if (!document) throw new Error("Document not found");

    // Only owner can delete
    if (document.ownerId !== user._id) {
      throw new Error("Unauthorized to delete this document");
    }

    await ctx.db.delete(args.documentId);
    return { success: true };
  }
});

// Get document stats for dashboard
export const getDocumentStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", q => q.eq("externalId", identity.subject))
      .first();
    
    if (!user) return null;

    const documents = await ctx.db
      .query("documents")
      .filter(q => 
        q.or(
          q.eq(q.field("ownerId"), user._id),
          q.eq(q.field("studentId"), user._id),
          q.eq(q.field("preceptorId"), user._id)
        )
      )
      .collect();

    const totalDocuments = documents.length;
    const studentDocuments = documents.filter(d => d.studentId).length;
    const templates = documents.filter(d => d.documentType === "Template").length;
    const totalSize = documents.reduce((acc, doc) => acc + (doc.fileSize || 0), 0);

    return {
      totalDocuments,
      studentDocuments,
      templates,
      totalSize,
      storageLimit: 1024 * 1024 * 1024 // 1GB in bytes
    };
  }
});