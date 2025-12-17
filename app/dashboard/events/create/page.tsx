import { EventForm } from "@/components/events/event-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Event | SmartTicket",
    description: "Create a new event",
};

export default function CreateEventPage() {
    return (
        <div className="flex-1 space-y-4 p-4 sm:p-8 sm:pt-6 pt-6">
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create Event</h1>
                <p className="mt-2 text-sm sm:text-base text-muted-foreground">Create a new event and set up your tickets</p>
            </div>
            <div className="max-w-2xl">
                <EventForm />
            </div>
        </div>
    );
}
