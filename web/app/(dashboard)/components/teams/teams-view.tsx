"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Plus, Users, Search, MoreHorizontal, Pencil } from "lucide-react"
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
import { useState } from "react"
import { TeamDrawer } from "../drawers/teams/team-drawer"

interface TeamsViewProps {
    searchQuery?: string
}

export function TeamsView({ searchQuery = "" }: TeamsViewProps) {
    const teams = useQuery(api.teams.list)

    const filteredTeams = teams?.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (team.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-4">
            {/* Header Actions */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1"></div>
                <TeamDrawer
                    trigger={
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95">
                            <Plus className="w-4 h-4 mr-2" />
                            New Team
                        </Button>
                    }
                />
            </div>

            {/* Teams Table */}
            <div className="rounded-xl border border-white/10 bg-black/20 backdrop-blur-xl overflow-hidden shadow-2xl">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/5 hover:bg-white/5">
                            <TableHead className="text-zinc-400 font-medium">Team Name</TableHead>
                            <TableHead className="text-zinc-400 font-medium">Description</TableHead>
                            <TableHead className="text-zinc-400 font-medium">Members</TableHead>
                            <TableHead className="text-right text-zinc-400 font-medium">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTeams?.map((team) => (
                            <TableRow key={team._id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                <TableCell className="font-medium text-zinc-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                            <Users className="w-4 h-4 text-indigo-400" />
                                        </div>
                                        {team.name}
                                    </div>
                                </TableCell>
                                <TableCell className="text-zinc-400 max-w-xs truncate">
                                    {team.description || "-"}
                                </TableCell>
                                <TableCell>
                                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-white/5">
                                        {team.memberCount} members
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <TeamDrawer
                                        initialData={team}
                                        trigger={
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all">
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                        }
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredTeams?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                                    No teams found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
