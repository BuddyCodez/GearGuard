import { query, mutation, internalMutation } from "./_generated/server"
import { v } from "convex/values"
import { Id } from "./_generated/dataModel"
import { authComponent } from "./auth"

/**
 * Get current user's notifications (sorted by newest first)
 */
export const getMyNotifications = query({
    args: {},
    handler: async (ctx) => {
        const viewerAuth = await authComponent.getAuthUser(ctx)
        if (!viewerAuth) return []

        const viewer = await ctx.db
            .query("users")
            .withIndex("by_authUserId", (q) => q.eq("authUserId", viewerAuth._id as string))
            .first()

        if (!viewer) return []

        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", viewer._id))
            .order("desc")
            .take(50) // Limit to recent 50

        return notifications
    },
})

/**
 * Get unread notification count (for badge)
 */
export const getUnreadCount = query({
    args: {},
    handler: async (ctx) => {
        const viewerAuth = await authComponent.getAuthUser(ctx)
        if (!viewerAuth) return 0

        const viewer = await ctx.db
            .query("users")
            .withIndex("by_authUserId", (q) => q.eq("authUserId", viewerAuth._id as string))
            .first()

        if (!viewer) return 0

        const unreadNotifications = await ctx.db
            .query("notifications")
            .withIndex("by_user_unread", (q) => q.eq("userId", viewer._id).eq("read", false))
            .collect()

        return unreadNotifications.length
    },
})

/**
 * Mark a notification as read
 */
export const markAsRead = mutation({
    args: {
        notificationId: v.id("notifications"),
    },
    handler: async (ctx, args) => {
        const viewerAuth = await authComponent.getAuthUser(ctx)
        if (!viewerAuth) throw new Error("Unauthorized")

        const viewer = await ctx.db
            .query("users")
            .withIndex("by_authUserId", (q) => q.eq("authUserId", viewerAuth._id as string))
            .first()

        if (!viewer) throw new Error("Unauthorized")

        const notification = await ctx.db.get(args.notificationId)
        if (!notification || notification.userId !== viewer._id) {
            throw new Error("Notification not found")
        }

        await ctx.db.patch(args.notificationId, { read: true })
    },
})

/**
 * Mark all notifications as read
 */
export const markAllAsRead = mutation({
    args: {},
    handler: async (ctx) => {
        const viewerAuth = await authComponent.getAuthUser(ctx)
        if (!viewerAuth) throw new Error("Unauthorized")

        const viewer = await ctx.db
            .query("users")
            .withIndex("by_authUserId", (q) => q.eq("authUserId", viewerAuth._id as string))
            .first()

        if (!viewer) throw new Error("Unauthorized")

        const unreadNotifications = await ctx.db
            .query("notifications")
            .withIndex("by_user_unread", (q) => q.eq("userId", viewer._id).eq("read", false))
            .collect()

        await Promise.all(
            unreadNotifications.map((notification) =>
                ctx.db.patch(notification._id, { read: true })
            )
        )
    },
})

/**
 * Internal helper to create notifications
 * Called from other mutations
 */
export const createNotification = internalMutation({
    args: {
        userId: v.id("users"),
        type: v.string(),
        title: v.string(),
        message: v.string(),
        entityType: v.optional(v.string()),
        entityId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("notifications", {
            userId: args.userId,
            type: args.type,
            title: args.title,
            message: args.message,
            entityType: args.entityType,
            entityId: args.entityId,
            read: false,
            createdAt: Date.now(),
        })
    },
})
