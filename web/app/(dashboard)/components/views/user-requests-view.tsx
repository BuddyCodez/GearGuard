"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Plus, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { UserRequestDrawer } from "@/app/(dashboard)/components/drawers/maintenance/user-request-drawer"
import { RequestDetailsDrawer } from "@/app/(dashboard)/components/drawers/maintenance/request-details-drawer"
import { Id } from "@/convex/_generated/dataModel"

const stageStyles = {
    new: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    in_progress: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    repaired: "bg-green-500/10 text-green-400 border-green-500/20",
    scrap: "bg-red-500/10 text-red-400 border-red-500/20",
}

const stageLabels = {
    new: "New",
    in_progress: "In Progress",
    repaired: "Repaired",
    scrap: "Scrapped",
}

interface UserRequestsViewProps {
    searchQuery?: string
}

export function UserRequestsView({ searchQuery = "" }: UserRequestsViewProps) {
    const requests = useQuery(api.maintenanceRequests.listMyRequests)
    const [selectedRequestId, setSelectedRequestId] = useState<Id<"maintenanceRequests"> | null>(null)
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    const formatDate = (timestamp: number) => {
        const now = Date.now()
        const diff = now - timestamp
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 60) return `${minutes}m ago`
        if (hours < 24) return `${hours}h ago`
        return `${days}d ago`
    }

    // Filter requests
    const filteredRequests = requests?.filter((req) => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        const matchesSubject = req.subject.toLowerCase().includes(query)
        const matchesEquipment = (req.equipment?.name || "").toLowerCase().includes(query)
        return matchesSubject || matchesEquipment
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">My Maintenance Requests</h2>
                    <p className="text-sm text-zinc-400 mt-1">
                        Track and manage your equipment maintenance requests
                    </p>
                </div>
                <Button
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Maintenance Request
                </Button>
            </div>

            {/* Requests Table */}
            {filteredRequests && filteredRequests.length > 0 ? (
                <div className="rounded-xl border border-white/10 bg-black/20 backdrop-blur-xl overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/2">
                                <th className="py-4 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    Subject
                                </th>
                                <th className="py-4 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    Equipment
                                </th>
                                <th className="py-4 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="py-4 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    Last Updated
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredRequests.map((request) => (
                                <tr
                                    key={request._id}
                                    onClick={() => setSelectedRequestId(request._id)}
                                    className="group hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium text-white group-hover:text-indigo-400 transition-colors">
                                                {request.subject}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-sm text-zinc-300">
                                            {request.equipment?.name || "Unknown"}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span
                                            className={cn(
                                                "px-2.5 py-1 rounded-full text-xs font-medium border inline-block",
                                                stageStyles[request.status as keyof typeof stageStyles]
                                            )}
                                        >
                                            {stageLabels[request.status as keyof typeof stageLabels]}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-1.5 text-zinc-500">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span className="text-sm">{formatDate(request.updatedAt)}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                // Empty State
                <div className="rounded-xl border border-dashed border-white/10 bg-black/10 backdrop-blur-xl p-16 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                            <AlertCircle className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                            {searchQuery ? "No matching requests" : "No Requests Yet"}
                        </h3>
                        <p className="text-sm text-zinc-400 mb-6">
                            {searchQuery
                                ? "Try adjusting your search terms"
                                : "You haven't created any maintenance requests. Click the button above to report an issue with your equipment."}
                        </p>
                        {!searchQuery && (
                            <Button
                                onClick={() => setIsCreateOpen(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Your First Request
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Drawers */}
            <UserRequestDrawer open={isCreateOpen} onOpenChange={setIsCreateOpen} />
            {selectedRequestId && (
                <RequestDetailsDrawer
                    requestId={selectedRequestId}
                    open={!!selectedRequestId}
                    onOpenChange={(open: boolean) => !open && setSelectedRequestId(null)}
                />
            )}
        </div>
    )
}
