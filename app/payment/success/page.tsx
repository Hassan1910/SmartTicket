import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function PaymentSuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ reference?: string }>;
}) {
    const { reference } = await searchParams;
    // const validTicket = false;

    if (reference) {
        // Optional: Check if ticket exists and is paid.
        // Webhook might be slightly delayed, so we might just check for existence or status.
        const ticket = await prisma.ticket.findFirst({
            where: { reference },
        });
        if (ticket) {
            // validTicket = true;
        }
    }

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50">
            <div className="mx-auto flex max-w-[480px] flex-col items-center justify-center text-center p-6">
                <div className="mb-8 rounded-full bg-green-100 p-4 ring-8 ring-green-50">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>

                <h1 className="mb-3 text-3xl font-bold tracking-tight text-slate-900">
                    Payment Successful!
                </h1>

                <p className="mb-8 text-lg text-slate-600">
                    Your transaction has been completed securely. Your ticket has been sent to your email and added to your account.
                </p>

                {reference && (
                    <div className="mb-8 rounded-lg bg-white p-4 text-sm text-slate-500 shadow-sm border border-slate-100 w-full">
                        <span className="block text-xs uppercase tracking-wider font-semibold mb-1">Transaction Ref</span>
                        <span className="font-mono text-slate-900">{reference}</span>
                    </div>
                )}

                <div className="flex w-full flex-col space-y-3">
                    <Link href="/dashboard/tickets" className="w-full">
                        <Button className="w-full" size="lg">
                            <span className="mr-2 h-4 w-4">🎫</span>
                            View My Tickets
                        </Button>
                    </Link>
                    <Link href="/" className="w-full">
                        <Button variant="outline" className="w-full" size="lg">
                            Return to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
