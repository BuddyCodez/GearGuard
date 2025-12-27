import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { authComponent } from "./auth";
import { internal } from "./_generated/api";

/**
 * List maintenance requests created by the current user
 * Used by normal users to see their own requests
 */
export const listMyRequests = query({
    args: {},
    handler: async (ctx) => {
        const viewerAuth = await authComponent.getAuthUser(ctx);
        if (!viewerAuth) {
            throw new Error("Unauthorized");
        }

        const viewer = await ctx.db
            .query("users")
            .withIndex("by_authUserId", (q) => q.eq("authUserId", viewerAuth._id as string))
            .first();

        if (!viewer) {
            throw new Error("User not found");
        }

        // Get all requests created by this user
        const requests = await ctx.db
            .query("maintenanceRequests")
            .collect();

        // Filter by creator and enrich with equipment data
        const myRequests = await Promise.all(
            requests
                .filter((req) => req.createdBy === viewer._id)
                .map(async (req) => {
                    const equipment = await ctx.db.get(req.equipmentId);
                    const assignedTech = req.assignedTo
                        ? await ctx.db.get(req.assignedTo)
                        : null;

                    return {
                        ...req,
                        equipment: equipment
                            ? {
                                _id: equipment._id,
                                name: equipment.name,
                            }
                            : null,
                        assignedTechnician: assignedTech
                            ? {
                                _id: assignedTech._id,
                                name: assignedTech.name,
                                email: assignedTech.email,
                            }
                            : null,
                    };
                })
        );

        return myRequests.sort((a, b) => b.createdAt - a.createdAt);
    },
});

/**
 * List all maintenance requests
 * Used by managers and technicians
 */
export const listAllRequests = query({
    args: {},
    handler: async (ctx) => {
        const viewerAuth = await authComponent.getAuthUser(ctx);
        if (!viewerAuth) {
            throw new Error("Unauthorized");
        }

        const viewer = await ctx.db
            .query("users")
            .withIndex("by_authUserId", (q) => q.eq("authUserId", viewerAuth._id as string))
            .first();

        if (!viewer || viewer.role === "user") {
            throw new Error("Unauthorized: Insufficient permissions");
        }

        const requests = await ctx.db.query("maintenanceRequests").collect();

        const enrichedRequests = await Promise.all(
            requests.map(async (req) => {
                const equipment = await ctx.db.get(req.equipmentId);
                const assignedTech = req.assignedTo
                    ? await ctx.db.get(req.assignedTo)
                    : null;
                const creator = await ctx.db.get(req.createdBy);

                return {
                    ...req,
                    equipment: equipment
                        ? {
                            _id: equipment._id,
                            name: equipment.name,
                        }
                        : null,
                    assignedTechnician: assignedTech
                        ? {
                            _id: assignedTech._id,
                            name: assignedTech.name,
                            email: assignedTech.email,
                        }
                        : null,
                    creator: creator
                        ? {
                            _id: creator._id,
                            name: creator.name,
                            email: creator.email,
                        }
                        : null,
                };
            })
        );

        return enrichedRequests.sort((a, b) => b.createdAt - a.createdAt);
    },
});

/**
 * Get detailed information about a single request
 */
export const getRequestDetails = query({
    args: {
        requestId: v.id("maintenanceRequests"),
    },
    handler: async (ctx, args) => {
        const viewerAuth = await authComponent.getAuthUser(ctx);
        if (!viewerAuth) {
            throw new Error("Unauthorized");
        }

        const viewer = await ctx.db
            .query("users")
            .withIndex("by_authUserId", (q) => q.eq("authUserId", viewerAuth._id as string))
            .first();

        if (!viewer) {
            throw new Error("User not found");
        }

        const request = await ctx.db.get(args.requestId);
        if (!request) {
            throw new Error("Request not found");
        }

        // Normal users can only view their own requests
        if (viewer.role === "user" && request.createdBy !== viewer._id) {
            throw new Error("Unauthorized: You can only view your own requests");
        }

        const equipment = await ctx.db.get(request.equipmentId);
        const team = await ctx.db.get(request.teamId);
        const assignedTech = request.assignedTo
            ? await ctx.db.get(request.assignedTo)
            : null;
        const creator = await ctx.db.get(request.createdBy);

        return {
            ...request,
            equipment: equipment
                ? {
                    _id: equipment._id,
                    name: equipment.name,
                    serialNumber: equipment.serialNumber,
                    department: equipment.department,
                }
                : null,
            team: team
                ? {
                    _id: team._id,
                    name: team.name,
                }
                : null,
            assignedTechnician: assignedTech
                ? {
                    _id: assignedTech._id,
                    name: assignedTech.name,
                    email: assignedTech.email,
                }
                : null,
            creator: creator
                ? {
                    _id: creator._id,
                    name: creator.name,
                    email: creator.email,
                }
                : null,
        };
    },
});

/**
 * Create a new maintenance request
 */
export const create = mutation({
    args: {
        subject: v.string(),
        equipmentId: v.id("equipment"),
        type: v.union(v.literal("corrective"), v.literal("preventive")),
        priority: v.optional(v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high"),
            v.literal("critical")
        )),
        scheduledDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const viewerAuth = await authComponent.getAuthUser(ctx);
        if (!viewerAuth) {
            throw new Error("Unauthorized");
        }

        const viewer = await ctx.db
            .query("users")
            .withIndex("by_authUserId", (q) => q.eq("authUserId", viewerAuth._id as string))
            .first();

        if (!viewer) {
            throw new Error("User not found");
        }

        // Get equipment to determine team
        const equipment = await ctx.db.get(args.equipmentId);
        if (!equipment) {
            throw new Error("Equipment not found");
        }

        // ❌ Cannot create requests on scrapped equipment
        if (equipment.isScrapped) {
            throw new Error("Cannot create maintenance request for scrapped equipment");
        }

        const now = Date.now();

        const requestId = await ctx.db.insert("maintenanceRequests", {
            subject: args.subject,
            type: args.type,
            priority: args.priority || "medium",
            equipmentId: args.equipmentId,
            teamId: equipment.maintenanceTeamId,
            status: "new",
            scheduledDate: args.scheduledDate,
            createdBy: viewer._id,
            createdAt: now,
            updatedAt: now,
        });

        // 🔔 Notify all managers about new request
        const managers = await ctx.db
            .query("users")
            .withIndex("by_role", (q) => q.eq("role", "manager"))
            .collect();

        await Promise.all(
            managers.map((manager) =>
                ctx.scheduler.runAfter(0, internal.notifications.createNotification, {
                    userId: manager._id,
                    type: "REQUEST_CREATED",
                    title: "New maintenance request",
                    message: `${args.subject} was created`,
                    entityType: "request",
                    entityId: requestId,
                })
            )
        );

        return requestId;
    },
});

/**
 * Update request status (for technicians/managers)
 */
export const updateStatus = mutation({
    args: {
        requestId: v.id("maintenanceRequests"),
        status: v.union(
            v.literal("new"),
            v.literal("in_progress"),
            v.literal("repaired"),
            v.literal("scrap")
        ),
    },
    handler: async (ctx, args) => {
        const viewerAuth = await authComponent.getAuthUser(ctx);
        if (!viewerAuth) {
            throw new Error("Unauthorized");
        }

        const viewer = await ctx.db
            .query("users")
            .withIndex("by_authUserId", (q) => q.eq("authUserId", viewerAuth._id as string))
            .first();

        if (!viewer || viewer.role === "user") {
            throw new Error("Unauthorized: Only technicians and managers can update status");
        }

        const request = await ctx.db.get(args.requestId);
        if (!request) throw new Error("Request not found");

        await ctx.db.patch(args.requestId, {
            status: args.status,
            updatedAt: Date.now(),
        });

        // 🔔 Notify requester about status change
        await ctx.scheduler.runAfter(0, internal.notifications.createNotification, {
            userId: request.createdBy,
            type: "REQUEST_STATUS_CHANGED",
            title: "Request status updated",
            message: `Your request status changed to ${args.status}`,
            entityType: "request",
            entityId: args.requestId,
        });
    },
});

/**
 * Assign request to technician (for managers)
 */
export const assignTechnician = mutation({
    args: {
        requestId: v.id("maintenanceRequests"),
        technicianId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const viewerAuth = await authComponent.getAuthUser(ctx);
        if (!viewerAuth) {
            throw new Error("Unauthorized");
        }

        const viewer = await ctx.db
            .query("users")
            .withIndex("by_authUserId", (q) => q.eq("authUserId", viewerAuth._id as string))
            .first();

        if (!viewer || (viewer.role !== "manager" && viewer.role !== "technician")) {
            throw new Error("Unauthorized: Insufficient permissions");
        }

        await ctx.db.patch(args.requestId, {
            assignedTo: args.technicianId,
            updatedAt: Date.now(),
        });

        // 🔔 Notify technician about assignment
        const request = await ctx.db.get(args.requestId);
        await ctx.scheduler.runAfter(0, internal.notifications.createNotification, {
            userId: args.technicianId,
            type: "REQUEST_ASSIGNED",
            title: "New request assigned",
            message: `You were assigned to "${request?.subject || "a request"}"`,
            entityType: "request",
            entityId: args.requestId,
        });
    },
});

/**
 * Update request details (for managers)
 */
export const updateRequest = mutation({
    args: {
        requestId: v.id("maintenanceRequests"),
        subject: v.optional(v.string()),
        equipmentId: v.optional(v.id("equipment")),
        scheduledDate: v.optional(v.number()),
        priority: v.optional(v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high"),
            v.literal("critical")
        )),
    },
    handler: async (ctx, args) => {
        const viewerAuth = await authComponent.getAuthUser(ctx);
        if (!viewerAuth) {
            throw new Error("Unauthorized");
        }

        const viewer = await ctx.db
            .query("users")
            .withIndex("by_authUserId", (q) => q.eq("authUserId", viewerAuth._id as string))
            .first();

        if (!viewer || viewer.role !== "manager") {
            throw new Error("Unauthorized: Only managers can edit request details");
        }

        const updates: any = {
            updatedAt: Date.now(),
        };

        if (args.subject !== undefined) updates.subject = args.subject;
        if (args.scheduledDate !== undefined) updates.scheduledDate = args.scheduledDate;
        if (args.priority !== undefined) updates.priority = args.priority;

        // If equipment changes, update team assignment
        if (args.equipmentId !== undefined) {
            const equipment = await ctx.db.get(args.equipmentId);
            if (!equipment) {
                throw new Error("Equipment not found");
            }
            updates.equipmentId = args.equipmentId;
            updates.teamId = equipment.maintenanceTeamId;
        }

        await ctx.db.patch(args.requestId, updates);
    },
});

/**
 * Scrap equipment and update request (for managers)
 */
export const scrapEquipment = mutation({
    args: {
        requestId: v.id("maintenanceRequests"),
    },
    handler: async (ctx, args) => {
        const viewerAuth = await authComponent.getAuthUser(ctx);
        if (!viewerAuth) {
            throw new Error("Unauthorized");
        }

        const viewer = await ctx.db
            .query("users")
            .withIndex("by_authUserId", (q) => q.eq("authUserId", viewerAuth._id as string))
            .first();

        if (!viewer || viewer.role !== "manager") {
            throw new Error("Unauthorized: Only managers can scrap equipment");
        }

        const request = await ctx.db.get(args.requestId);
        if (!request) {
            throw new Error("Request not found");
        }

        // Update request status to scrap
        await ctx.db.patch(args.requestId, {
            status: "scrap",
            updatedAt: Date.now(),
        });

        // Mark equipment as scrapped
        await ctx.db.patch(request.equipmentId, {
            isScrapped: true,
        });
    },
});

