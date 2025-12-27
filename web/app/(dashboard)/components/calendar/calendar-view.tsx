"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useState } from "react"
import { PreventiveMaintenanceDrawer } from "@/app/(dashboard)/components/drawers/maintenance/preventive-maintenance-drawer"
import { ManagerRequestDrawer } from "@/app/(dashboard)/components/drawers/maintenance/manager-request-drawer"
import { Id } from "@/convex/_generated/dataModel"
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

const priorityStyles = {
    critical: {
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        text: "text-red-400",
        indicator: "bg-red-500"
    },
    high: {
        bg: "bg-orange-500/10",
        border: "border-orange-500/20",
        text: "text-orange-400",
        indicator: "bg-orange-500"
    },
    medium: {
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
        text: "text-yellow-400",
        indicator: "bg-yellow-500"
    },
    low: {
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        text: "text-blue-400",
        indicator: "bg-blue-500"
    },
}

export function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedRequestId, setSelectedRequestId] = useState<Id<"maintenanceRequests"> | null>(null)
    const [showCreateDrawer, setShowCreateDrawer] = useState(false)
    const [hoveredDay, setHoveredDay] = useState<string | null>(null)

    // Get start and end of month
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    // Get start and end of calendar view (including padding days)
    const startDay = startOfMonth.getDay()
    const calendarStart = new Date(startOfMonth)
    calendarStart.setDate(calendarStart.getDate() - startDay)

    const calendarEnd = new Date(endOfMonth)
    const endDay = endOfMonth.getDay()
    calendarEnd.setDate(calendarEnd.getDate() + (6 - endDay))

    // Fetch scheduled maintenance for the month
    const scheduledMaintenance = useQuery(api.calendar.getScheduledMaintenance, {
        startDate: calendarStart.getTime(),
        endDate: calendarEnd.getTime(),
    })

    // Generate calendar days
    const calendarDays: Date[] = []
    const current = new Date(calendarStart)
    while (current <= calendarEnd) {
        calendarDays.push(new Date(current))
        current.setDate(current.getDate() + 1)
    }

    // Group maintenance by date
    const maintenanceByDate = new Map<string, typeof scheduledMaintenance>()
    scheduledMaintenance?.forEach((request) => {
        if (request.scheduledDate) {
            const dateKey = new Date(request.scheduledDate).toDateString()
            if (!maintenanceByDate.has(dateKey)) {
                maintenanceByDate.set(dateKey, [])
            }
            maintenanceByDate.get(dateKey)?.push(request)
        }
    })

    const handleDateClick = (date: Date) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (date >= today) {
            setSelectedDate(date)
            setShowCreateDrawer(true)
        }
    }

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
    }

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
    }

    const handleToday = () => {
        setCurrentDate(new Date())
    }

    const isToday = (date: Date) => {
        const today = new Date()
        return date.toDateString() === today.toDateString()
    }

    const isCurrentMonth = (date: Date) => {
        return date.getMonth() === currentDate.getMonth()
    }

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between bg-[#0B0B0D]/50 backdrop-blur-xl p-4 rounded-2xl border border-white/5 shadow-xl">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <CalendarIcon className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">
                                {MONTHS[currentDate.getMonth()]}
                            </h2>
                            <p className="text-sm text-zinc-400 font-medium">
                                {currentDate.getFullYear()}
                            </p>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-white/10" />

                    <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-white/5">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handlePrevMonth}
                            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleToday}
                            className="h-8 px-3 text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/10 rounded-md"
                        >
                            Today
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleNextMonth}
                            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <Button
                    onClick={() => {
                        setSelectedDate(new Date())
                        setShowCreateDrawer(true)
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 border border-indigo-500/20 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Maintenance
                </Button>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 bg-[#0B0B0D]/40 backdrop-blur-sm rounded-2xl border border-white/5 p-6 shadow-2xl overflow-hidden flex flex-col">
                {/* Day Headers */}
                <div className="grid grid-cols-7 mb-4">
                    {DAYS_OF_WEEK.map((day) => (
                        <div key={day} className="text-center">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                {day}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 grid-rows-5 gap-3 flex-1 min-h-0">
                    {calendarDays.map((date, index) => {
                        const dateKey = date.toDateString()
                        const dayMaintenance = maintenanceByDate.get(dateKey) || []
                        const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
                        const isHovered = hoveredDay === dateKey
                        const isCurrentMonthDay = isCurrentMonth(date)
                        const isTodayDay = isToday(date)

                        return (
                            <motion.div
                                key={index}
                                layoutId={dateKey}
                                onMouseEnter={() => setHoveredDay(dateKey)}
                                onMouseLeave={() => setHoveredDay(null)}
                                onClick={() => !isPast && handleDateClick(date)}
                                className={cn(
                                    "relative flex flex-col p-3 rounded-xl border transition-all duration-200 group overflow-hidden",
                                    isCurrentMonthDay
                                        ? "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                                        : "bg-transparent border-transparent opacity-30",
                                    isTodayDay && "bg-indigo-500/5 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]",
                                    !isPast && "cursor-pointer",
                                    isPast && "cursor-not-allowed"
                                )}
                            >
                                {/* Date Number & Add Button */}
                                <div className="flex items-center justify-between mb-2">
                                    <span className={cn(
                                        "text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-colors",
                                        isTodayDay
                                            ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                                            : isCurrentMonthDay ? "text-zinc-300 group-hover:text-white" : "text-zinc-600"
                                    )}>
                                        {date.getDate()}
                                    </span>

                                    {!isPast && isCurrentMonthDay && (
                                        <div className={cn(
                                            "opacity-0 transform translate-x-2 transition-all duration-200",
                                            isHovered && "opacity-100 translate-x-0"
                                        )}>
                                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-indigo-500 hover:scale-110 transition-all">
                                                <Plus className="w-3 h-3" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Events List */}
                                <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto scrollbar-hide">
                                    {dayMaintenance.slice(0, 3).map((request) => {
                                        const style = priorityStyles[request.priority as keyof typeof priorityStyles] || priorityStyles.medium
                                        return (
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                key={request._id}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedRequestId(request._id)
                                                }}
                                                className={cn(
                                                    "group/event relative flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
                                                    style.bg,
                                                    style.border
                                                )}
                                            >
                                                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.indicator)} />
                                                <span className={cn("text-[10px] font-medium truncate", style.text)}>
                                                    {request.equipment?.name || request.subject}
                                                </span>
                                            </motion.div>
                                        )
                                    })}

                                    {dayMaintenance.length > 3 && (
                                        <div className="text-[10px] font-medium text-zinc-500 pl-1 hover:text-zinc-300 transition-colors">
                                            +{dayMaintenance.length - 3} more events
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* Create Preventive Maintenance Drawer */}
            <PreventiveMaintenanceDrawer
                open={showCreateDrawer}
                onOpenChange={setShowCreateDrawer}
                prefilledDate={selectedDate || undefined}
            />

            {/* View/Edit Request Drawer */}
            {
                selectedRequestId && (
                    <ManagerRequestDrawer
                        requestId={selectedRequestId}
                        open={!!selectedRequestId}
                        onOpenChange={(open) => !open && setSelectedRequestId(null)}
                    />
                )
            }
        </div >
    )
}
