"use client"

import { Search, Bell, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { EquipmentDrawer } from "@/components/web/equipment-drawer"
import { authClient } from "@/lib/auth-client"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { getVisibleTabs } from "@/lib/permissions"
import { useAuthDrawer } from "@/hooks/use-auth-drawer"
import { useState } from "react"
import { NotificationDrawer } from "@/app/(dashboard)/components/drawers/notification-drawer"

interface TopBarProps {
    currentTab: string
    onTabChange: (tab: string) => void
    searchQuery: string
    setSearchQuery: (query: string) => void
}

export function TopBar({ currentTab, onTabChange, searchQuery, setSearchQuery }: TopBarProps) {
    const { open: openAuthDrawer } = useAuthDrawer()
    const { data: session } = authClient.useSession()
    const [isNotificationOpen, setIsNotificationOpen] = useState(false)
    const unreadCount = useQuery(api.notifications.getUnreadCount)

    // Fetch user role from Convex to check permissions
    const user = useQuery(api.users.getViewer)
    const isManager = user?.role === "manager"
    const isNormalUser = user?.role === "user"

    // Get tabs based on user role
    const tabs = getVisibleTabs(user?.role)

    return (
        <div className="w-full border-b border-white/10 bg-[#0B0B0D]/50 backdrop-blur-xl sticky top-0 z-30">
            <div className="max-w-[1600px] mx-auto h-16 px-6 flex items-center justify-between gap-8">
                {/* Left: Tabs */}
                <div className="flex items-center gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => onTabChange(tab)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                currentTab === tab
                                    ? "bg-white/10 text-white"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Center: Search */}
                <div className="flex-1 max-w-md">
                    <div className="relative group">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={isNormalUser ? "Search my requests..." : "Search requests, equipment, or technicians..."}
                            className="w-full pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/20 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-2.5 text-zinc-500 hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-3">
                    {isManager && <EquipmentDrawer />}

                    {/* Notification Bell */}
                    <button
                        onClick={() => setIsNotificationOpen(true)}
                        className="relative p-2 rounded-lg hover:bg-white/5 transition-all group"
                    >
                        <Bell className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                        {unreadCount && unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </button>

                    <div className="h-6 w-px bg-white/10" />

                    <button
                        onClick={openAuthDrawer}
                        className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-white/5 transition-all group"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-white group-hover:text-white/90">
                                {session?.user?.name || "Sign In"}
                            </p>
                            <p className="text-xs text-zinc-500 group-hover:text-zinc-400">
                                {session?.user?.email || "Guest"}
                            </p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center border-2 border-[#0B0B0D] shadow-lg overflow-hidden">
                            {session?.user?.image ? (
                                <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-4 h-4 text-white" />
                            )}
                        </div>
                    </button>
                </div>
            </div>

            <NotificationDrawer
                open={isNotificationOpen}
                onOpenChange={setIsNotificationOpen}
            />
        </div>
    )
}
