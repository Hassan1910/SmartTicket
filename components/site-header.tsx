"use client"

import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Ticket } from "lucide-react"

interface UserProfile {
    name?: string | null;
    email?: string | null;
    image?: string | null;
}

export function SiteHeader({ user }: { user?: UserProfile }) {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="w-full px-4 sm:px-6 lg:px-8 flex h-14 items-center max-w-7xl mx-auto">
                <div className="mr-4 flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <Ticket className="h-6 w-6" />
                        <span className="hidden font-bold sm:inline-block">
                            SmartTicket
                        </span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link
                            href="/events"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Events
                        </Link>
                        <Link
                            href="/pricing"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Pricing
                        </Link>
                        <Link
                            href="/about"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            About
                        </Link>
                    </nav>
                </div>
                <div className="flex flex-1 items-center justify-end space-x-2">
                    <nav className="flex items-center space-x-2">
                        {user ? (
                            <Link href="/dashboard">
                                <Button size="sm">Dashboard</Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">Login</Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm">Get Started</Button>
                                </Link>
                            </>
                        )}
                        <ModeToggle />
                    </nav>
                </div>
            </div>
        </header>
    )
}
