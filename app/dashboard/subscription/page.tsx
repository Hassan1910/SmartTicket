'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { manageSubscription } from '@/app/actions/subscription';

export default async function SubscriptionPage() {
    const session = await getServerSession(authOptions);
    if (!session) return <div>Unauthorized</div>;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { subscriptionStatus: true, trialEndsAt: true, subscriptionEndsAt: true, subscriptionPlan: true }
    });

    if (!user) return <div>User not found</div>;

    const isTrial = user.subscriptionStatus === 'TRIAL';
    const isActive = user.subscriptionStatus === 'ACTIVE';
    // const isExpired = !isTrial && !isActive; // Simplification
    // More accurate: (isTrial && trialExpired) OR (isActive && subExpired) OR expired status

    const now = new Date();
    const trialExpired = user.trialEndsAt && user.trialEndsAt < now;
    const subExpired = user.subscriptionEndsAt && user.subscriptionEndsAt < now;

    const statusDisplay = () => {
        if (isActive && !subExpired) return <span className="text-green-600 font-bold">Active ({user.subscriptionPlan})</span>;
        if (isTrial && !trialExpired) {
            const daysLeft = Math.ceil((user.trialEndsAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return <span className="text-blue-600 font-bold">Free Trial ({daysLeft} days left)</span>;
        }
        return <span className="text-red-600 font-bold">Expired</span>;
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Subscription</h2>
                    <p className="text-muted-foreground">Manage your plan and billing.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Current Status</p>
                    <div className="text-xl">{statusDisplay()}</div>
                </div>
            </div>

            {(trialExpired || subExpired) && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Subscription Expired</AlertTitle>
                    <AlertDescription>
                        Your access to create events is restricted. Please upgrade your plan to continue.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid md:grid-cols-2 gap-8">
                {/* Monthly Plan */}
                <Card className={user.subscriptionPlan === 'MONTHLY' && isActive ? 'border-primary' : ''}>
                    <CardHeader>
                        <CardTitle>Monthly Plan</CardTitle>
                        <CardDescription>Flexible billing for growing organizers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">500 KSH<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                        <ul className="mt-4 space-y-2">
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Unlimited Events</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Unlimited Tickets</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Custom Payment Gateways</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <form action={manageSubscription.bind(null, 'MONTHLY')}>
                            <Button className="w-full" disabled={isActive && user.subscriptionPlan === 'MONTHLY'}>
                                {isActive && user.subscriptionPlan === 'MONTHLY' ? 'Current Plan' : 'Subscribe Monthly'}
                            </Button>
                        </form>
                    </CardFooter>
                </Card>

                {/* Yearly Plan */}
                <Card className={user.subscriptionPlan === 'YEARLY' && isActive ? 'border-primary' : ''}>
                    <CardHeader>
                        <CardTitle>Yearly Plan</CardTitle>
                        <CardDescription>Best value for professional organizers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">4800 KSH<span className="text-sm font-normal text-muted-foreground">/year</span></div>
                        <p className="text-sm text-green-600 mt-1">Save 1200 KSH per year</p>
                        <ul className="mt-4 space-y-2">
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> All Monthly Features</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Priority Support</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Early Access to Features</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <form action={manageSubscription.bind(null, 'YEARLY')}>
                            <Button className="w-full" variant={user.subscriptionPlan === 'YEARLY' ? 'outline' : 'default'} disabled={isActive && user.subscriptionPlan === 'YEARLY'}>
                                {isActive && user.subscriptionPlan === 'YEARLY' ? 'Current Plan' : 'Subscribe Yearly'}
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
