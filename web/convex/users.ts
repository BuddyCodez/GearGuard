import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const bootstrapUser = mutation({
    args: {
        authUserId: v.string(),
        email: v.string(),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_authUserId", (q) => q.eq("authUserId", args.authUserId))
            .first();

        if (existing) return;

        const userCount = (await ctx.db.query("users").collect()).length;

        await ctx.db.insert("users", {
            authUserId: args.authUserId,
            email: args.email,
            name: args.name,
            role: userCount === 0 ? "manager" : "user",
        });
    },
});

export const getUserCount = query({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();
        return users.length;
    },
});

export const assignRole = mutation({
    args: {
        userId: v.id("users"),
        role: v.union(v.literal("user"), v.literal("manager"), v.literal("technician")),
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
            throw new Error("Unauthorized: Only managers can assign roles");
        }

        await ctx.db.patch(args.userId, {
            role: args.role,
        });
    },
});

export const assignTeam = mutation({
    args: {
        userId: v.id("users"),
        teamId: v.id("teams"),
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
            throw new Error("Unauthorized: Only managers can assign teams");
        }

        await ctx.db.patch(args.userId, {
            teamId: args.teamId,
        });
    },
});

export const listUsers = query({
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

        if (!viewer || viewer.role !== "manager") {
            throw new Error("Unauthorized: Only managers can list users");
        }

        return await ctx.db.query("users").collect();
    },
});

// Alias for backward compatibility
export const getUsers = listUsers;

export const getPromotableUsers = query({
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

        if (!viewer || viewer.role !== "manager") {
            throw new Error("Unauthorized: Only managers can view promotable users");
        }

        // Get all users who can be added to teams:
        // 1. Users with role "user" (can be promoted to technician)
        // 2. Technicians without a team (can be reassigned)
        const allUsers = await ctx.db.query("users").collect();
        return allUsers.filter((user) =>
            user.role === "user" || (user.role === "technician" && !user.teamId)
        );
    },
});

export const getViewer = query({
    args: {},
    handler: async (ctx) => {
        try {
            const viewerAuth = await authComponent.getAuthUser(ctx);
            console.log("getViewer - viewerAuth:", viewerAuth);

            if (!viewerAuth) {
                return null;
            }

            const user = await ctx.db
                .query("users")
                .withIndex("by_authUserId", (q) => q.eq("authUserId", viewerAuth._id as string))
                .first();

            console.log("getViewer - database user:", user);
            return user;
        } catch (error) {
            console.error("getViewer - error:", error);
            return null;
        }
    },
});

/**
 * Get all technicians and managers (for assignment dropdown)
 */
export const getTechnicians = query({
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

        // Get all technicians and managers
        const allUsers = await ctx.db.query("users").collect();
        return allUsers.filter((user) => user.role === "technician" || user.role === "manager");
    },
});

/**
 * Public query to get user by email (for mobile API authentication)
 * No auth required - used only for login verification
 */
export const getUserByEmail = query({
    args: {
        email: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first()

        return user
    },
})
