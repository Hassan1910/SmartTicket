import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { processTicketPayment } from '@/app/actions/ticket';
import { Suspense } from 'react';

async function PaymentResult({ reference }: { reference: string }) {
    const result = await processTicketPayment(reference);

    if (!result.success) {
        return (
            <div className="flex flex-col items-center">
                <div className="mb-8 rounded-full bg-red-500/10 p-6 ring-1 ring-red-500/20">
                    <XCircle className="h-16 w-16 text-red-500" />
                </div>
                <h1 className="mb-4 text-3xl font-bold text-foreground">Payment Verification Failed</h1>
                <p className="mb-8 max-w-md text-muted-foreground text-center">
                    {result.message}
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center">
            <div className="mb-8 rounded-full bg-green-500/10 p-6 ring-1 ring-green-500/20">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-foreground">Payment Successful!</h1>
            <p className="mb-2 max-w-md text-muted-foreground">
                Your transaction has been verified.
            </p>
            <p className="mb-8 max-w-md text-foreground font-medium">
                We have sent the ticket to your email: {result.ticket?.user?.email || result.ticket?.guestEmail}
            </p>

            {/* Ticket Snapshot */}
            <div className="p-4 bg-muted/50 rounded-lg border border-border mb-8 max-w-sm w-full text-left">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Event</p>
                <p className="text-lg font-bold mb-4">{result.ticket?.event.title}</p>

                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Ticket ID</p>
                <code className="text-sm font-mono text-foreground break-all">{result.ticket?.id}</code>
            </div>
        </div>
    )
}

function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Verifying payment...</p>
        </div>
    )
}

export default async function PaymentSuccessPage({
    searchParams,
    params
}: {
    searchParams: Promise<{ reference: string }>,
    params: Promise<{ id: string }>
}) {
    const { reference } = await searchParams;
    const { id } = await params;

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
            <Suspense fallback={<LoadingState />}>
                <PaymentResult reference={reference} />
            </Suspense>

            <div className="p-4 bg-muted/50 rounded-lg border border-border mb-8 max-w-sm w-full">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">Transaction Reference</p>
                <code className="text-sm font-mono text-foreground break-all">{reference}</code>
            </div>

            <div className="flex gap-4">
                <Link href="/dashboard">
                    <Button variant="outline">Go to Dashboard</Button>
                </Link>
                <Link href={`/events/${id}`}>
                    <Button>Back to Event</Button>
                </Link>
            </div>
        </div>
    );
}
