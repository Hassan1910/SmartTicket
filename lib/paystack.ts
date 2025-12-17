import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

if (!PAYSTACK_SECRET_KEY) {
    console.warn('PAYSTACK_SECRET_KEY is not defined');
}

export const paystack = {
    /**
     * Initialize a Paystack transaction
     * @param email User's email
     * @param amount Amount in kobo (or lowest currency unit)
     * @param reference Unique transaction reference
     * @param callbackUrl URL to redirect after payment
     * @param secretKey Organizer's secret key (optional, falls back to env)
     * @param metadata Optional metadata
     */
    initializeTransaction: async (
        email: string,
        amount: number,
        reference: string,
        callbackUrl: string,
        secretKey?: string,
        metadata?: Record<string, unknown>
    ) => {
        const key = secretKey || process.env.PAYSTACK_SECRET_KEY;
        if (!key) throw new Error('Paystack Secret Key not found');

        try {
            const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${key}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    amount, // In kobo
                    reference,
                    callback_url: callbackUrl,
                    metadata,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Payment initialization failed');
            }

            const data = await response.json();
            return data.data; // Contains authorization_url, access_code, reference
        } catch (error) {
            console.error('Paystack initialization error:', error);
            throw error;
        }
    },

    /**
     * Verify a transaction (usually done via webhook, but can be manual)
     * @param reference Transaction reference
     * @param secretKey Organizer's secret key
     */
    verifyTransaction: async (reference: string, secretKey?: string) => {
        const key = secretKey || process.env.PAYSTACK_SECRET_KEY;
        if (!key) throw new Error('Paystack Secret Key not found');

        try {
            const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${key}`,
                },
            });

            if (!response.ok) {
                throw new Error('Transaction verification failed');
            }

            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Paystack verification error:', error);
            throw error;
        }
    },

    /**
     * Verify Webhook Signature
     * @param signature X-Paystack-Signature header
     * @param body Raw request body
     * @param secretKey Organizer's secret key
     */
    verifySignature: (signature: string, body: unknown, secretKey?: string): boolean => {
        const key = secretKey || process.env.PAYSTACK_SECRET_KEY;
        if (!key) return false;

        const hash = crypto
            .createHmac('sha512', key)
            .update(typeof body === 'string' ? body : JSON.stringify(body))
            .digest('hex');
        return hash === signature;
    },
};
