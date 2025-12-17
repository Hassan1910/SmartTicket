
import Link from 'next/link';
import { Event } from '@prisma/client';
import { format } from 'date-fns';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EventCardProps {
    event: Event & {
        organizer?: {
            name: string | null;
        } | null;
    };
}

export function EventCard({ event }: EventCardProps) {
    const isSoldOut = event.soldCount >= event.capacity;
    const isFree = Number(event.price) === 0;
    const remainingSpots = event.capacity - event.soldCount;

    return (
        <Card className="group flex flex-col h-full overflow-hidden border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card">
            <div className="relative h-48 w-full bg-muted overflow-hidden">
                {event.image ? (
                    <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 transition-transform duration-500 group-hover:scale-105">
                        <span className="text-4xl font-bold text-white/90">{event.title.substring(0, 1).toUpperCase()}</span>
                    </div>
                )}
                
                <div className="absolute top-3 right-3 flex gap-2">
                    {isSoldOut ? (
                        <Badge variant="destructive" className="shadow-sm">Sold Out</Badge>
                    ) : (
                        <Badge variant={isFree ? "secondary" : "default"} className="shadow-sm bg-background/90 text-foreground hover:bg-background">
                            {isFree ? 'Free' : `KES ${Number(event.price).toFixed(2)}`}
                        </Badge>
                    )}
                </div>
            </div>

            <CardHeader className="p-5 pb-2 space-y-1">
                <div className="flex justify-between items-start gap-2">
                    <Link href={`/events/${event.id}`} className="hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-sm">
                        <h3 className="font-bold text-xl leading-tight text-foreground line-clamp-1" title={event.title}>
                            {event.title}
                        </h3>
                    </Link>
                </div>
                {event.organizer?.name && (
                    <p className="text-sm text-muted-foreground font-medium">by {event.organizer.name}</p>
                )}
            </CardHeader>

            <CardContent className="p-5 pt-2 flex-grow">
                <div className="space-y-3 mt-2 text-muted-foreground text-sm">
                    <div className="flex items-center gap-2.5">
                        <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="font-medium">{format(new Date(event.date), 'EEE, MMM d, yyyy • h:mm a')}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="truncate" title={event.location}>{event.location}</span>
                    </div>
                    {!isSoldOut && (
                        <div className="flex items-center gap-2.5 text-muted-foreground">
                            <Users className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>{remainingSpots} spots left</span>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="p-5 pt-0">
                <Button 
                    asChild 
                    className={cn(
                        "w-full font-semibold shadow-sm transition-all", 
                        isSoldOut ? "bg-muted text-muted-foreground hover:bg-muted/80" : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    )}
                    variant={isSoldOut ? "ghost" : "default"}
                    disabled={isSoldOut}
                >
                    <Link href={`/events/${event.id}`}>
                        {isSoldOut ? 'View Details' : 'Book Ticket'}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
