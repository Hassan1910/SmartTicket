import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

async function getOrganizerStats(userId: string) {
    const events = await prisma.event.findMany({
        where: { organizerId: userId },
        include: { tickets: true },
        orderBy: { createdAt: 'desc' }
    });

    const totalEvents = events.length;
    const totalTicketsSold = events.reduce((acc, event) => acc + event.tickets.reduce((sum, ticket) => sum + (ticket.quantity || 1), 0), 0);

    // Calculate total revenue from paid tickets
    const totalRevenue = events.reduce((acc, event) => {
        const eventRevenue = event.tickets
            .filter(ticket => ticket.status === 'PAID')
            .reduce((sum, ticket) => sum + ((ticket.quantity || 1) * Number(event.price)), 0);
        return acc + eventRevenue;
    }, 0);

    return { events, totalEvents, totalTicketsSold, totalRevenue };
}

async function checkSubscriptionStatus(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            subscriptionStatus: true,
            trialEndsAt: true,
            subscriptionEndsAt: true,
            subscriptionPlan: true,
        },
    });

    if (!user) return null;

    const now = new Date();
    const isTrialActive =
        user.subscriptionStatus === "TRIAL" &&
        user.trialEndsAt &&
        new Date(user.trialEndsAt) > now;

    const isSubscriptionActive =
        user.subscriptionStatus === "ACTIVE" &&
        user.subscriptionEndsAt &&
        new Date(user.subscriptionEndsAt) > now;

    const hasAccess = isTrialActive || isSubscriptionActive;

    return { ...user, hasAccess, isTrialActive, isSubscriptionActive };
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        // Middleware should handle this, but for type safety
        return <div>Access Denied</div>;
    }

    const subscription = await checkSubscriptionStatus(session.user.id);

    if (!subscription?.hasAccess) {
        return (
            <div className="flex-1 space-y-4 p-4 sm:p-8 sm:pt-6 pt-6">
                <Alert variant="destructive" className="border-red-500 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Access Restricted</AlertTitle>
                    <AlertDescription className="mt-4">
                        <p className="mb-4">
                            Your free trial has ended. Please subscribe to continue using all features.
                        </p>
                        <Link href="/dashboard/subscription">
                            <Button variant="default">
                                Subscribe Now
                            </Button>
                        </Link>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const { events, totalEvents, totalTicketsSold, totalRevenue } = await getOrganizerStats(session.user.id);

    return (
        <div className="flex-1 space-y-4 p-4 sm:p-8 sm:pt-6 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="mt-2 text-sm sm:text-base text-muted-foreground">Welcome to your event organizer dashboard</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Link href="/dashboard/events/create">
                        <Button className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" /> Create Event
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Total Events</h3>
                    </div>
                    <div className="text-2xl font-bold">{totalEvents}</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Tickets Sold</h3>
                    </div>
                    <div className="text-2xl font-bold">{totalTicketsSold}</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Total Revenue</h3>
                    </div>
                    <div className="text-2xl font-bold">KES {totalRevenue.toFixed(2)}</div>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="mb-4 text-xl font-semibold">Recent Events</h3>
                {events.length === 0 ? (
                    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                            <h3 className="mt-4 text-lg font-semibold">No events added</h3>
                            <p className="mb-4 mt-2 text-sm text-muted-foreground">
                                You have not added any events. Add one below.
                            </p>
                            <Link href="/dashboard/events/create">
                                <Button size="sm" className="relative">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Event
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {events.slice(0, 3).map((event) => (
                            <Link key={event.id} href={`/dashboard/events/${event.id}`}>
                                <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                                    <div className="p-6">
                                        <h3 className="font-semibold leading-none tracking-tight mb-2">{event.title}</h3>
                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                            {event.description}
                                        </p>
                                        <div className="text-sm text-muted-foreground">
                                            <p>Date: {format(event.date, "PPP")}</p>
                                            <p>Location: {event.location}</p>
                                            <p>Price: KES {Number(event.price).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-8">
                <h3 className="mb-4 text-xl font-semibold">Recent Sales</h3>
                <RecentSalesList userId={session.user.id} />
            </div>
        </div>
    );
}

async function RecentSalesList({ userId }: { userId: string }) {
    const recentSales = await prisma.ticket.findMany({
        where: {
            event: {
                organizerId: userId
            },
            status: 'PAID'
        },
        take: 5,
        orderBy: {
            purchasedAt: 'desc'
        },
        include: {
            event: true,
            user: true
        }
    });

    if (recentSales.length === 0) {
        return (
            <div className="rounded-md border p-8 text-center text-muted-foreground">
                No recent sales found.
            </div>
        );
    }

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Reference</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Customer</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Event</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {recentSales.map((ticket) => (
                                <tr key={ticket.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <td className="p-4 align-middle font-mono text-xs">{ticket.reference.substring(0, 8)}</td>
                                    <td className="p-4 align-middle">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{ticket.user?.name || ticket.guestName || 'Guest'}</span>
                                            <span className="text-xs text-muted-foreground">{ticket.user?.email || ticket.guestEmail}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">{ticket.event.title}</td>
                                    <td className="p-4 align-middle">{format(ticket.purchasedAt, "PP p")}</td>
                                    <td className="p-4 align-middle text-right font-medium">
                                        KES {(Number(ticket.event.price) * (ticket.quantity || 1)).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}