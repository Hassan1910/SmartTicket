import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import TicketPurchase from '@/components/events/ticket-purchase';
import { Calendar, MapPin, Clock, Share2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const event = await prisma.event.findUnique({
        where: { id },
        include: { organizer: true }
    });

    if (!event) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section */}
            <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden bg-foreground/5">
                {event.image ? (
                    <>
                        <img
                            src={event.image}
                            alt={event.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-background flex items-center justify-center">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150"></div>
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 container mx-auto">
                    <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
                        <Badge className="mb-4 text-sm backdrop-blur-sm" variant="default">
                            Upcoming Event
                        </Badge>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground tracking-tight mb-4 drop-shadow-lg max-w-4xl leading-tight">
                            {event.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-lg font-medium">
                            <div className="flex items-center gap-2 bg-background/50 backdrop-blur-md px-4 py-2 rounded-full border border-border/50">
                                <Calendar className="h-5 w-5 text-primary" />
                                <span>{format(event.date, 'MMMM do, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-background/50 backdrop-blur-md px-4 py-2 rounded-full border border-border/50">
                                <MapPin className="h-5 w-5 text-destructive" />
                                <span>{event.location}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-12 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Organizer Info Card */}
                        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border flex items-center gap-4 animate-in fade-in transition-all duration-700 delay-100">
                            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border-2 border-background shadow-sm ring-1 ring-border">
                                {event.organizer.name?.[0] || 'O'}
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Organized by</p>
                                <p className="text-lg font-bold text-card-foreground">{event.organizer.name || 'Organizer'}</p>
                            </div>
                            <Button variant="outline" className="ml-auto gap-2" size="sm">
                                <Share2 className="h-4 w-4" />
                                Share
                            </Button>
                        </div>

                        {/* Description */}
                        <div className="bg-card rounded-2xl p-8 shadow-sm border border-border animate-in fade-in transition-all duration-700 delay-200">
                            <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                                <Info className="h-6 w-6 text-primary" />
                                <h2 className="text-2xl font-bold text-card-foreground">About this event</h2>
                            </div>
                            <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                                <p className="whitespace-pre-line">{event.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Ticket Purchase */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            <div className="bg-card/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl ring-1 ring-border animate-in slide-in-from-right-10 duration-700 delay-300">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-card-foreground mb-1">Get Tickets</h3>
                                    <p className="text-muted-foreground text-sm">Secure your spot today.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-end pb-4 border-b border-dashed border-border">
                                        <div>
                                            <span className="block text-sm font-medium text-muted-foreground mb-1">General Admission</span>
                                            <Badge variant="secondary" className="border-none">
                                                Available
                                            </Badge>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-3xl font-black text-card-foreground tracking-tight">
                                                ${Number(event.price).toFixed(2)}
                                            </span>
                                            <span className="text-xs text-muted-foreground font-medium">per person</span>
                                        </div>
                                    </div>

                                    <TicketPurchase eventId={event.id} price={Number(event.price)} />

                                    <div className="bg-muted rounded-xl p-4 text-xs text-muted-foreground flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                            Secure payment processing
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                            Instant ticket delivery
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
