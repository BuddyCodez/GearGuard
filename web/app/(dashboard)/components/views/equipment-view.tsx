"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Plus, Search, Filter, MoreHorizontal, Printer, Tag, Building2, MapPin, User, Monitor, Users, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { CategoryDrawer } from "@/components/web/category-drawer"
import { EquipmentDrawer } from "@/components/web/equipment-drawer"
import { cn } from "@/lib/utils"

interface EquipmentViewProps {
    searchQuery?: string
}

export function EquipmentView({ searchQuery = "" }: EquipmentViewProps) {
    const [view, setView] = useState<"equipment" | "categories" | "teams">("equipment")
    const viewer = useQuery(api.users.getViewer)
    const isManager = viewer?.role === "manager"

    const equipment = useQuery(api.equipment.list)
    const categories = useQuery(api.categories.list)
    const teams = useQuery(api.teams.list)

    // Only managers need user lists (for showing responsible person in categories)
    // Use "skip" to prevent query execution for non-managers
    const users = useQuery(api.users.getUsers, isManager ? {} : "skip")

    // Filter equipment
    const filteredEquipment = equipment?.filter((item) => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return item.name.toLowerCase().includes(query)
    })

    // Filter categories
    const filteredCategories = categories?.filter((category) => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return category.name.toLowerCase().includes(query) || (category.company || "").toLowerCase().includes(query)
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setView("equipment")}
                        className={cn(
                            "text-sm font-medium transition-all hover:bg-white/5",
                            view === "equipment" ? "bg-indigo-500/10 text-indigo-400 shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                        )}
                    >
                        Equipment
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setView("categories")}
                        className={cn(
                            "text-sm font-medium transition-all hover:bg-white/5",
                            view === "categories" ? "bg-indigo-500/10 text-indigo-400 shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                        )}
                    >
                        Categories
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    {view === "equipment" && (
                        <EquipmentDrawer
                            trigger={
                                <Button disabled={!isManager} className={cn("bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95", !isManager && "opacity-50 cursor-not-allowed")}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Equipment
                                </Button>
                            }
                        />
                    )}
                    {view === "categories" && (
                        <CategoryDrawer
                            trigger={
                                <Button disabled={!isManager} className={cn("bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95", !isManager && "opacity-50 cursor-not-allowed")}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Category
                                </Button>
                            }
                        />
                    )}
                </div>
            </div>

            {view === "equipment" && (
                <div className="rounded-xl border border-white/10 bg-black/20 backdrop-blur-xl overflow-hidden shadow-2xl">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-white/5">
                                <TableHead className="text-zinc-400 font-medium">Name</TableHead>
                                <TableHead className="text-zinc-400 font-medium">Category</TableHead>
                                <TableHead className="text-zinc-400 font-medium">Team</TableHead>
                                <TableHead className="text-zinc-400 font-medium">Status</TableHead>
                                <TableHead className="text-right text-zinc-400 font-medium">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {equipment?.map((item) => (
                                <TableRow key={item._id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                    <TableCell className="font-medium text-zinc-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                                <Monitor className="w-4 h-4 text-indigo-400" />
                                            </div>
                                            {item.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-400">
                                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-white/5">
                                            {categories?.find(c => c._id === item.categoryId)?.name || "Unknown"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-400">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-3 h-3 text-zinc-500" />
                                            {teams?.find(t => t._id === item.maintenanceTeamId)?.name || "Unassigned"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className={cn(
                                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                            item.isScrapped
                                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        )}>
                                            {item.isScrapped ? "Scrapped" : "Active"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {isManager && (
                                            <EquipmentDrawer
                                                initialData={item}
                                                trigger={
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all">
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                }
                                            />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {equipment?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                                        No equipment found. Add some to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            {view === "categories" && (
                <div className="rounded-xl border border-white/10 bg-black/20 backdrop-blur-xl overflow-hidden shadow-2xl">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-white/5">
                                <TableHead className="text-zinc-400 font-medium">Name</TableHead>
                                <TableHead className="text-zinc-400 font-medium">Company</TableHead>
                                {isManager && <TableHead className="text-zinc-400 font-medium">Responsible Person</TableHead>}
                                <TableHead className="text-right text-zinc-400 font-medium">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories?.map((category) => (
                                <TableRow key={category._id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                    <TableCell className="font-medium text-zinc-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                                <Tag className="w-4 h-4 text-indigo-400" />
                                            </div>
                                            {category.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-400">{category.company}</TableCell>
                                    {isManager && (
                                        <TableCell className="text-zinc-400">
                                            {category.responsibleUserId ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400">
                                                        {users?.find((u: any) => u._id === category.responsibleUserId)?.name?.charAt(0) || "?"}
                                                    </div>
                                                    {users?.find((u: any) => u._id === category.responsibleUserId)?.name || "Unknown"}
                                                </div>
                                            ) : (
                                                <span className="text-zinc-600 italic">Unassigned</span>
                                            )}
                                        </TableCell>
                                    )}
                                    <TableCell className="text-right">
                                        {isManager && (
                                            <CategoryDrawer
                                                initialData={category}
                                                trigger={
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all">
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                }
                                            />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {categories?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                                        No categories found. Add some to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
