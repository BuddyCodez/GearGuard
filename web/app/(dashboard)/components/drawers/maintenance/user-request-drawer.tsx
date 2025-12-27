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
import { CheckCircle2 } from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"
import { useState } from "react"

const requestSchema = z.object({
    subject: z.string().min(5, "Subject must be at least 5 characters"),
    equipmentId: z.string().min(1, "Please select equipment"),
    priority: z.enum(["low", "medium", "high", "critical"]),
})

const priorityLabels = {
    low: "Low - Can wait",
    medium: "Medium - Normal",
    high: "High - Important",
    critical: "Critical - Urgent!",
}

interface UserRequestDrawerProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function UserRequestDrawer({ open, onOpenChange }: UserRequestDrawerProps) {
    const createRequest = useMutation(api.maintenanceRequests.create)
    const equipment = useQuery(api.equipment.list)
    const [isPending, setIsPending] = useState(false)

    const form = useForm<z.infer<typeof requestSchema>>({
        resolver: zodResolver(requestSchema),
        defaultValues: {
            subject: "",
            equipmentId: "",
            priority: "medium",
        },
    })

    const onSubmit = async (data: z.infer<typeof requestSchema>) => {
        setIsPending(true)
        try {
            await createRequest({
                subject: data.subject,
                equipmentId: data.equipmentId as Id<"equipment">,
                type: "corrective", // Normal users can only create corrective requests
                priority: data.priority,
            })

            onOpenChange?.(false)
            form.reset()

            toast.success("Request created", {
                description: "Your maintenance request has been submitted successfully.",
                icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            })
        } catch (error) {
            console.error("Failed to create request:", error)
            toast.error("Failed to create request", {
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
                    <SheetTitle className="text-xl font-bold tracking-tight text-white">
                        New Maintenance Request
                    </SheetTitle>
                    <SheetDescription className="text-zinc-400">
                        Report an issue with your equipment
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="subject"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-zinc-400 font-medium">
                                            What's wrong?
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="e.g. Printer not working, paper jam"
                                                className="bg-white/5 border-white/10 text-white focus:bg-white/10 transition-colors h-11"
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                                    {isPending ? "Submitting..." : "Submit Request"}
                                </Button>
                            </div>
                        </form>
                    </Form>

                    <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <p className="text-xs text-blue-300">
                            <strong>Note:</strong> Your request will be automatically assigned to the appropriate maintenance team based on the equipment you selected.
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
