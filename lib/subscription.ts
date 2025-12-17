import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function checkSubscriptionStatus() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
        return null;
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            subscriptionStatus: true,
            trialEndsAt: true,
            subscriptionEndsAt: true,
            subscriptionPlan: true,
        },
    });

    if (!user) {
        return null;
    }

    const now = new Date();
    const isTrialActive = 
        user.subscriptionStatus === "TRIAL" &&
        user.trialEndsAt &&
        new Date(user.trialEndsAt) > now;

    const isSubscriptionActive =
        user.subscriptionStatus === "ACTIVE" &&
        user.subscriptionEndsAt &&
        new Date(user.subscriptionEndsAt) > now;

    const hasAccess = isTrialActive || isSubscriptionActive;

    return {
        ...user,
        hasAccess,
        isTrialActive,
        isSubscriptionActive,
        daysLeftInTrial: isTrialActive
            ? Math.ceil(
                (new Date(user.trialEndsAt!).getTime() - now.getTime()) /
                    (1000 * 60 * 60 * 24)
            )
            : 0,
    };
}
