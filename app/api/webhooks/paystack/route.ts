import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTicketEmail } from '@/lib/email';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get('x-paystack-signature');

        if (!signature || !process.env.PAYSTACK_SECRET_KEY) {
            console.error('Missing signature or PAYSTACK_SECRET_KEY');
            return NextResponse.json({ message: 'Missing signature or config' }, { status: 400 });
        }

        const event = JSON.parse(rawBody);

        // Extract organizerId from metadata if available (to finding the correct key)
        const metadata = event.data?.metadata;
        const organizerId = metadata?.organizerId;

        let secretKey = process.env.PAYSTACK_SECRET_KEY; // Default to platform key

        if (organizerId) {
            const config = await prisma.organizerPaymentConfig.findUnique({
                where: { organizerId },
            });
            if (config?.isEnabled && config.secretKey) {
                secretKey = config.secretKey;
            }
        }

        if (!secretKey) {
            console.error('No secret key found for signature verification');
            return NextResponse.json({ message: 'Configuration error' }, { status: 500 });
        }

        const hash = crypto
            .createHmac('sha512', secretKey)
            .update(rawBody)
            .digest('hex');

        if (hash !== signature) {
            console.error('Invalid Paystack signature');
            return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
        }

        if (event.event === 'charge.success') {
            console.log('Processing charge.success for ref:', event.data.reference);
            const { reference, metadata } = event.data;

            // Extract metadata or parse reference
            let eventId = metadata?.eventId;
            let userId = metadata?.userId;
            const guestEmail = metadata?.guestEmail;
            const guestName = metadata?.guestName;
            const quantity = Number(metadata?.quantity) || 1;

            if (!eventId) {
                // Fallback to parsing reference
                const parts = reference.split('_');
                if (parts.length >= 3 && parts[0] === 'ST') {
                    eventId = parts[1];
                    userId = parts[2];
                }
            }

            if (!eventId) {
                console.error('Invalid reference/metadata:', reference);
                const ex = await prisma.ticket.findFirst({ where: { reference } });
                if (ex) return NextResponse.json({ message: 'Processed already' }, { status: 200 });
                return NextResponse.json({ message: 'Invalid reference info' }, { status: 200 });
            }

            // Idempotency: Check if any ticket with this reference exists
            const existing = await prisma.ticket.findFirst({
                where: { reference },
            });

            if (existing) {
                console.log('Tickets already exist for ref:', reference);
                return NextResponse.json({ message: 'Tickets already processed' }, { status: 200 });
            }

            try {
                // Atomic transaction: Create N tickets and update soldCount
                await prisma.$transaction(async (tx) => {
                    for (let i = 0; i < quantity; i++) {
                        const qrCodeToken = `TIC-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
                        await tx.ticket.create({
                            data: {
                                userId: userId || null,
                                eventId,
                                reference,
                                status: 'PAID',
                                qrCodeToken,
                                guestEmail: guestEmail || null,
                                guestName: guestName || null,
                            },
                        });
                    }

                    await tx.event.update({
                        where: { id: eventId },
                        data: { soldCount: { increment: quantity } },
                    });
                });

                console.log(`Created ${quantity} tickets for ref: ${reference}`);

                // Send Emails
                const tickets = await prisma.ticket.findMany({
                    where: { reference },
                    include: {
                        user: true,
                        event: {
                            include: {
                                organizer: {
                                    include: {
                                        paymentConfig: true
                                    }
                                }
                            }
                        }
                    },
                });

                await Promise.all(
                    tickets.map((ticket) => {
                        // Use external API for QR Code
                        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(ticket.qrCodeToken || '')}`;

                        // Use guest email/name if available, otherwise use user data
                        const recipientEmail = ticket.guestEmail || ticket.user?.email;
                        const recipientName = ticket.guestName || ticket.user?.name || 'Valued Guest';

                        if (recipientEmail) {
                            return sendTicketEmail(
                                recipientEmail,
                                recipientName,
                                ticket.event.title,
                                ticket.id,
                                qrCodeUrl,
                                ticket.event.organizer.paymentConfig?.resendApiKey || undefined,
                                ticket.event.organizer.paymentConfig?.emailDomain || undefined
                            );
                        }
                        return Promise.resolve();
                    })
                );

                return NextResponse.json({ message: 'Tickets created successfully' }, { status: 200 });
            } catch (error) {
                console.error('Transaction error:', error);
                return NextResponse.json({ message: 'Error processing tickets' }, { status: 500 });
            }
        }

        return NextResponse.json({ message: 'Event received' }, { status: 200 });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
