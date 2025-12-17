
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Ticket, Calendar, MapPin } from "lucide-react";

async function getMyTickets(userId: string) {
    const tickets = await prisma.ticket.findMany({
        where: {
            userId: userId,
            status: "PAID",
        },
        include: {
            event: true,
        },
        orderBy: {
            purchasedAt: "desc",
        },
    });

    return tickets;
}

export default async function MyTicketsPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const tickets = await getMyTickets(session.user.id);

    return (
        <div className="flex-1 space-y-4 p-4 sm:p-8 sm:pt-6 pt-6">
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Tickets</h1>
                <p className="mt-2 text-sm sm:text-base text-muted-foreground">View and manage your purchased event tickets</p>
            </div>

            <div className="mt-4">
                {tickets.length === 0 ? (
                    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                            <Ticket className="h-10 w-10 text-muted-foreground mb-4" />
                            <h3 className="mt-4 text-lg font-semibold">No tickets found</h3>
                            <p className="mb-4 mt-2 text-sm text-muted-foreground">
                                You haven&apos;t purchased any tickets yet.
                            </p>
                            <Link href="/">
                                <Button>
                                    Browse Events
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {tickets.map((ticket) => (
                            <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`}>
                                <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
                                    <div className="p-6 flex-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                                {ticket.status}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                Ref: {ticket.reference.substring(0, 8)}...
                                            </span>
                                        </div>
                                        <h3 className="font-semibold leading-none tracking-tight mb-2 text-xl">
                                            {ticket.event.title}
                                        </h3>
                                        <div className="space-y-2 text-sm text-muted-foreground mt-4">
                                            <div className="flex items-center">
                                                <Calendar className="mr-2 h-4 w-4" />
                                                <span>{format(ticket.event.date, "PPP")}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <MapPin className="mr-2 h-4 w-4" />
                                                <span className="line-clamp-1">{ticket.event.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 pt-0 mt-auto">
                                        <Button variant="outline" className="w-full">
                                            View Ticket
                                        </Button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
