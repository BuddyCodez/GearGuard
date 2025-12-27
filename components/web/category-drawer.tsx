"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Loader2, Plus, Tag, Briefcase, User, CheckCircle2 } from "lucide-react"
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"


const categorySchema = z.object({
    name: z.string().min(2, "Name is required"),
    company: z.string().min(2, "Company is required"),
    responsibleUserId: z.string().optional(),
})

interface CategoryDrawerProps {
    initialData?: any
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function CategoryDrawer({ initialData, trigger, open: controlledOpen, onOpenChange: setControlledOpen }: CategoryDrawerProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = isControlled ? setControlledOpen : setInternalOpen

    const createCategory = useMutation(api.categories.create)
    const updateCategory = useMutation(api.categories.update)
    const viewer = useQuery(api.users.getViewer)
    const isManager = viewer?.role === "manager"
    const users = useQuery(api.users.getUsers, isManager ? {} : "skip")
    // console.log(users)

    const form = useForm<z.infer<typeof categorySchema>>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: initialData?.name || "",
            company: initialData?.company || "",
            responsibleUserId: initialData?.responsibleUserId || "",
        },
    })

    const onSubmit = async (data: z.infer<typeof categorySchema>) => {
        try {
            if (initialData) {
                await updateCategory({
                    id: initialData._id,
                    name: data.name,
                    company: data.company,
                    responsibleUserId: data.responsibleUserId ? (data.responsibleUserId as any) : undefined,
                })
            } else {
                await createCategory({
                    name: data.name,
                    company: data.company,
                    responsibleUserId: data.responsibleUserId ? (data.responsibleUserId as any) : undefined,
                })
            }
            setOpen?.(false)
            if (!initialData) form.reset()
            toast.success(initialData ? "Category updated successfully" : "Category added successfully", {
                description: `${data.name} has been ${initialData ? "updated" : "created"}.`,
                icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            })
        } catch (error) {
            console.error("Failed to save category:", error)
            toast.error("Failed to save category", {
                description: "Please try again later.",
            })
        }
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 gap-2">
                        <Plus className="w-4 h-4" /> Add Category
                    </Button>
                )}
            </DrawerTrigger>
            <DrawerContent className="bg-[#0B0B0D] border-t border-white/10">
                <div className="mx-auto w-full max-w-lg">
                    <DrawerHeader>
                        <DrawerTitle className="text-white text-2xl">{initialData ? "Edit Category" : "Add Category"}</DrawerTitle>
                        <DrawerDescription className="text-zinc-400">
                            {initialData ? "Update category details." : "Create a new equipment category."}
                        </DrawerDescription>
                    </DrawerHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-zinc-400">Category Name</FormLabel>
                                        <div className="relative">
                                            <Tag className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                                            <FormControl>
                                                <Input {...field} placeholder="e.g. Computers" className="pl-9 bg-white/5 border-white/10 text-white" />
                                            </FormControl>
                                        </div>
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
                                name="responsibleUserId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-zinc-400">Responsible Person (Optional)</FormLabel>
                                        <div className="relative">
                                            <select
                                                className="w-full appearance-none bg-white/5 border border-white/10 rounded-md py-2 pl-3 pr-8 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/20"
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                            >
                                                <option value="" className="bg-[#1a1a1c] text-zinc-400">Select Person</option>
                                                {users?.map((user) => (
                                                    <option key={user._id} value={user._id} className="bg-[#1a1a1c] text-white">
                                                        {user.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                                <svg className="h-4 w-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full bg-white text-black hover:bg-zinc-200 py-6 text-lg font-semibold" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (initialData ? "Update Category" : "Save Category")}
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
