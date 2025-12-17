
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, CreditCard, Calendar } from "lucide-react";
import { EventActions } from "@/components/events/event-actions";



async function getEventDetails(eventId: string, userId: string) {
    const event = await prisma.event.findUnique({
        where: {
            id: eventId,
            organizerId: userId,
        },
        include: {
            tickets: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                        }
                    }
                },
                orderBy: {
                    purchasedAt: 'desc'
                }
            }
        },
    });

    return event;
}

export default async function EventManagementPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const { id } = await params;
    const event = await getEventDetails(id, session.user.id);

    if (!event) {
        notFound();
    }

    // Calculate stats
    // const totalTickets = event.tickets.reduce((sum, ticket) => sum + (ticket.quantity || 1), 0);
    const paidTickets = event.tickets
        .filter(t => t.status === 'PAID')
        .reduce((sum, ticket) => sum + (ticket.quantity || 1), 0);
    const revenue = event.tickets
        .filter(t => t.status === 'PAID')
        .reduce((sum, ticket) => sum + ((ticket.quantity || 1) * Number(event.price)), 0);

    return (
        <div className="flex-1 space-y-4 p-4 sm:p-8 sm:pt-6 pt-6">
            <div className="flex items-start sm:items-center gap-2 sm:gap-4 mb-8">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="mt-1 sm:mt-0">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{event.title}</h1>
                    <p className="text-muted-foreground flex items-center mt-2 text-sm sm:text-base flex-wrap">
                        <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                        {format(event.date, "PPP")}
                    </p>
                </div>
                <EventActions eventId={event.id} />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Total Revenue</h3>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">KES {revenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                        From {paidTickets} paid tickets
                    </p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Tickets Sold</h3>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{paidTickets} / {event.capacity}</div>
                    <p className="text-xs text-muted-foreground">
                        {((paidTickets / event.capacity) * 100).toFixed(1)}% Capacity
                    </p>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Recent Attendees</h3>
                <div className="rounded-md border">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Reference</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {event.tickets.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                            No tickets sold yet.
                                        </td>
                                    </tr>
                                ) : (
                                    event.tickets.map((ticket) => (
                                        <tr key={ticket.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle font-medium">
                                                {ticket.user?.name || ticket.guestName || "Guest"}
                                            </td>
                                            <td className="p-4 align-middle">
                                                {ticket.user?.email || ticket.guestEmail}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${ticket.status === 'PAID'
                                                    ? 'border-transparent bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                    }`}>
                                                    {ticket.status}
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle font-mono text-xs">
                                                {ticket.reference.substring(0, 10)}...
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {format(ticket.purchasedAt, 'PP')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
