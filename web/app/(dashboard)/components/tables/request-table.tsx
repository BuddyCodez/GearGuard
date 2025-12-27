"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Clock, User, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ManagerRequestDrawer } from "@/app/(dashboard)/components/drawers/maintenance/manager-request-drawer"
import { Id } from "@/convex/_generated/dataModel"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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

const typeLabels = {
    corrective: "Corrective",
    preventive: "Preventive",
}

interface RequestTableProps {
    searchQuery?: string
}

export function RequestTable({ searchQuery = "" }: RequestTableProps) {
    const requests = useQuery(api.maintenanceRequests.listAllRequests)
    const [filterType, setFilterType] = useState<string>("all")
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [selectedRequestId, setSelectedRequestId] = useState<Id<"maintenanceRequests"> | null>(null)

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
        // Type and Status filters
        if (filterType !== "all" && req.type !== filterType) return false
        if (filterStatus !== "all" && req.status !== filterStatus) return false

        // Search query filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            const matchesSubject = req.subject.toLowerCase().includes(query)
            const matchesEquipment = (req.equipment?.name || "").toLowerCase().includes(query)
            const matchesTechnician = (req.assignedTechnician?.name || "").toLowerCase().includes(query)

            return matchesSubject || matchesEquipment || matchesTechnician
        }

        return true
    })

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Filter className="w-4 h-4" />
                    <span>Filters:</span>
                </div>

                <Select value={filterType} onValueChange={(value) => value && setFilterType(value)}>
                    <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white h-9">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1c] border-white/10 text-white">
                        <SelectItem value="all" className="focus:bg-white/10 focus:text-white">
                            All Types
                        </SelectItem>
                        <SelectItem value="corrective" className="focus:bg-white/10 focus:text-white">
                            Corrective
                        </SelectItem>
                        <SelectItem value="preventive" className="focus:bg-white/10 focus:text-white">
                            Preventive
                        </SelectItem>
                    </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={(value) => value && setFilterStatus(value)}>
                    <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white h-9">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1c] border-white/10 text-white">
                        <SelectItem value="all" className="focus:bg-white/10 focus:text-white">
                            All Status
                        </SelectItem>
                        <SelectItem value="new" className="focus:bg-white/10 focus:text-white">
                            New
                        </SelectItem>
                        <SelectItem value="in_progress" className="focus:bg-white/10 focus:text-white">
                            In Progress
                        </SelectItem>
                        <SelectItem value="repaired" className="focus:bg-white/10 focus:text-white">
                            Repaired
                        </SelectItem>
                        <SelectItem value="scrap" className="focus:bg-white/10 focus:text-white">
                            Scrapped
                        </SelectItem>
                    </SelectContent>
                </Select>

                {(filterType !== "all" || filterStatus !== "all") && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setFilterType("all")
                            setFilterStatus("all")
                        }}
                        className="h-9 text-xs text-zinc-400 hover:text-white"
                    >
                        Clear Filters
                    </Button>
                )}

                <div className="ml-auto text-sm text-zinc-500">
                    {filteredRequests?.length || 0} request{filteredRequests?.length !== 1 ? "s" : ""}
                </div>
            </div>

            {/* Table */}
            <div className="w-full bg-[#0B0B0D] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/2">
                                <th className="py-4 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    Subject
                                </th>
                                <th className="py-4 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    Technician
                                </th>
                                <th className="py-4 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="py-4 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="py-4 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    Equipment
                                </th>
                                <th className="py-4 px-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    Created
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredRequests && filteredRequests.length > 0 ? (
                                filteredRequests.map((req) => (
                                    <tr
                                        key={req._id}
                                        onClick={() => setSelectedRequestId(req._id)}
                                        className="group hover:bg-white/5 transition-colors cursor-pointer"
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium text-white group-hover:text-indigo-400 transition-colors">
                                                    {req.subject}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            {req.assignedTechnician ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
                                                        <span className="text-[10px] text-indigo-400 font-medium">
                                                            {req.assignedTechnician.name.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm text-zinc-300">
                                                        {req.assignedTechnician.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10">
                                                        <User className="w-3 h-3 text-zinc-500" />
                                                    </div>
                                                    <span className="text-sm text-zinc-500">Unassigned</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm text-zinc-400 capitalize">
                                                {typeLabels[req.type as keyof typeof typeLabels]}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span
                                                className={cn(
                                                    "px-2.5 py-1 rounded-full text-xs font-medium border inline-block",
                                                    stageStyles[req.status as keyof typeof stageStyles]
                                                )}
                                            >
                                                {stageLabels[req.status as keyof typeof stageLabels]}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm text-zinc-300">
                                                {req.equipment?.name || "Unknown"}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-1.5 text-zinc-500">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-sm">{formatDate(req.createdAt)}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center">
                                                <Filter className="w-5 h-5 text-zinc-600" />
                                            </div>
                                            <p className="text-sm text-zinc-500">
                                                {requests === undefined
                                                    ? "Loading requests..."
                                                    : "No requests found"}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Manager Request Drawer */}
            {selectedRequestId && (
                <ManagerRequestDrawer
                    requestId={selectedRequestId}
                    open={!!selectedRequestId}
                    onOpenChange={(open: boolean) => !open && setSelectedRequestId(null)}
                />
            )}
        </div>
    )
}
