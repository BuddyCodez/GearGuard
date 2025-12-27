"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { AlertTriangle, Users, ClipboardList, Calendar } from "lucide-react"

export function KPICards() {
    const requests = useQuery(api.maintenanceRequests.listAllRequests)
    const technicians = useQuery(api.users.getTechnicians)

    // Calculate statistics
    const stats = {
        total: requests?.length || 0,
        new: requests?.filter((r) => r.status === "new").length || 0,
        inProgress: requests?.filter((r) => r.status === "in_progress").length || 0,
        repaired: requests?.filter((r) => r.status === "repaired").length || 0,
    }

    // 1. Critical Equipment (Active High/Critical Requests)
    const criticalRequests = requests?.filter(r =>
        (r.priority === "critical" || r.priority === "high") &&
        r.status !== "repaired" &&
        r.status !== "scrap"
    ) || []
    const criticalEquipmentCount = new Set(criticalRequests.map(r => r.equipmentId)).size

    // 2. Technician Load (% of techs with active tasks)
    const techList = technicians?.filter(t => t.role === "technician") || []
    const totalTechs = techList.length
    const activeTechs = new Set(
        requests?.filter(r =>
            r.assignedTo &&
            r.status !== "repaired" &&
            r.status !== "scrap"
        ).map(r => r.assignedTo)
    ).size
    const techLoad = totalTechs > 0 ? Math.round((activeTechs / totalTechs) * 100) : 0

    // 3. Upcoming Maintenance (Preventive in next 7 days)
    const now = Date.now()
    const nextWeek = now + (7 * 24 * 60 * 60 * 1000)
    const upcomingCount = requests?.filter(r =>
        r.type === "preventive" &&
        r.scheduledDate &&
        r.scheduledDate >= now &&
        r.scheduledDate <= nextWeek &&
        r.status !== "repaired" &&
        r.status !== "scrap"
    ).length || 0

    const cards = [
        {
            title: "Critical Equipment",
            value: `${criticalEquipmentCount} Units`,
            subtitle: "Requires Attention",
            icon: AlertTriangle,
            iconBg: "bg-red-500/10",
            iconColor: "text-red-500",
        },
        {
            title: "Technician Load",
            value: `${techLoad}%`,
            subtitle: `${activeTechs}/${totalTechs} Active`,
            icon: Users,
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-500",
        },
        {
            title: "Open Requests",
            value: `${stats.new + stats.inProgress} Pending`,
            subtitle: `${stats.new} New`,
            icon: ClipboardList,
            iconBg: "bg-green-500/10",
            iconColor: "text-green-500",
        },
        {
            title: "Upcoming Maintenance",
            value: `${upcomingCount} This Week`,
            subtitle: "Preventive Schedule",
            icon: Calendar,
            iconBg: "bg-purple-500/10",
            iconColor: "text-purple-500",
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((card) => {
                const Icon = card.icon
                return (
                    <div
                        key={card.title}
                        className="relative group overflow-hidden rounded-xl p-4 border border-white/5 bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:border-white/10 hover:from-white/15 hover:to-white/5 hover:shadow-xl hover:shadow-black/20 cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative flex items-start justify-between mb-3">
                            <div className={`p-2.5 rounded-lg ${card.iconBg} border border-white/5 group-hover:scale-110 transition-transform duration-300`}>
                                <Icon className={`w-5 h-5 ${card.iconColor}`} />
                            </div>
                        </div>
                        <div className="relative">
                            <p className="text-xs text-zinc-400 mb-1 group-hover:text-zinc-300 transition-colors">{card.title}</p>
                            <p className="text-xl font-bold text-white mb-0.5 tracking-tight">
                                {requests === undefined ? "..." : card.value}
                            </p>
                            <p className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">{card.subtitle}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
