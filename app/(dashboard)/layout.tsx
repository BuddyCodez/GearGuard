"use client"

import { AuthDrawer } from "@/components/web/auth-drawer"
import { useAuthDrawer } from "@/hooks/use-auth-drawer"
import { useEffect, useState } from "react"

import { UserSync } from "@/components/web/user-sync"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { isOpen, close } = useAuthDrawer()
    const [mounted, setMounted] = useState(false)

    // Prevent hydration mismatch by only rendering AuthDrawer on client
    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <>
            <UserSync />
            {children}
            {mounted && <AuthDrawer open={isOpen} onOpenChange={close} />}
        </>
    )
}
