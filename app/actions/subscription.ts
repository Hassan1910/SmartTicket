'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { paystack } from '@/lib/paystack';
import { redirect } from 'next/navigation';

const SUBSCRIPTION_PRICES = {
    MONTHLY: 50000, // 500 KSH in kobo
    YEARLY: 480000,  // 4800 KSH in kobo
};

export async function manageSubscription(plan: 'MONTHLY' | 'YEARLY') {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error('Unauthorized');

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true, name: true },
    });

    if (!user) throw new Error('User not found');

    const amount = SUBSCRIPTION_PRICES[plan];
    const reference = `SUB_${session.user.id}_${plan}_${Date.now()}`;
    // Use NEXTAUTH_URL_INTERNAL for callback URLs (for localhost/internal access)
    // NEXTAUTH_URL is for external access but Paystack redirects to the browser
    const callbackUrl = `${process.env.NEXTAUTH_URL_INTERNAL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/subscription/payment-success?reference=${reference}&plan=${plan}`;

    try {
        console.log('Initializing subscription payment:', {
            email: user.email,
            amount,
            reference,
            plan,
            callbackUrl,
        });

        const paymentData = await paystack.initializeTransaction(
            user.email,
            amount,
            reference,
            callbackUrl,
            undefined,
            {
                plan,
                userId: session.user.id,
                type: 'subscription',
            }
        );

        console.log('Payment initialized successfully:', paymentData);

        // Redirect to Paystack payment page
        redirect(paymentData.authorization_url);
    } catch (error) {
        // Re-throw Next.js redirect errors (they have a specific structure)
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
        }

        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Subscription initialization error:', errorMessage);
        throw new Error(`Failed to initialize payment: ${errorMessage}`);
    }
}

export async function verifySubscriptionPayment(reference: string, plan: 'MONTHLY' | 'YEARLY') {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const transaction = await paystack.verifyTransaction(reference);

        // Check if payment was successful
        if (transaction.status !== 'success') {
            return { success: false, error: 'Payment was not successful' };
        }

        // Verify the amount matches
        const expectedAmount = SUBSCRIPTION_PRICES[plan];
        if (transaction.amount !== expectedAmount) {
            return { success: false, error: 'Payment amount does not match' };
        }

        // Calculate subscription end date
        const duration = plan === 'MONTHLY' ? 1 : 12; // Months
        const now = new Date();
        const subscriptionEndsAt = new Date(now.getFullYear(), now.getMonth() + duration, now.getDate());

        // Update user subscription
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                subscriptionStatus: 'ACTIVE',
                subscriptionPlan: plan,
                subscriptionEndsAt: subscriptionEndsAt,
            },
        });

        return { success: true };
    } catch (error) {
        console.error('Payment verification error:', error);
        return { success: false, error: 'Failed to verify payment' };
    }
}
