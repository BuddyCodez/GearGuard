"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useState } from "react"
import { Bell, Check, CheckCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Id } from "@/convex/_generated/dataModel"

interface NotificationDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onNotificationClick?: (entityType?: string, entityId?: string) => void
}

export function NotificationDrawer({ open, onOpenChange, onNotificationClick }: NotificationDrawerProps) {
    const notifications = useQuery(api.notifications.getMyNotifications)
    const markAsRead = useMutation(api.notifications.markAsRead)
    const markAllAsRead = useMutation(api.notifications.markAllAsRead)

    const handleNotificationClick = async (notification: any) => {
        // Mark as read
        if (!notification.read) {
            await markAsRead({ notificationId: notification._id })
        }

        // Open related drawer if callback provided
        if (onNotificationClick && notification.entityType && notification.entityId) {
            onNotificationClick(notification.entityType, notification.entityId)
        }
    }

    const handleMarkAllAsRead = async () => {
        await markAllAsRead({})
    }

    const formatTime = (timestamp: number) => {
        const now = Date.now()
        const diff = now - timestamp
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return "Just now"
        if (minutes < 60) return `${minutes}m ago`
        if (hours < 24) return `${hours}h ago`
        if (days < 7) return `${days}d ago`
        return new Date(timestamp).toLocaleDateString()
    }

    const unreadCount = notifications?.filter(n => !n.read).length || 0

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="bg-[#0B0B0D] border-l border-white/10 w-full sm:max-w-md">
                <SheetHeader>
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-white">Notifications</SheetTitle>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-zinc-400 hover:text-white"
                            >
                                <CheckCheck className="w-4 h-4 mr-1" />
                                Mark all as read
                            </Button>
                        )}
                    </div>
                    <SheetDescription className="text-zinc-400">
                        Stay updated on your maintenance requests
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
                    {notifications && notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <button
                                key={notification._id}
                                onClick={() => handleNotificationClick(notification)}
                                className={cn(
                                    "w-full text-left p-4 rounded-lg border transition-all hover:bg-white/5",
                                    notification.read
                                        ? "bg-white/2 border-white/5"
                                        : "bg-blue-500/5 border-blue-500/20"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    {!notification.read && (
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h4 className={cn(
                                                "text-sm font-medium truncate",
                                                notification.read ? "text-zinc-300" : "text-white"
                                            )}>
                                                {notification.title}
                                            </h4>
                                            <span className="text-xs text-zinc-500 shrink-0">
                                                {formatTime(notification.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-400 line-clamp-2">
                                            {notification.message}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <Bell className="w-8 h-8 text-zinc-600" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">No notifications</h3>
                            <p className="text-sm text-zinc-500">
                                You're all caught up! We'll notify you when something needs your attention.
                            </p>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
