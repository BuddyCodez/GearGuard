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
import { CheckCircle2, Calendar } from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"
import { useState } from "react"

const preventiveSchema = z.object({
    subject: z.string().min(5, "Subject must be at least 5 characters"),
    equipmentId: z.string().min(1, "Please select equipment"),
    priority: z.enum(["low", "medium", "high", "critical"]),
    scheduledDate: z.string().min(1, "Please select a date"),
    technicianId: z.string().optional(),
})

const priorityLabels = {
    low: "Low - Routine",
    medium: "Medium - Normal",
    high: "High - Important",
    critical: "Critical - Urgent",
}

interface PreventiveMaintenanceDrawerProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    prefilledDate?: Date
}

export function PreventiveMaintenanceDrawer({
    open,
    onOpenChange,
    prefilledDate
}: PreventiveMaintenanceDrawerProps) {
    const createRequest = useMutation(api.maintenanceRequests.create)
    const equipment = useQuery(api.equipment.list)
    const technicians = useQuery(api.users.getTechnicians)
    const [isPending, setIsPending] = useState(false)

    // Format date to YYYY-MM-DD for input
    const formatDateForInput = (date: Date) => {
        return date.toISOString().split('T')[0]
    }

    const form = useForm<z.infer<typeof preventiveSchema>>({
        resolver: zodResolver(preventiveSchema),
        defaultValues: {
            subject: "",
            equipmentId: "",
            priority: "medium",
            scheduledDate: prefilledDate ? formatDateForInput(prefilledDate) : "",
            technicianId: "",
        },
    })

    const onSubmit = async (data: z.infer<typeof preventiveSchema>) => {
        setIsPending(true)
        try {
            await createRequest({
                subject: data.subject,
                equipmentId: data.equipmentId as Id<"equipment">,
                type: "preventive",
                priority: data.priority,
                scheduledDate: new Date(data.scheduledDate).getTime(),
            })

            onOpenChange?.(false)
            form.reset()

            toast.success("Preventive maintenance scheduled", {
                description: "The maintenance job has been added to the calendar.",
                icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            })
        } catch (error) {
            console.error("Failed to create preventive maintenance:", error)
            toast.error("Failed to schedule maintenance", {
                description: "Please try again later.",
            })
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="bg-[#0B0B0D] border-l border-white/10 text-white w-full sm:max-w-md p-0 flex flex-col shadow-2xl shadow-black">
                <SheetHeader className="px-6 py-6 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-400" />
                        <SheetTitle className="text-xl font-bold tracking-tight text-white">
                            Schedule Preventive Maintenance
                        </SheetTitle>
                    </div>
                    <SheetDescription className="text-zinc-400">
                        Plan routine maintenance for equipment
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Subject */}
                            <FormField
                                control={form.control}
                                name="subject"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-zinc-400 font-medium">
                                            Maintenance Task
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g. Quarterly inspection, Oil change"
                                                className="bg-white/5 border-white/10 text-white focus:bg-white/10 transition-colors h-11"
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Scheduled Date */}
                            <FormField
                                control={form.control}
                                name="scheduledDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-zinc-400 font-medium">
                                            Scheduled Date
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="date"
                                                className="bg-white/5 border-white/10 text-white focus:bg-white/10 transition-colors h-11"
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Equipment */}
                            <FormField
                                control={form.control}
                                name="equipmentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-zinc-400 font-medium">
                                            Equipment
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={isPending}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-white/5 border-white/10 text-white h-11">
                                                    <SelectValue>
                                                        {equipment?.find(e => e._id === field.value)?.name || "Select equipment"}
                                                    </SelectValue>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-[#1a1a1c] border-white/10 text-white">
                                                {equipment?.map((item) => (
                                                    <SelectItem
                                                        key={item._id}
                                                        value={item._id}
                                                        className="focus:bg-white/10 focus:text-white"
                                                        disabled={item.isScrapped}
                                                    >
                                                        {item.name} {item.isScrapped && "(Scrapped)"}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Priority */}
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-zinc-400 font-medium">
                                            Priority
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={isPending}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:bg-white/10 transition-colors h-11">
                                                    <SelectValue>
                                                        {priorityLabels[field.value as keyof typeof priorityLabels]}
                                                    </SelectValue>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-[#1a1a1c] border-white/10 text-white">
                                                <SelectItem value="low" className="focus:bg-white/10 focus:text-white">
                                                    Low - Routine
                                                </SelectItem>
                                                <SelectItem value="medium" className="focus:bg-white/10 focus:text-white">
                                                    Medium - Normal
                                                </SelectItem>
                                                <SelectItem value="high" className="focus:bg-white/10 focus:text-white">
                                                    High - Important
                                                </SelectItem>
                                                <SelectItem value="critical" className="focus:bg-white/10 focus:text-white">
                                                    Critical - Urgent
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Optional Technician */}
                            <FormField
                                control={form.control}
                                name="technicianId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-zinc-400 font-medium">
                                            Assign Technician (Optional)
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={isPending}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-white/5 border-white/10 text-white h-11">
                                                    <SelectValue>
                                                        {technicians?.find(t => t._id === field.value)?.name || "Select technician"}
                                                    </SelectValue>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-[#1a1a1c] border-white/10 text-white">
                                                {technicians?.map((tech) => (
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white h-11 font-medium shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    disabled={isPending}
                                >
                                    {isPending ? "Scheduling..." : "Schedule Maintenance"}
                                </Button>
                            </div>
                        </form>
                    </Form>

                    <div className="mt-6 p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                        <p className="text-xs text-indigo-300">
                            <strong>Note:</strong> This preventive maintenance will appear on the calendar and be visible to the assigned team.
                        </p>
                    </div>
                </div>

                <SheetFooter className="flex justify-end p-6 border-t border-white/10 bg-white/5">
                    <SheetClose asChild>
                        <Button
                            variant="outline"
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white hover:border-white/20 transition-colors"
                            disabled={isPending}
                        >
                            Close
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
