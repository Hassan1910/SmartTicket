'use client';

import { AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TrialBannerProps {
    trialEndsAt: Date | null;
    subscriptionStatus: string;
}

export function TrialBanner({ trialEndsAt, subscriptionStatus }: TrialBannerProps) {
    if (subscriptionStatus !== 'TRIAL' || !trialEndsAt) {
        return null;
    }

    const now = new Date();
    const daysLeft = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const trialExpired = daysLeft <= 0;

    if (trialExpired) {
        return (
            <Alert variant="destructive" className="mb-6 border-red-500 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Trial Period Expired</AlertTitle>
                <AlertDescription className="mt-2">
                    Your 14-day free trial has ended. Please subscribe to continue creating events and managing your tickets.
                    <div className="mt-4">
                        <Link href="/dashboard/subscription">
                            <Button size="sm" variant="default">
                                Subscribe Now
                            </Button>
                        </Link>
                    </div>
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-900">
                Free Trial Period
            </AlertTitle>
            <AlertDescription className="text-blue-800 mt-2">
                You have <span className="font-bold">{daysLeft} day{daysLeft !== 1 ? 's' : ''}</span> left in your free trial. 
                <Link href="/dashboard/subscription" className="font-semibold hover:underline ml-1">
                    Subscribe now
                </Link>
                {' '}to continue using SmartTicket after your trial ends.
            </AlertDescription>
        </Alert>
    );
}
