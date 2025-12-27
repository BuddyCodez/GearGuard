"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useState } from "react"
import { LayoutGrid, List } from "lucide-react"
import { cn } from "@/lib/utils"
import { KanbanBoard } from "@/app/(dashboard)/components/kanban/kanban-board"
import { RequestTable } from "@/app/(dashboard)/components/tables/request-table"

type WorkView = "kanban" | "table"

interface TechnicianViewProps {
    searchQuery?: string
}

export function TechnicianView({ searchQuery = "" }: TechnicianViewProps) {
    const [workView, setWorkView] = useState<WorkView>("kanban")
    const user = useQuery(api.users.getViewer)
    const teamRequests = useQuery(api.maintenanceRequests.listAllRequests)

    // Filter to only show requests for technician's team
    const myTeamRequests = teamRequests?.filter(req => {
        if (req.teamId !== user?.teamId) return false

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            const matchesSubject = req.subject.toLowerCase().includes(query)
            const matchesEquipment = (req.equipment?.name || "").toLowerCase().includes(query)

            return matchesSubject || matchesEquipment
        }

        return true
    })

    return (
        <div className="space-y-6">
            {/* Technician Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Work Queue</h1>
                    <p className="text-sm text-zinc-400 mt-1">
                        {myTeamRequests?.length || 0} active requests for your team
                    </p>
                </div>

                {/* View Toggle (Kanban/Table) */}
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
                    <button
                        onClick={() => setWorkView("kanban")}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                            workView === "kanban"
                                ? "bg-white/10 text-white shadow-sm"
                                : "text-zinc-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Board
                    </button>
                    <button
                        onClick={() => setWorkView("table")}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                            workView === "table"
                                ? "bg-white/10 text-white shadow-sm"
                                : "text-zinc-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <List className="w-4 h-4" />
                        List
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {workView === "kanban" && <KanbanBoard searchQuery={searchQuery} />}
                {workView === "table" && <RequestTable searchQuery={searchQuery} />}
            </div>
        </div>
    )
}
