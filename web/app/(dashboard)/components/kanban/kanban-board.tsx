"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useState, useMemo } from "react"
import { Id } from "@/convex/_generated/dataModel"
import { ManagerRequestDrawer } from "@/app/(dashboard)/components/drawers/maintenance/manager-request-drawer"
import { AlertTriangle, User, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type Status = "new" | "in_progress" | "repaired" | "scrap"

const statusLabels: Record<Status, string> = {
    new: "New Requests",
    in_progress: "In Progress",
    repaired: "Repaired",
    scrap: "Scrap",
}

const statusColors: Record<Status, string> = {
    new: "bg-blue-500",
    in_progress: "bg-yellow-500",
    repaired: "bg-green-500",
    scrap: "bg-red-500",
}

const priorityConfig = {
    critical: { color: "bg-red-500/20 border-red-500/40 text-red-300", icon: true },
    high: { color: "bg-orange-500/20 border-orange-500/40 text-orange-300", icon: true },
    medium: { color: "bg-yellow-500/20 border-yellow-500/40 text-yellow-300", icon: false },
    low: { color: "bg-zinc-500/20 border-zinc-500/40 text-zinc-300", icon: false },
}

const statusOrder: Status[] = ["new", "in_progress", "repaired", "scrap"]

interface KanbanBoardProps {
    searchQuery?: string
}

export function KanbanBoard({ searchQuery = "" }: KanbanBoardProps) {
    const requests = useQuery(api.maintenanceRequests.listAllRequests)
    const updateStatus = useMutation(api.maintenanceRequests.updateStatus)
    const user = useQuery(api.users.getViewer)

    const [selectedRequestId, setSelectedRequestId] = useState<Id<"maintenanceRequests"> | null>(null)
    const [draggedId, setDraggedId] = useState<Id<"maintenanceRequests"> | null>(null)
    const [optimisticUpdates, setOptimisticUpdates] = useState<Map<Id<"maintenanceRequests">, Status>>(new Map())

    const isManager = user?.role === "manager"

    // Memoize grouped requests for performance - only recalculate when data changes
    const groupedRequests = useMemo(() => {
        if (!requests) return null

        const groups = new Map<Status, typeof requests>()
        statusOrder.forEach(status => groups.set(status, []))

        requests.forEach(request => {
            // Filter by search query
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                const matchesSubject = request.subject.toLowerCase().includes(query)
                const matchesEquipment = (request.equipment?.name || "").toLowerCase().includes(query)
                const matchesTechnician = (request.assignedTechnician?.name || "").toLowerCase().includes(query)

                if (!matchesSubject && !matchesEquipment && !matchesTechnician) {
                    return
                }
            }

            // Use optimistic status if available, otherwise use actual status
            const status = (optimisticUpdates.get(request._id) || request.status) as Status
            groups.get(status)?.push(request)
        })

        return groups
    }, [requests, optimisticUpdates])

    const handleDragStart = (e: React.DragEvent, requestId: Id<"maintenanceRequests">) => {
        setDraggedId(requestId)
        e.dataTransfer.effectAllowed = "move"
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
    }

    const handleDrop = async (e: React.DragEvent, newStatus: Status) => {
        e.preventDefault()

        if (!draggedId) return

        const request = requests?.find(r => r._id === draggedId)
        if (!request || request.status === newStatus) {
            setDraggedId(null)
            return
        }

        // ⚡ OPTIMISTIC UPDATE - Instant UI feedback!
        setOptimisticUpdates(prev => new Map(prev).set(draggedId, newStatus))
        setDraggedId(null)

        try {
            await updateStatus({
                requestId: draggedId,
                status: newStatus,
            })

            // Clear optimistic update on success
            setOptimisticUpdates(prev => {
                const next = new Map(prev)
                next.delete(draggedId)
                return next
            })
        } catch (error) {
            // Revert optimistic update on error
            setOptimisticUpdates(prev => {
                const next = new Map(prev)
                next.delete(draggedId)
                return next
            })
            toast.error("Failed to update status")
        }
    }

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return "Today"
        if (diffDays === 1) return "Yesterday"
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }

    if (!groupedRequests) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
        )
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statusOrder.map((status) => {
                    const columnRequests = groupedRequests.get(status) || []

                    return (
                        <div
                            key={status}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, status)}
                            className="flex flex-col bg-[#0B0B0D]/50 rounded-xl border border-white/5 p-4 min-h-[600px] transition-colors hover:border-white/10"
                        >
                            {/* Column Header */}
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-2 h-2 rounded-full", statusColors[status])} />
                                    <h3 className="font-semibold text-white text-sm">
                                        {statusLabels[status]}
                                    </h3>
                                </div>
                                <span className="text-xs font-medium text-zinc-500 bg-white/5 px-2 py-1 rounded-full">
                                    {columnRequests.length}
                                </span>
                            </div>

                            {/* Cards */}
                            <div className="space-y-3 flex-1">
                                {columnRequests.map((request) => {
                                    const priority = request.priority || "medium"
                                    const config = priorityConfig[priority as keyof typeof priorityConfig]
                                    const isOptimistic = optimisticUpdates.has(request._id)

                                    return (
                                        <div
                                            key={request._id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, request._id)}
                                            onClick={() => setSelectedRequestId(request._id)}
                                            className={cn(
                                                "group bg-[#121214] rounded-lg p-4 border border-white/10 cursor-move hover:border-white/20 transition-all duration-150 hover:shadow-lg hover:shadow-black/20 hover:scale-[1.02] active:scale-100",
                                                isOptimistic && "opacity-60 scale-95 pointer-events-none"
                                            )}
                                        >
                                            {/* Priority Badge - Only show to managers */}
                                            <div className="flex items-center justify-between mb-3">
                                                {isManager && (
                                                    <span className={cn(
                                                        "text-[10px] font-medium px-2 py-1 rounded-full border flex items-center gap-1",
                                                        config.color
                                                    )}>
                                                        {config.icon && <AlertTriangle className="w-3 h-3" />}
                                                        {priority.toUpperCase()}
                                                    </span>
                                                )}
                                                <span className={cn(
                                                    "text-[10px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded",
                                                    !isManager && "ml-0"
                                                )}>
                                                    {request.type === "preventive" ? "Preventive" : "Corrective"}
                                                </span>
                                            </div>

                                            {/* Subject */}
                                            <h4 className="text-sm font-medium text-white mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors">
                                                {request.subject}
                                            </h4>

                                            {/* Equipment */}
                                            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
                                                <Package className="w-3 h-3" />
                                                <span className="truncate">{request.equipment?.name || "Unknown"}</span>
                                            </div>

                                            {/* Footer */}
                                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                                {/* Assigned Technician */}
                                                <div className="flex items-center gap-2">
                                                    {request.assignedTechnician ? (
                                                        <>
                                                            <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-medium text-indigo-300 border border-indigo-500/30">
                                                                {request.assignedTechnician.name?.[0]?.toUpperCase()}
                                                            </div>
                                                            <span className="text-xs text-zinc-400 truncate max-w-[100px]">
                                                                {request.assignedTechnician.name}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="w-6 h-6 rounded-full bg-zinc-700/50 flex items-center justify-center">
                                                                <User className="w-3 h-3 text-zinc-500" />
                                                            </div>
                                                            <span className="text-xs text-zinc-500">Unassigned</span>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Date */}
                                                <span className="text-[10px] text-zinc-500">
                                                    {formatDate(request.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Manager Request Drawer */}
            {selectedRequestId && (
                <ManagerRequestDrawer
                    requestId={selectedRequestId}
                    open={!!selectedRequestId}
                    onOpenChange={(open: boolean) => !open && setSelectedRequestId(null)}
                />
            )}
        </>
    )
}
