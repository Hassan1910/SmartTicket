"use client";

import { checkSubscriptionStatus } from "@/lib/subscription";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export async function ProtectDashboardRoute({ children }: { children: React.ReactNode }) {
    const subscription = await checkSubscriptionStatus();

    // If no subscription info, let other parts handle auth
    if (!subscription) {
        return children;
    }

    // If they have access, show children
    if (subscription.hasAccess) {
        return children;
    }

    // If they don't have access and trying to access non-subscription page
    // Show restricted message
    return (
        <div className="flex-1 space-y-4 p-4 sm:p-8 sm:pt-6 pt-6">
            <Alert variant="destructive" className="border-red-500 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Access Restricted</AlertTitle>
                <AlertDescription className="mt-4">
                    <p className="mb-4">
                        Your free trial has ended. Please subscribe to continue using all features.
                    </p>
                    <Link href="/dashboard/subscription">
                        <Button variant="default">
                            Subscribe Now
                        </Button>
                    </Link>
                </AlertDescription>
            </Alert>
        </div>
    );
}
