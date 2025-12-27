import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        authUserId: v.string(),          // From Better Auth
        name: v.string(),
        email: v.string(),

        role: v.union(
            v.literal("user"),             // Can report issues
            v.literal("technician"),       // Can work on requests
            v.literal("manager")           // Can manage system
        ),

        teamId: v.optional(v.id("teams")),
        avatarUrl: v.optional(v.string()),
    })
        .index("by_authUserId", ["authUserId"])
        .index("by_email", ["email"])
        .index("by_role", ["role"])
        .index("by_team", ["teamId"]),
    teams: defineTable({
        name: v.string(),                // IT Support, Mechanics, etc
        description: v.optional(v.string()),

        createdAt: v.number(),
    }),
    equipmentCategories: defineTable({
        name: v.string(),                  // Computers, Software, etc
        responsibleUserId: v.optional(v.id("users")), // Optional default owner
        company: v.string(),

        createdAt: v.number(),
    })
        .index("by_name", ["name"]),
    equipment: defineTable({
        name: v.string(),                  // Samsung Monitor 15"
        categoryId: v.id("equipmentCategories"),

        company: v.string(),               // My Company (San Francisco)
        department: v.string(),

        serialNumber: v.optional(v.string()),

        usedByEmployee: v.optional(v.string()), // Abigail Peterson
        usedInLocation: v.optional(v.string()), // Office / Floor / Lab

        technicianId: v.optional(v.id("users")), // Default technician
        maintenanceTeamId: v.id("teams"),

        assignedDate: v.optional(v.number()),
        description: v.optional(v.string()),

        isScrapped: v.boolean(),

        createdAt: v.number(),
    })
        .index("by_category", ["categoryId"])
        .index("by_team", ["maintenanceTeamId"])
        .index("by_company", ["company"]),
    maintenanceRequests: defineTable({
        subject: v.string(),

        type: v.union(
            v.literal("corrective"),       // Breakdown
            v.literal("preventive")        // Routine check
        ),

        priority: v.optional(v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high"),
            v.literal("critical")
        )),

        equipmentId: v.id("equipment"),
        teamId: v.id("teams"),           // Auto-filled from equipment

        status: v.union(
            v.literal("new"),
            v.literal("in_progress"),
            v.literal("repaired"),
            v.literal("scrap")
        ),

        assignedTo: v.optional(v.id("users")),

        scheduledDate: v.optional(v.number()), // Preventive
        durationHours: v.optional(v.number()), // Completion time

        createdBy: v.id("users"),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_status", ["status"])
        .index("by_team", ["teamId"])
        .index("by_equipment", ["equipmentId"])
        .index("by_assignee", ["assignedTo"])
        .index("by_scheduledDate", ["scheduledDate"]),
    notifications: defineTable({
        userId: v.id("users"),
        type: v.string(), // REQUEST_CREATED, REQUEST_ASSIGNED, REQUEST_STATUS_CHANGED, etc.
        title: v.string(),
        message: v.string(),

        entityType: v.optional(v.string()), // "request", "equipment"
        entityId: v.optional(v.string()),

        read: v.boolean(),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_user_unread", ["userId", "read"]),
});
