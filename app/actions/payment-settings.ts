'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getPaymentConfig() {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error('Unauthorized');

    const config = await prisma.organizerPaymentConfig.findUnique({
        where: { organizerId: session.user.id },
    });

    return config;
}

export async function validateOrganizerSettings() {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error('Unauthorized');

    const config = await prisma.organizerPaymentConfig.findUnique({
        where: { organizerId: session.user.id },
    });

    // Check if all required fields are configured
    const isPaystackConfigured = config?.isEnabled && config?.publicKey && config?.secretKey;
    const isResendConfigured = config?.resendApiKey;
    const isDomainConfigured = config?.emailDomain;

    return {
        isComplete: isPaystackConfigured && isResendConfigured && isDomainConfigured,
        missingFields: {
            paystack: !isPaystackConfigured,
            resend: !isResendConfigured,
            domain: !isDomainConfigured,
        },
    };
}

export async function savePaymentConfig(data: { isEnabled: boolean; publicKey: string; secretKey: string; resendApiKey?: string; emailDomain?: string }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error('Unauthorized');

    await prisma.organizerPaymentConfig.upsert({
        where: { organizerId: session.user.id },
        update: {
            isEnabled: data.isEnabled,
            publicKey: data.publicKey,
            secretKey: data.secretKey,
            resendApiKey: data.resendApiKey,
            emailDomain: data.emailDomain,
        },
        create: {
            organizerId: session.user.id,
            isEnabled: data.isEnabled,
            publicKey: data.publicKey,
            secretKey: data.secretKey,
            resendApiKey: data.resendApiKey,
            emailDomain: data.emailDomain,
        },
    });

    revalidatePath('/dashboard/settings/payments');
    return { success: true };
}
