import { NextRequest, NextResponse } from 'next/server';
import { paystack } from '@/lib/paystack';
import { prisma } from '@/lib/prisma';

const SUBSCRIPTION_PRICES: Record<string, number> = {
    MONTHLY: 50000, // 500 KSH in kobo
    YEARLY: 480000,  // 4800 KSH in kobo
};

export async function POST(req: NextRequest) {
    try {
        // Verify the signature
        const signature = req.headers.get('x-paystack-signature');
        if (!signature) {
            return NextResponse.json({ message: 'No signature provided' }, { status: 400 });
        }

        const body = await req.text();
        const isValid = paystack.verifySignature(signature, body);

        if (!isValid) {
            console.error('Invalid Paystack signature');
            return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
        }

        const event = JSON.parse(body);

        // Only process successful charge events
        if (event.event !== 'charge.success') {
            return NextResponse.json({ message: 'Event ignored' }, { status: 200 });
        }

        const data = event.data;
        const { metadata, amount } = data;
        // const { reference, customer } = data; // Unused variables

        // Verify this is a subscription payment
        if (!metadata?.type || metadata.type !== 'subscription') {
            return NextResponse.json({ message: 'Not a subscription payment' }, { status: 200 });
        }

        const plan = metadata.plan as 'MONTHLY' | 'YEARLY';
        const userId = metadata.userId;

        // Verify amount matches
        const expectedAmount = SUBSCRIPTION_PRICES[plan];
        if (amount !== expectedAmount) {
            console.error(`Amount mismatch: expected ${expectedAmount}, got ${amount}`);
            return NextResponse.json({ message: 'Amount mismatch' }, { status: 400 });
        }

        // Calculate subscription end date
        const duration = plan === 'MONTHLY' ? 1 : 12; // Months
        const now = new Date();
        const subscriptionEndsAt = new Date(now.getFullYear(), now.getMonth() + duration, now.getDate());

        // Update user subscription
        await prisma.user.update({
            where: { id: userId },
            data: {
                subscriptionStatus: 'ACTIVE',
                subscriptionPlan: plan,
                subscriptionEndsAt: subscriptionEndsAt,
            },
        });

        console.log(`Subscription activated for user ${userId}: ${plan} plan`);

        return NextResponse.json({ message: 'Webhook processed' }, { status: 200 });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json(
            { message: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}
