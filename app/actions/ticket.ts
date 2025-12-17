'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { paystack } from '@/lib/paystack';
import { sendTicketEmail } from '@/lib/email';
import { randomUUID } from 'crypto';

export type TicketValidationResult = {
    valid: boolean;
    message: string;
    ticket?: {
        id: string;
        status: string;
        event: {
            title: string;
            date: Date;
        };
        user: {
            name: string | null;
            email: string;
        };
    };
};

export async function validateTicket(qrCodeToken: string): Promise<TicketValidationResult> {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ORGANIZER') {
        return { valid: false, message: 'Unauthorized. Organizer access required.' };
    }

    try {
        const ticket = await prisma.ticket.findUnique({
            where: { qrCodeToken },
            include: {
                event: true,
                user: true,
            },
        });

        if (!ticket) {
            return { valid: false, message: 'Invalid Ticket. Not found in system.' };
        }

        // Check if ticket belongs to an event managed by this organizer?
        // PRD FR-14: "Does ticket belong to the current event?"
        // Usually, a scanner is set up for a specific event. 
        // For simplicity, we'll just check if the current user is the organizer of the event.
        if (ticket.event.organizerId !== session.user.id) {
            return { valid: false, message: 'Ticket does not belong to your event.' };
        }

        if (ticket.status === 'USED') {
            return {
                valid: false,
                message: 'Ticket already used.',
                ticket: {
                    id: ticket.id,
                    status: ticket.status,
                    event: {
                        title: ticket.event.title,
                        date: ticket.event.date
                    },
                    user: {
                        name: ticket.user?.name || ticket.guestName || 'Guest',
                        email: ticket.user?.email || ticket.guestEmail || 'No email'
                    }
                }
            };
        }

        if (ticket.status !== 'PAID') {
            return { valid: false, message: `Ticket status is ${ticket.status}. Not valid for entry.` };
        }

        return {
            valid: true,
            message: 'Access Granted',
            ticket: {
                id: ticket.id,
                status: ticket.status,
                event: {
                    title: ticket.event.title,
                    date: ticket.event.date
                },
                user: {
                    name: ticket.user?.name || ticket.guestName || 'Guest',
                    email: ticket.user?.email || ticket.guestEmail || 'No email'
                }
            }
        };

    } catch (error) {
        console.error('Validation error:', error);
        return { valid: false, message: 'System error during validation.' };
    }
}

export async function redeemTicket(ticketId: string) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ORGANIZER') {
        return { error: 'Unauthorized' };
    }

    try {
        await prisma.ticket.update({
            where: { id: ticketId },
            data: { status: 'USED' }
        });
        return { success: true };
    } catch (error) {
        console.error('Redemption error:', error);
        return { error: 'Failed to redeem ticket' };
    }
}

export type PaymentVerificationResult = {
    success: boolean;
    message: string;
    ticket?: {
        id: string;
        reference: string;
        event: {
            title: string;
        };
        user: {
            name: string | null;
            email: string;
        } | null;
        guestEmail: string | null;
    };
};

export async function processTicketPayment(reference: string): Promise<PaymentVerificationResult> {
    try {
        // 1. Check if ticket exists
        const ticket = await prisma.ticket.findUnique({
            where: { reference },
            include: {
                event: {
                    include: {
                        organizer: {
                            include: {
                                paymentConfig: true
                            }
                        }
                    }
                },
                user: true,
            },
        });

        if (!ticket) {
            return { success: false, message: 'Ticket not found' };
        }

        // 2. Idempotency check
        if (ticket.status === 'PAID') {
            return {
                success: true,
                message: 'Payment already verified',
                ticket: {
                    id: ticket.id,
                    reference: ticket.reference,
                    event: { title: ticket.event.title },
                    user: ticket.user,
                    guestEmail: ticket.guestEmail
                }
            };
        }

        // 3. Verify with Paystack
        // Use organizer's secret key if available, otherwise fall back to env var
        // However, paystack.verifyTransaction handles the fallback logic internally if we pass undefined
        // But we need to check if the organizer has a custom key.
        const organizerSecretKey = ticket.event.organizer.paymentConfig?.secretKey || undefined;

        const verificationData = await paystack.verifyTransaction(reference, organizerSecretKey);

        if (verificationData.status !== 'success') {
            return { success: false, message: 'Payment verification failed at gateway' };
        }

        // 4. Update Ticket Status & Generate QR (if missing)
        const qrCodeToken = ticket.qrCodeToken || randomUUID();

        const updatedTicket = await prisma.ticket.update({
            where: { id: ticket.id },
            data: {
                status: 'PAID',
                qrCodeToken: qrCodeToken
            },
            include: {
                event: true,
                user: true
            }
        });

        // 5. Send Email
        const userEmail = updatedTicket.user?.email || updatedTicket.guestEmail;
        const userName = updatedTicket.user?.name || updatedTicket.guestName || 'Guest';

        if (userEmail) {
            // Public QR server for demo/MVP purposes. 
            // In prod, generate internally or use a secure service.
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrCodeToken}`;

            await sendTicketEmail(
                userEmail,
                userName,
                updatedTicket.event.title,
                updatedTicket.id,
                qrCodeUrl,
                ticket.event.organizer.paymentConfig?.resendApiKey || undefined,
                ticket.event.organizer.paymentConfig?.emailDomain || undefined
            );
        }

        return {
            success: true,
            message: 'Payment verified and ticket sent',
            ticket: {
                id: updatedTicket.id,
                reference: updatedTicket.reference,
                event: { title: updatedTicket.event.title },
                user: updatedTicket.user,
                guestEmail: updatedTicket.guestEmail
            }
        };

    } catch (error) {
        console.error('Payment processing error:', error);
        return { success: false, message: 'Internal validation error' };
    }
}
