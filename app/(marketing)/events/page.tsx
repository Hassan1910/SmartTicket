
import { prisma } from '@/lib/prisma';
import { EventCard } from '@/components/events/event-card';
import { EventSearch } from '@/components/events/event-search';

export const dynamic = 'force-dynamic';

export default async function EventsPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>;
}) {
    const { query } = await searchParams;
    const searchQuery = query || '';

    const events = await prisma.event.findMany({
        where: searchQuery ? {
            OR: [
                { title: { contains: searchQuery, mode: 'insensitive' } },
                { description: { contains: searchQuery, mode: 'insensitive' } },
                { location: { contains: searchQuery, mode: 'insensitive' } },
            ],
        } : undefined,
        orderBy: {
            date: 'asc',
        },
        include: {
            organizer: {
                select: {
                    name: true,
                }
            }
        }
    });

    return (
        <div className="bg-background">
            <div className="bg-card border-b">
                <div className="container mx-auto py-12 px-4 max-w-7xl">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Upcoming Events</h1>
                            <p className="text-muted-foreground text-lg max-w-2xl">
                                Discover and book tickets for amazing events happening around you.
                                From concerts to workshops, find your next experience.
                            </p>
                        </div>
                        <EventSearch />
                    </div>
                </div>
            </div>

            <div className="container mx-auto py-10 px-4 max-w-7xl">
                {events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-muted p-6 rounded-full mb-4">
                            <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">No events found</h3>
                        <p className="text-muted-foreground mt-2 max-w-sm">
                            We couldn&apos;t find any events matching &quot;{searchQuery}&quot;. Try adjusting your search terms or check back later.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
