'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { verifySubscriptionPayment } from '@/app/actions/subscription';

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/10">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Loading...</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    );
}

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const reference = searchParams.get('reference') || searchParams.get('trxref');
    const plan = searchParams.get('plan') as 'MONTHLY' | 'YEARLY' | undefined;

    useEffect(() => {
        const verifyPayment = async () => {
            if (!reference || !plan) {
                setErrorMessage('Missing payment reference or plan information.');
                setStatus('error');
                return;
            }

            try {
                const result = await verifySubscriptionPayment(reference, plan);

                if (result.success) {
                    setStatus('success');
                    // Redirect to subscription page after 2 seconds
                    setTimeout(() => {
                        router.push('/dashboard/subscription');
                    }, 2000);
                } else {
                    setErrorMessage(result.error || 'Payment verification failed.');
                    setStatus('error');
                }
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
                setErrorMessage(errorMsg);
                setStatus('error');
                console.error('Payment verification error:', error);
            }
        };

        verifyPayment();
    }, [reference, plan, router]);

    if (status === 'verifying') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/10">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Verifying Payment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                        <p className="text-center text-muted-foreground">Please wait while we verify your payment...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/10">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Payment Successful</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-center">
                            <CheckCircle className="h-12 w-12 text-green-500" />
                        </div>
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>Your subscription has been activated. Redirecting you now...</AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/10">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Payment Error</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Verification Failed</AlertTitle>
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </div>
    );
}
