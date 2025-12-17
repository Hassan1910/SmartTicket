'use server';

import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface GuestInfo {
    email: string;
    name: string;
}

export async function initiateBooking(eventId: string, quantity: number = 1, guestInfo?: GuestInfo) {
    // Check if user is logged in
    const session = await getServerSession(authOptions);

    // Determine email and userId
    let email: string;
    let userId: string | null = null;
    let guestName: string | null = null;

    if (session && session.user && session.user.email) {
        // Logged in user
        email = session.user.email;
        userId = session.user.id;
    } else if (guestInfo && guestInfo.email && guestInfo.name) {
        // Guest checkout
        email = guestInfo.email;
        guestName = guestInfo.name;
    } else {
        return { error: 'Please provide an email address to proceed' };
    }

    try {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            return { error: 'Event not found' };
        }

        if (event.capacity > 0 && event.soldCount >= event.capacity) {
            return { error: 'Event is sold out' };
        }

        // Paystack expects amount in smallest currency unit (KES * 100)
        // event.price is in main currency unit (KES)
        // We should ensure price is valid number.
        const price = Number(event.price);
        const amount = Math.round(price * quantity * 100);

        if (amount < 0) {
            return { error: 'Invalid amount' };
        }

        // If free event, we might skip paystack, but requirement says "Paystack Integration".
        // Assuming paid events for now. Use 0 check if free tickets allowed later.

        // Check for Organizer Payment Config
        const organizer = await prisma.user.findUnique({
            where: { id: event.organizerId },
            include: { paymentConfig: true },
        });

        let secretKey: string | undefined;

        // Only use organizer's payment config if enabled
        if (organizer?.paymentConfig?.isEnabled && organizer.paymentConfig.secretKey) {
            secretKey = organizer.paymentConfig.secretKey;
        } else {
            // Require organizer to have configured their payment settings
            return { error: 'Event organizer has not configured payment settings. Please contact the organizer.' };
        }

        // Unique Reference
        const reference = `ST_${eventId}_${userId || 'GUEST'}_${Date.now()}`;
        const clientCallbackUrl = `${process.env.NEXTAUTH_URL_INTERNAL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/events/${eventId}/payment/success`;

        const transaction = await paystack.initializeTransaction(
            email,
            amount,
            reference,
            clientCallbackUrl,
            secretKey,
            {
                eventId,
                userId: userId || undefined,
                organizerId: event.organizerId, // Important for webhook to find the key
                guestEmail: guestName ? email : undefined,
                guestName: guestName || undefined,
                quantity
            }
        );

        // Create Ticket Record in DB
        await prisma.ticket.create({
            data: {
                eventId,
                userId: userId || undefined,
                // reference, status, guestEmail, guestName are correct
                reference,
                status: 'PENDING',
                guestEmail: guestName ? email : undefined,
                guestName: guestName || undefined,
                quantity: quantity,
            }
        });

        return { url: transaction.authorization_url };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to initiate checkout';
        console.error('Booking initiation error:', error);
        return { error: errorMessage };
    }
}
