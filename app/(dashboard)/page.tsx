"use client"

import { useState } from "react"
import { LayoutGrid, List } from "lucide-react"
import { cn } from "@/lib/utils"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { authClient } from "@/lib/auth-client"

import { TopBar } from "./components/top-bar"
import { KPICards } from "./components/kpi/kpi-cards"
import { RequestTable } from "./components/tables/request-table"
import { KanbanBoard } from "./components/kanban/kanban-board"
import { CalendarView } from "./components/calendar/calendar-view"
import { EquipmentView } from "./components/views/equipment-view"
import { TeamsView } from "./components/teams/teams-view"
import { UserRequestsView } from "./components/views/user-requests-view"
import { TechnicianView } from "./components/views/technician-view"
import { ReportsView } from "./components/views/reports-view"
import { LoggedOutView } from "./components/views/logged-out-view"
import { canViewKanban } from "@/lib/permissions"

export default function DashboardPage() {
    const [view, setView] = useState<"table" | "kanban">("table")
    const [activeTab, setActiveTab] = useState("Maintenance")
    const [searchQuery, setSearchQuery] = useState("")
    const user = useQuery(api.users.getViewer)

    const { data: session, isPending: isAuthPending } = authClient.useSession()

    // Show logged out view if no user (preloaded query will make this instant)
    if (user === undefined || isAuthPending) {
        // Still loading
        return null
    }

    if (user === null) {
        // If we have a session but no user record yet, we are syncing
        if (session) {
            return (
                <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-white/10" />
                        <div className="h-4 w-32 rounded bg-white/10" />
                    </div>
                </div>
            )
        }
        return <LoggedOutView />
    }

    const isNormalUser = user?.role === "user"
    const isTechnician = user?.role === "technician"
    const showKanbanToggle = canViewKanban(user?.role)
    const isManager = user?.role === "manager"

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
        setSearchQuery("") // Clear search when switching tabs
    }

    return (
        <div className="min-h-screen bg-[#0B0B0D] text-white font-sans selection:bg-white/20">
            <TopBar
                currentTab={activeTab}
                onTabChange={handleTabChange}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            <main className="max-w-[1600px] mx-auto px-6 py-8">
                {/* KPI Section - Only show on Maintenance tab for managers */}
                {activeTab === "Maintenance" && isManager && <KPICards />}

                {/* Main Work Area */}
                <div className="space-y-4">
                    {activeTab === "Maintenance" && (
                        <>
                            {isNormalUser ? (
                                // Simplified view for normal users
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <UserRequestsView searchQuery={searchQuery} />
                                </div>
                            ) : isTechnician ? (
                                // Dedicated technician work queue view
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <TechnicianView searchQuery={searchQuery} />
                                </div>
                            ) : (
                                // Manager view with full controls
                                <>
                                    {/* Toolbar */}
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-semibold text-white">Maintenance Requests</h2>

                                        {showKanbanToggle && (
                                            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
                                                <button
                                                    onClick={() => setView("table")}
                                                    className={cn(
                                                        "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                                                        view === "table"
                                                            ? "bg-white/10 text-white shadow-sm"
                                                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                                                    )}
                                                >
                                                    <List className="w-4 h-4" />
                                                    Table
                                                </button>
                                                <button
                                                    onClick={() => setView("kanban")}
                                                    className={cn(
                                                        "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                                                        view === "kanban"
                                                            ? "bg-white/10 text-white shadow-sm"
                                                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                                                    )}
                                                >
                                                    <LayoutGrid className="w-4 h-4" />
                                                    Kanban
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {view === "table" && <RequestTable searchQuery={searchQuery} />}
                                        {view === "kanban" && <KanbanBoard searchQuery={searchQuery} />}
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {activeTab === "Calendar" && (isTechnician || isManager) && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {isTechnician && (
                                <div className="mb-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                    <p className="text-sm text-blue-300">
                                        <strong>Scheduled Maintenance:</strong> View upcoming preventive maintenance jobs for your team. Contact your manager to reschedule.
                                    </p>
                                </div>
                            )}
                            <CalendarView />
                        </div>
                    )}

                    {activeTab === "Reports" && isManager && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <ReportsView />
                        </div>
                    )}

                    {activeTab === "Equipment" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <EquipmentView searchQuery={searchQuery} />
                        </div>
                    )}

                    {activeTab === "Teams" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <TeamsView searchQuery={searchQuery} />
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
