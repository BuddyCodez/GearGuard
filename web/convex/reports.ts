import { query } from "./_generated/server"
import { v } from "convex/values"

/**
 * Reports Analytics Queries
 * Manager-only insights for maintenance performance
 */

// Helper to get current user
async function getCurrentUser(ctx: any) {
    const userId = await ctx.auth.getUserIdentity()
    if (!userId) return null

    return await ctx.db
        .query("users")
        .withIndex("by_authUserId", (q: any) => q.eq("authUserId", userId.subject))
        .first()
}

// 1️⃣ Requests Overview - Health of the System
export const getRequestsOverview = query({
    args: {
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx)
        if (!user || user.role !== "manager") {
            throw new Error("Unauthorized - Managers only")
        }

        // Get all requests (with optional date filtering)
        const allRequests = await ctx.db.query("maintenanceRequests").collect()

        // Filter by date range if provided
        const requests = args.startDate && args.endDate
            ? allRequests.filter(r => r.createdAt >= args.startDate! && r.createdAt <= args.endDate!)
            : allRequests

        // Calculate metrics
        const total = requests.length
        const open = requests.filter(r => r.status === "new" || r.status === "in_progress").length
        const closed = requests.filter(r => r.status === "repaired" || r.status === "scrap").length
        const corrective = requests.filter(r => r.type === "corrective").length
        const preventive = requests.filter(r => r.type === "preventive").length

        // Calculate overdue (requests older than 7 days still open)
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
        const overdue = requests.filter(r =>
            (r.status === "new" || r.status === "in_progress") &&
            r.createdAt < sevenDaysAgo
        ).length

        return {
            total,
            open,
            closed,
            overdue,
            corrective,
            preventive,
            correctivePercentage: total > 0 ? Math.round((corrective / total) * 100) : 0,
            preventivePercentage: total > 0 ? Math.round((preventive / total) * 100) : 0,
        }
    },
})

// 2️⃣ Team Performance
export const getTeamPerformance = query({
    args: {
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx)
        if (!user || user.role !== "manager") {
            throw new Error("Unauthorized - Managers only")
        }

        const teams = await ctx.db.query("teams").collect()
        const allRequests = await ctx.db.query("maintenanceRequests").collect()

        // Filter by date range if provided
        const requests = args.startDate && args.endDate
            ? allRequests.filter(r => r.createdAt >= args.startDate! && r.createdAt <= args.endDate!)
            : allRequests

        const teamStats = await Promise.all(
            teams.map(async (team) => {
                const teamRequests = requests.filter(r => r.teamId === team._id)
                const completed = teamRequests.filter(r => r.status === "repaired" || r.status === "scrap")
                const open = teamRequests.filter(r => r.status === "new" || r.status === "in_progress")

                // Calculate average resolution time for completed requests
                let avgResolutionTime = 0
                if (completed.length > 0) {
                    const totalTime = completed.reduce((sum, req) => {
                        return sum + (req.updatedAt - req.createdAt)
                    }, 0)
                    avgResolutionTime = Math.round(totalTime / completed.length / (1000 * 60 * 60)) // hours
                }

                return {
                    teamId: team._id,
                    teamName: team.name,
                    totalRequests: teamRequests.length,
                    completed: completed.length,
                    open: open.length,
                    avgResolutionTimeHours: avgResolutionTime,
                }
            })
        )

        return teamStats.sort((a, b) => b.totalRequests - a.totalRequests)
    },
})

// 3️⃣ Technician Workload
export const getTechnicianWorkload = query({
    args: {
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx)
        if (!user || user.role !== "manager") {
            throw new Error("Unauthorized - Managers only")
        }

        const technicians = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("role"), "technician"))
            .collect()

        const allRequests = await ctx.db.query("maintenanceRequests").collect()

        // Filter by date range if provided
        const requests = args.startDate && args.endDate
            ? allRequests.filter(r => r.createdAt >= args.startDate! && r.createdAt <= args.endDate!)
            : allRequests

        const techStats = technicians.map((tech) => {
            const techRequests = requests.filter(r => r.assignedTo === tech._id)
            const completed = techRequests.filter(r => r.status === "repaired" || r.status === "scrap")
            const inProgress = techRequests.filter(r => r.status === "in_progress")
            const assigned = techRequests.filter(r => r.status === "new" || r.status === "in_progress")

            // Calculate average time to repair
            let avgRepairTime = 0
            if (completed.length > 0) {
                const totalTime = completed.reduce((sum, req) => {
                    return sum + (req.updatedAt - req.createdAt)
                }, 0)
                avgRepairTime = Math.round(totalTime / completed.length / (1000 * 60 * 60)) // hours
            }

            return {
                technicianId: tech._id,
                technicianName: tech.name,
                teamId: tech.teamId,
                totalAssigned: techRequests.length,
                completed: completed.length,
                inProgress: inProgress.length,
                currentlyAssigned: assigned.length,
                avgRepairTimeHours: avgRepairTime,
            }
        })

        return techStats.sort((a, b) => b.completed - a.completed)
    },
})

// 4️⃣ Equipment Insights
export const getEquipmentInsights = query({
    args: {
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx)
        if (!user || user.role !== "manager") {
            throw new Error("Unauthorized - Managers only")
        }

        const equipment = await ctx.db.query("equipment").collect()
        const allRequests = await ctx.db.query("maintenanceRequests").collect()

        // Filter by date range if provided
        const requests = args.startDate && args.endDate
            ? allRequests.filter(r => r.createdAt >= args.startDate! && r.createdAt <= args.endDate!)
            : allRequests

        // Get categories for lookup
        const categories = await ctx.db.query("equipmentCategories").collect()
        const categoryMap = new Map(categories.map(c => [c._id, c.name]))

        const equipmentStats = equipment.map((eq) => {
            const eqRequests = requests.filter(r => r.equipmentId === eq._id)
            const scrapped = eqRequests.filter(r => r.status === "scrap")

            return {
                equipmentId: eq._id,
                equipmentName: eq.name,
                category: eq.categoryId ? categoryMap.get(eq.categoryId) || "Uncategorized" : "Uncategorized",
                department: eq.department,
                totalRequests: eqRequests.length,
                scrappedCount: scrapped.length,
                isScrapped: eq.isScrapped,
            }
        })

        // Sort by most frequently failing
        const sorted = equipmentStats.sort((a, b) => b.totalRequests - a.totalRequests)

        // Get category breakdown
        const categoryBreakdown: Record<string, number> = {}
        equipment.forEach((eq) => {
            const categoryName = eq.categoryId ? categoryMap.get(eq.categoryId) || "Uncategorized" : "Uncategorized"
            const count = requests.filter(r => r.equipmentId === eq._id).length
            categoryBreakdown[categoryName] = (categoryBreakdown[categoryName] || 0) + count
        })

        return {
            equipmentStats: sorted,
            categoryBreakdown,
            totalEquipment: equipment.length,
            totalScrapped: equipment.filter(e => e.isScrapped).length,
        }
    },
})
