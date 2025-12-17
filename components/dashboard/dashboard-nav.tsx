"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, CalendarPlus, LogOut, Ticket, CreditCard, Settings } from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
    {
        title: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Create Event",
        href: "/dashboard/events/create",
        icon: CalendarPlus,
    },
    {
        title: "My Tickets",
        href: "/dashboard/tickets",
        icon: Ticket
    },
    {
        title: "Subscription",
        href: "/dashboard/subscription",
        icon: CreditCard,
    },
    {
        title: "Payments",
        href: "/dashboard/settings/payments",
        icon: Settings,
    },
    {
        title: "Scan Tickets",
        href: "/admin/scan",
        icon: Ticket,
    },
];

interface DashboardNavProps {
    onNavigate?: () => void;
    subscriptionInfo?: {
        subscriptionStatus: string;
        trialEndsAt: Date | null;
        subscriptionEndsAt: Date | null;
        subscriptionPlan: string | null;
    } | null;
}

export function DashboardNav({ onNavigate, subscriptionInfo }: DashboardNavProps) {
    const pathname = usePathname();

    // Check if subscription is active or still in trial
    const isTrialActive = subscriptionInfo?.subscriptionStatus === 'TRIAL' &&
        subscriptionInfo?.trialEndsAt &&
        new Date() < new Date(subscriptionInfo.trialEndsAt);

    const isSubscriptionActive = subscriptionInfo?.subscriptionStatus === 'ACTIVE' &&
        subscriptionInfo?.subscriptionEndsAt &&
        new Date() < new Date(subscriptionInfo.subscriptionEndsAt);

    const canAccessFeatures = isTrialActive || isSubscriptionActive;

    // If subscription expired, only show subscription and profile pages
    const itemsToShow = !canAccessFeatures
        ? navItems.filter(item => item.href === "/dashboard/subscription")
        : navItems;

    return (
        <nav className="grid items-start gap-3 pl-2">
            {itemsToShow.map((item, index) => {
                const Icon = item.icon;
                return (
                    <Link
                        key={index}
                        href={item.href}
                        onClick={onNavigate}
                    >
                        <span
                            className={cn(
                                "group flex items-center rounded-md px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                pathname === item.href ? "bg-accent text-accent-foreground" : "transparent"
                            )}
                        >
                            <Icon className="mr-2 h-4 w-4" />
                            <span>{item.title}</span>
                        </span>
                    </Link>
                );
            })}
            <button
                onClick={() => {
                    signOut({ callbackUrl: "/" });
                    onNavigate?.();
                }}
                className="group flex w-full items-center rounded-md px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground text-red-500 hover:text-red-500"
            >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
            </button>
        </nav>
    );
}
