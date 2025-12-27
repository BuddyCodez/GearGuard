"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Loader2, Plus, Printer, MapPin, Building2, Hash, Calendar as CalendarIcon, User, Briefcase, FileText, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerTrigger,
    DrawerClose,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const equipmentSchema = z.object({
    name: z.string().min(2, "Name is required"),
    categoryId: z.string().min(1, "Category is required"),
    company: z.string().min(2, "Company is required"),
    department: z.string().min(2, "Department is required"),
    maintenanceTeamId: z.string().min(1, "Team is required"),

    serialNumber: z.string().optional(),
    usedByEmployee: z.string().optional(),
    usedInLocation: z.string().optional(),
    technicianId: z.string().optional(),
    description: z.string().optional(),
})

interface EquipmentDrawerProps {
    initialData?: any
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function EquipmentDrawer({ initialData, trigger, open: controlledOpen, onOpenChange: setControlledOpen }: EquipmentDrawerProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = isControlled ? setControlledOpen : setInternalOpen

    const createEquipment = useMutation(api.equipment.create)
    const updateEquipment = useMutation(api.equipment.update)
    const teams = useQuery(api.teams.list)
    const categories = useQuery(api.categories.list)

    const form = useForm<z.infer<typeof equipmentSchema>>({
        resolver: zodResolver(equipmentSchema),
        defaultValues: {
            name: initialData?.name || "",
            categoryId: initialData?.categoryId || "",
            company: initialData?.company || "",
            department: initialData?.department || "",
            maintenanceTeamId: initialData?.maintenanceTeamId || "",
            serialNumber: initialData?.serialNumber || "",
            usedByEmployee: initialData?.usedByEmployee || "",
            usedInLocation: initialData?.usedInLocation || "",
            technicianId: initialData?.technicianId || "",
            description: initialData?.description || "",
        },
    })

    const maintenanceTeamId = form.watch("maintenanceTeamId")
    const teamMembers = useQuery(api.teams.getMembers, maintenanceTeamId ? { teamId: maintenanceTeamId as Id<"teams"> } : "skip")

    // Reset form when initialData changes
    useEffect(() => {
        if (initialData) {
            form.reset({
                name: initialData.name,
                categoryId: initialData.categoryId,
                company: initialData.company,
                department: initialData.department,
                maintenanceTeamId: initialData.maintenanceTeamId,
                serialNumber: initialData.serialNumber || "",
                usedByEmployee: initialData.usedByEmployee || "",
                usedInLocation: initialData.usedInLocation || "",
                technicianId: initialData.technicianId || "",
                description: initialData.description || "",
            })
        }
    }, [initialData, form])

    const onSubmit = async (data: z.infer<typeof equipmentSchema>) => {
        try {
            if (initialData) {
                await updateEquipment({
                    id: initialData._id,
                    name: data.name,
                    categoryId: data.categoryId as any,
                    company: data.company,
                    department: data.department,
                    maintenanceTeamId: data.maintenanceTeamId as any,
                    serialNumber: data.serialNumber || undefined,
                    usedByEmployee: data.usedByEmployee || undefined,
                    usedInLocation: data.usedInLocation || undefined,
                    technicianId: data.technicianId ? (data.technicianId as any) : undefined,
                    description: data.description || undefined,
                })
            } else {
                await createEquipment({
                    name: data.name,
                    categoryId: data.categoryId as any,
                    company: data.company,
                    department: data.department,
                    maintenanceTeamId: data.maintenanceTeamId as any,
                    serialNumber: data.serialNumber || undefined,
                    usedByEmployee: data.usedByEmployee || undefined,
                    usedInLocation: data.usedInLocation || undefined,
                    technicianId: data.technicianId ? (data.technicianId as any) : undefined,
                    description: data.description || undefined,
                    assignedDate: Date.now(),
                })
            }
            setOpen?.(false)
            if (!initialData) form.reset()
            toast.success(initialData ? "Equipment updated successfully" : "Equipment added successfully", {
                description: `${data.name} has been ${initialData ? "updated" : "registered"}.`,
                icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            })
        } catch (error) {
            console.error("Failed to save equipment:", error)
            toast.error("Failed to save equipment", {
                description: "Please try again later.",
            })
        }
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                {trigger || (
                    <Button className="bg-white text-black hover:bg-zinc-200 gap-2">
                        <Plus className="w-4 h-4" /> Add Equipment
                    </Button>
                )}
            </DrawerTrigger>
            <DrawerContent className="bg-[#0B0B0D] border-t border-white/10 max-h-[90vh]">
                <div className="mx-auto w-full max-w-4xl">
                    <DrawerHeader>
                        <DrawerTitle className="text-white text-2xl">{initialData ? "Edit Equipment" : "Add Equipment"}</DrawerTitle>
                        <DrawerDescription className="text-zinc-400">
                            {initialData ? "Update equipment details." : "Register a new asset. This will be available for maintenance requests."}
                        </DrawerDescription>
                    </DrawerHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 overflow-y-auto max-h-[70vh]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-zinc-400">Equipment Name</FormLabel>
                                                <div className="relative">
                                                    <Printer className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                                                    <FormControl>
                                                        <Input {...field} placeholder="e.g. Samsung Monitor 15" className="pl-9 bg-white/5 border-white/10 text-white focus:bg-white/10 transition-colors" />
                                                    </FormControl>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="categoryId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-zinc-400">Category</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-indigo-500/20">
                                                            <SelectValue>
                                                                {categories?.find(c => c._id === field.value)?.name || "Select Category"}
                                                            </SelectValue>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-[#1a1a1c] border-white/10 text-white z-99999">
                                                        {categories?.map((cat) => (
                                                            <SelectItem key={cat._id} value={cat._id}>
                                                                {cat.name}
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
                                        name="company"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-zinc-400">Company</FormLabel>
                                                <div className="relative">
                                                    <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                                                    <FormControl>
                                                        <Input {...field} placeholder="e.g. My Company" className="pl-9 bg-white/5 border-white/10 text-white" />
                                                    </FormControl>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="usedByEmployee"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-zinc-400">Used By (Employee)</FormLabel>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                                                    <FormControl>
                                                        <Input {...field} placeholder="e.g. Abigail Peterson" className="pl-9 bg-white/5 border-white/10 text-white" />
                                                    </FormControl>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="maintenanceTeamId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-zinc-400">Maintenance Team (Routing)</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-indigo-500/20">
                                                            <SelectValue>
                                                                {teams?.find(t => t._id === field.value)?.name || "Select Team"}
                                                            </SelectValue>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-[#1a1a1c] border-white/10 text-white z-99999">
                                                        {teams?.map((team) => (
                                                            <SelectItem key={team._id} value={team._id}>
                                                                {team.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="technicianId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-zinc-400">Default Technician</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={!maintenanceTeamId}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-indigo-500/20">
                                                            <SelectValue>
                                                                {maintenanceTeamId
                                                                    ? (teamMembers?.find(u => u._id === field.value)?.name || "Select Technician")
                                                                    : "Select Team First"}
                                                            </SelectValue>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-[#1a1a1c] border-white/10 text-white z-99999">
                                                        {teamMembers?.map((user) => (
                                                            <SelectItem key={user._id} value={user._id}>
                                                                {user.name}
                                                            </SelectItem>
                                                        ))}
                                                        {teamMembers?.length === 0 && (
                                                            <div className="p-2 text-xs text-zinc-500 text-center">No members in this team</div>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="usedInLocation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-zinc-400">Used In Location</FormLabel>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                                                    <FormControl>
                                                        <Input {...field} placeholder="e.g. Office / Floor 2" className="pl-9 bg-white/5 border-white/10 text-white" />
                                                    </FormControl>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="department"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-zinc-400">Department</FormLabel>
                                                <div className="relative">
                                                    <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                                                    <FormControl>
                                                        <Input {...field} placeholder="e.g. IT" className="pl-9 bg-white/5 border-white/10 text-white" />
                                                    </FormControl>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="serialNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-zinc-400">Serial Number</FormLabel>
                                                <div className="relative">
                                                    <Hash className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                                                    <FormControl>
                                                        <Input {...field} placeholder="e.g. SN-12345" className="pl-9 bg-white/5 border-white/10 text-white" />
                                                    </FormControl>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Bottom Full Width */}
                            <div className="mt-8">
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-zinc-400">Description</FormLabel>
                                            <div className="relative">
                                                <FileText className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                                                <FormControl>
                                                    <Textarea {...field} placeholder="Additional details..." className="pl-9 bg-white/5 border-white/10 text-white min-h-[100px]" />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200 mt-8 py-6 text-lg font-semibold shadow-lg shadow-white/5 transition-all hover:scale-[1.01] active:scale-[0.99]" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (initialData ? "Update Equipment" : "Register Equipment")}
                            </Button>
                        </form>
                    </Form>
                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button variant="outline" className="border-white/10 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-colors">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
