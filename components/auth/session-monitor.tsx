"use client"

import { useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"

export function SessionMonitor() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()
    const [hasShownToast, setHasShownToast] = useState(false)

    useEffect(() => {
        // If we're on the login or register page, don't monitor session
        if (pathname?.startsWith("/login") || pathname?.startsWith("/register")) {
            return
        }

        // If session becomes unauthenticated (expired) but we were just on a protected page
        // Note: status changes from "loading" -> "authenticated" -> "unauthenticated" (on expiry)
        // We need to be careful not to trigger this immediately on page load if user is just not logged in.

        // However, the requirement is "Session Expired". This usually implies the user WAS logged in.
        // Detecting "Was logged in" can be tricky solely with useSession if we don't track previous state.
        // But next-auth handles expiration by setting status to unauthenticated.

        // A simple approach: 
        // If the server returns 401/unauthorized, next-auth usually handles it.
        // But for client-side idle expiry:
        // If we are in a protected route and status is unauthenticated, we should redirect.
        // Since we don't have a list of all protected routes here easily without middleware knowledge,
        // we can rely on standard middleware for protection.

        // BUT the requirement is "Session Expired" notification. 
        // If the user *was* active and the session dies, they might be on a dashboard page.

        // Let's rely on an interval check or just the fact that useSession updates.

        // Actually, a specific "Session Expired" message usually means distinguishing between "Never logged in" and "Logged in then expired".
        // For now, let's keep it simple: if we are on a known protected path (like /dashboard) and status is unauthenticated, show toast and redirect.

        if (status === "unauthenticated" && pathname?.startsWith("/dashboard")) {
            if (!hasShownToast) {
                toast.error("Session Expired", {
                    description: "Your session has expired. Please log in again."
                })
                setHasShownToast(true)
                router.push("/login")
            }
        }

        // Reset toast flag if we become authenticated again (unlikely without reload, but good practice)
        if (status === "authenticated") {
            setHasShownToast(false)
        }

    }, [status, pathname, router, hasShownToast])

    return null
}
