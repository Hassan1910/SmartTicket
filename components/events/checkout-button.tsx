'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { initiateBooking } from '@/app/actions/booking';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CheckoutButton({ eventId, price }: { eventId: string, price: number }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const result = await initiateBooking(eventId, 1);

            if (result.error) {
                toast.error(result.error);
                if (result.error.includes('logged in')) {
                    router.push(`/login?from=/events/${eventId}`);
                }
                return;
            }

            if (result.url) {
                window.location.href = result.url;
            }
        } catch {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleCheckout}
            disabled={loading}
            size="lg"
            className="w-full text-lg font-semibold"
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                </>
            ) : (
                `Buy Ticket - KES ${price.toFixed(2)}`
            )}
        </Button>
    );
}
