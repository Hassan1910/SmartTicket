import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { EventForm } from "@/components/events/event-form";

async function getEvent(eventId: string, userId: string) {
    const event = await prisma.event.findUnique({
        where: {
            id: eventId,
            organizerId: userId,
        },
    });

    return event;
}

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const { id } = await params;
    const event = await getEvent(id, session.user.id);

    if (!event) {
        notFound();
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Edit Event</h2>
            </div>
            <div className="p-4 border rounded-lg">
                <EventForm
                    initialData={{
                        title: event.title,
                        description: event.description,
                        location: event.location,
                        date: event.date,
                        price: Number(event.price),
                        capacity: event.capacity,
                        image: event.image
                    }}
                    eventId={event.id}
                />
            </div>
        </div>
    );
}
