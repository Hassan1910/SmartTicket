import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { ModeToggle } from "@/components/mode-toggle";
import { TrialBanner } from "@/components/dashboard/trial-banner";
import { Metadata } from "next";
import Link from "next/link";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
    title: "Dashboard | SmartTicket",
    description: "Manage your events and tickets",
};

async function getUserSubscriptionInfo(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
            subscriptionStatus: true, 
            trialEndsAt: true, 
            subscriptionEndsAt: true,
            subscriptionPlan: true
        }
    });

    return user;
}

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);
    let subscriptionInfo = null;

    if (session?.user?.id) {
        subscriptionInfo = await getUserSubscriptionInfo(session.user.id);
    }

    return (
        <div className="flex min-h-screen flex-col space-y-6">
            <header className="sticky top-0 z-40 border-b bg-background">
                <div className="container flex h-16 items-center justify-between py-4">
                    <div className="flex items-center gap-6 md:gap-10">
                        <MobileNav subscriptionInfo={subscriptionInfo} />
                        <span className="font-bold text-sm sm:text-base pl-2">
                            SmartTicket Organizer
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard/profile">
                            <Button variant="outline" size="icon">
                                <User className="h-[1.2rem] w-[1.2rem]" />
                                <span className="sr-only">Profile</span>
                            </Button>
                        </Link>
                        <ModeToggle />
                    </div>
                </div>
            </header>
            <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
                <aside className="hidden w-[200px] flex-col md:flex">
                    <DashboardNav subscriptionInfo={subscriptionInfo} />
                </aside>
                <main className="flex w-full flex-1 flex-col overflow-hidden">
                    {subscriptionInfo && (
                        <TrialBanner 
                            trialEndsAt={subscriptionInfo.trialEndsAt}
                            subscriptionStatus={subscriptionInfo.subscriptionStatus}
                        />
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
