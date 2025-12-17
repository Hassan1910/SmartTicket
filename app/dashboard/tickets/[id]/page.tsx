
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import { Calendar, MapPin, Ticket as TicketIcon } from "lucide-react";

async function getTicket(ticketId: string, userId: string) {
    const ticket = await prisma.ticket.findUnique({
        where: {
            id: ticketId,
            userId: userId,
        },
        include: {
            event: true,
            user: {
                select: {
                    name: true,
                    email: true,
                }
            }
        },
    });

    return ticket;
}

export default async function TicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const { id } = await params;
    const ticket = await getTicket(id, session.user.id);

    if (!ticket) {
        notFound();
    }

    const qrData = ticket.qrCodeToken || "";

    return (
        <div className="flex-1 space-y-4 p-4 sm:p-8 sm:pt-6 pt-6">
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Ticket Details</h1>
                <p className="mt-2 text-sm sm:text-base text-muted-foreground">Your event admission ticket with QR code</p>
            </div>

            <div className="flex justify-center mt-8">
                <div className="bg-white text-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
                    <div className="bg-slate-900 p-6 text-white text-center">
                        <h3 className="text-xl font-bold mb-1">{ticket.event.title}</h3>
                        <p className="text-white/70 text-sm">Admit One</p>
                    </div>

                    <div className="p-8">
                        <div className="flex flex-col items-center justify-center mb-8">
                            <div className="bg-white p-4 rounded-xl shadow-inner border border-slate-100">
                                <QRCodeSVG value={qrData} size={200} level={"H"} />
                            </div>
                            <p className="mt-4 text-xs text-slate-400 font-mono tracking-widest">
                                {ticket.id.toUpperCase()}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Date & Time</p>
                                    <p className="font-semibold">{format(ticket.event.date, "PPP")}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-red-50 p-2 rounded-lg text-red-600">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Location</p>
                                    <p className="font-semibold">{ticket.event.location}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-green-50 p-2 rounded-lg text-green-600">
                                    <TicketIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Attendee</p>
                                    <p className="font-semibold">{ticket.user?.name || ticket.guestName || "Guest"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 border-t border-slate-100 border-dashed">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Status</span>
                            <span className="font-bold text-green-600 px-3 py-1 bg-green-100 rounded-full text-xs">
                                {ticket.status}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-3">
                            <span className="text-slate-500">Order Ref</span>
                            <span className="font-mono text-slate-700">{ticket.reference.substring(0, 8)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
