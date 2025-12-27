"use client"

import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import { CheckCircle2, User, Package, Users, Calendar, AlertTriangle } from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { useState } from "react"

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

const priorityLabels = {
    low: "Low - Can wait",
    medium: "Medium - Normal",
    high: "High - Important",
    critical: "Critical - Urgent!",
}

const requestSchema = z.object({
    subject: z.string().min(5, "Subject must be at least 5 characters"),
    status: z.enum(["new", "in_progress", "repaired", "scrap"]),
    technicianId: z.string().optional(),
})

interface ManagerRequestDrawerProps {
    requestId: Id<"maintenanceRequests">
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function ManagerRequestDrawer({ requestId, open, onOpenChange }: ManagerRequestDrawerProps) {
    const request = useQuery(api.maintenanceRequests.getRequestDetails, { requestId })
    const technicians = useQuery(api.users.getTechnicians)
    const updateStatus = useMutation(api.maintenanceRequests.updateStatus)
    const assignTechnician = useMutation(api.maintenanceRequests.assignTechnician)
    const updateRequest = useMutation(api.maintenanceRequests.updateRequest)
    const scrapEquipment = useMutation(api.maintenanceRequests.scrapEquipment)
    const [isEditing, setIsEditing] = useState(false)
    const [isPending, setIsPending] = useState(false)

    const form = useForm<z.infer<typeof requestSchema>>({
        resolver: zodResolver(requestSchema),
        values: {
            subject: request?.subject || "",
            status: (request?.status as any) || "new",
            technicianId: request?.assignedTo || "",
        },
    })

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const handleStatusChange = async (status: string) => {
        // Don't update if selecting the same status
        if (status === request?.status) return

        setIsPending(true)
        try {
            await updateStatus({
                requestId,
                status: status as any,
            })
            toast.success("Status updated", {
                icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            })
        } catch (error) {
            toast.error("Failed to update status")
        } finally {
            setIsPending(false)
        }
    }

    const handleTechnicianAssign = async (technicianId: string) => {
        // Don't update if selecting the same technician
        if (technicianId === request?.assignedTo) return

        setIsPending(true)
        try {
            await assignTechnician({
                requestId,
                technicianId: technicianId as Id<"users">,
            })
            toast.success("Technician assigned", {
                icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            })
        } catch (error) {
            toast.error("Failed to assign technician")
        } finally {
            setIsPending(false)
        }
    }

    const handleSaveEdit = async (data: z.infer<typeof requestSchema>) => {
        setIsPending(true)
        try {
            await updateRequest({
                requestId,
                subject: data.subject,
            })
            setIsEditing(false)
            toast.success("Request updated", {
                icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            })
        } catch (error) {
            toast.error("Failed to update request")
        } finally {
            setIsPending(false)
        }
    }

    const handlePriorityChange = async (priority: string) => {
        // Don't update if selecting the same priority
        if (priority === request?.priority) return

        setIsPending(true)
        try {
            await updateRequest({
                requestId,
                priority: priority as any,
            })
            toast.success("Priority updated", {
                icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            })
        } catch (error) {
            toast.error("Failed to update priority")
        } finally {
            setIsPending(false)
        }
    }

    const handleScrap = async () => {
        if (!confirm("Are you sure you want to scrap this equipment? This action cannot be undone.")) {
            return
        }

        setIsPending(true)
        try {
            await scrapEquipment({ requestId })
            onOpenChange?.(false)
            toast.success("Equipment scrapped", {
                description: "Request marked as scrapped and equipment flagged.",
                icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            })
        } catch (error) {
            toast.error("Failed to scrap equipment")
        } finally {
            setIsPending(false)
        }
    }

    if (!request) {
        return null
    }

    // Filter technicians by team
    const teamTechnicians = technicians?.filter((tech) => tech.teamId === request.teamId)

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="bg-[#0B0B0D] border-l border-white/10 text-white w-full sm:max-w-lg p-0 flex flex-col shadow-2xl shadow-black overflow-y-auto">
                <SheetHeader className="px-6 py-6 border-b border-white/10 bg-white/5 sticky top-0 z-10">
                    <div className="flex items-start justify-between">
                        <div>
                            <SheetTitle className="text-xl font-bold tracking-tight text-white">
                                {request.subject}
                            </SheetTitle>
                            <SheetDescription className="text-zinc-400 mt-1">
                                Manage maintenance request details
                            </SheetDescription>
                        </div>
                        <SheetClose asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10 -mt-1 -mr-2"
                            >
                                <span className="sr-only">Close</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </Button>
                        </SheetClose>
                    </div>
                </SheetHeader>

                <div className="flex-1 px-6 py-6 space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-500">Current Status</span>
                        <span
                            className={cn(
                                "px-3 py-1.5 rounded-full text-sm font-medium border",
                                stageStyles[request.status as keyof typeof stageStyles]
                            )}
                        >
                            {stageLabels[request.status as keyof typeof stageLabels]}
                        </span>
                    </div>

                    {/* Subject - Editable */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm text-zinc-500">Subject</label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditing(!isEditing)}
                                className="h-7 text-xs text-indigo-400 hover:text-indigo-300"
                            >
                                {isEditing ? "Cancel" : "Edit"}
                            </Button>
                        </div>
                        {isEditing ? (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleSaveEdit)} className="space-y-3">
                                    <FormField
                                        control={form.control}
                                        name="subject"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        className="bg-white/5 border-white/10 text-white"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        size="sm"
                                        className="w-full bg-indigo-500 hover:bg-indigo-600"
                                    >
                                        Save Changes
                                    </Button>
                                </form>
                            </Form>
                        ) : (
                            <p className="text-base text-white font-medium">{request.subject}</p>
                        )}
                    </div>

                    {/* Priority - Manager Control */}
                    <div className="space-y-2 p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                        <label className="text-sm text-purple-400 font-medium">Change Priority</label>
                        <Select
                            value={request.priority || "medium"}
                            onValueChange={(value) => value && handlePriorityChange(value)}
                            disabled={isPending}
                        >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue>
                                    {priorityLabels[(request.priority || "medium") as keyof typeof priorityLabels]}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1a1c] border-white/10 text-white">
                                <SelectItem value="low" className="focus:bg-white/10 focus:text-white">
                                    Low - Can wait
                                </SelectItem>
                                <SelectItem value="medium" className="focus:bg-white/10 focus:text-white">
                                    Medium - Normal
                                </SelectItem>
                                <SelectItem value="high" className="focus:bg-white/10 focus:text-white">
                                    High - Important
                                </SelectItem>
                                <SelectItem value="critical" className="focus:bg-white/10 focus:text-white">
                                    Critical - Urgent!
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Equipment */}
                    <div className="space-y-2">
                        <label className="text-sm text-zinc-500 flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Equipment
                        </label>
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-white font-medium">{request.equipment?.name}</p>
                            {request.equipment?.serialNumber && (
                                <p className="text-xs text-zinc-500 mt-1">
                                    Serial: {request.equipment.serialNumber}
                                </p>
                            )}
                            {request.equipment?.department && (
                                <p className="text-xs text-zinc-500">
                                    Department: {request.equipment.department}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Team */}
                    {request.team && (
                        <div className="space-y-2">
                            <label className="text-sm text-zinc-500 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Maintenance Team
                            </label>
                            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                <p className="text-white font-medium">{request.team.name}</p>
                            </div>
                        </div>
                    )}

                    {/* Assign Technician - Manager Control */}
                    <div className="space-y-2 p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                        <label className="text-sm text-indigo-400 font-medium flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Assign Technician
                        </label>
                        <Select
                            value={request.assignedTo || "unassigned"}
                            onValueChange={(value) => {
                                if (value && value !== "unassigned") {
                                    handleTechnicianAssign(value)
                                }
                            }}
                            disabled={isPending}
                        >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue>
                                    {request.assignedTechnician?.name || "Unassigned"}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1a1c] border-white/10 text-white">
                                <SelectItem value="unassigned" className="focus:bg-white/10">
                                    Unassigned
                                </SelectItem>
                                {teamTechnicians?.map((tech) => (
                                    <SelectItem
                                        key={tech._id}
                                        value={tech._id}
                                        className="focus:bg-white/10 focus:text-white"
                                    >
                                        {tech.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {request.assignedTechnician && (
                            <div className="flex items-center gap-3 p-2 rounded bg-white/5 mt-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-400 font-medium">
                                    {request.assignedTechnician.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm text-white font-medium">
                                        {request.assignedTechnician.name}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        {request.assignedTechnician.email}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Change Status - Manager Control */}
                    <div className="space-y-2 p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                        <label className="text-sm text-yellow-400 font-medium">Change Status</label>
                        <Select value={request.status} onValueChange={(value) => value && handleStatusChange(value)} disabled={isPending}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue>
                                    {stageLabels[request.status as keyof typeof stageLabels]}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1a1c] border-white/10 text-white">
                                <SelectItem value="new" className="focus:bg-white/10 focus:text-white">
                                    New
                                </SelectItem>
                                <SelectItem
                                    value="in_progress"
                                    className="focus:bg-white/10 focus:text-white"
                                >
                                    In Progress
                                </SelectItem>
                                <SelectItem value="repaired" className="focus:bg-white/10 focus:text-white">
                                    Repaired
                                </SelectItem>
                                <SelectItem value="scrap" className="focus:bg-white/10 focus:text-white">
                                    Scrap
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-3 pt-4 border-t border-white/10">
                        <label className="text-sm text-zinc-500 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Timeline
                        </label>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-400">Created By</span>
                                <span className="text-white">{request.creator?.name}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-400">Created</span>
                                <span className="text-white">{formatDate(request.createdAt)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-400">Last Updated</span>
                                <span className="text-white">{formatDate(request.updatedAt)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Scrap Equipment - Danger Zone */}
                    {request.status !== "scrap" && (
                        <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                            <div className="flex items-start gap-3 mb-3">
                                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-red-400">Danger Zone</p>
                                    <p className="text-xs text-zinc-500 mt-1">
                                        Mark equipment as scrapped. This will close the request and flag the
                                        equipment as unusable.
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={handleScrap}
                                variant="outline"
                                className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                            >
                                Scrap Equipment
                            </Button>
                        </div>
                    )}
                </div>

                <SheetFooter className="p-6 border-t border-white/10 bg-white/5">
                    <div className="text-xs text-zinc-500 text-center w-full">
                        Last updated: {formatDate(request.updatedAt)}
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
