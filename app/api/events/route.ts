import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as z from "zod";

const eventSchema = z.object({
    title: z.string().min(2),
    description: z.string().min(10),
    location: z.string().min(2),
    date: z.string(), // date string from JSON
    price: z.number().min(0),
    capacity: z.number().min(1),
    imageUrl: z.string().optional().or(z.literal("")),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        
        // Extract form fields
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const location = formData.get("location") as string;
        const date = formData.get("date") as string;
        const price = parseFloat(formData.get("price") as string);
        const capacity = parseInt(formData.get("capacity") as string);
        const imageUrl = (formData.get("imageUrl") as string) || "";
        const bannerImage = formData.get("bannerImage") as File | null;

        // Validate basic fields
        const validationData = {
            title,
            description,
            location,
            date,
            price,
            capacity,
            imageUrl
        };

        eventSchema.parse(validationData);

        // Check for Subscription
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                subscriptionStatus: true,
                trialEndsAt: true,
                subscriptionEndsAt: true,
                paymentConfig: true
            }
        });

        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        const now = new Date();
        const isTrialActive = user.subscriptionStatus === 'TRIAL' && user.trialEndsAt && user.trialEndsAt > now;
        const isSubscriptionActive = user.subscriptionStatus === 'ACTIVE' && user.subscriptionEndsAt && user.subscriptionEndsAt > now;

        if (!isTrialActive && !isSubscriptionActive) {
            return NextResponse.json({
                message: "Subscription expired. Please upgrade to continue creating events.",
                code: "SUBSCRIPTION_REQUIRED"
            }, { status: 403 });
        }

        // Check if organizer has configured required payment and email settings
        const paymentConfig = user.paymentConfig;
        const isPaystackConfigured = paymentConfig?.isEnabled && paymentConfig?.publicKey && paymentConfig?.secretKey;
        const isResendConfigured = paymentConfig?.resendApiKey;
        const isDomainConfigured = paymentConfig?.emailDomain;

        if (!isPaystackConfigured || !isResendConfigured || !isDomainConfigured) {
            const missingFields: string[] = [];
            if (!isPaystackConfigured) missingFields.push("Paystack API keys");
            if (!isResendConfigured) missingFields.push("Resend API key");
            if (!isDomainConfigured) missingFields.push("Email domain");

            return NextResponse.json({
                message: `Please configure the following settings before creating events: ${missingFields.join(", ")}. Go to Settings > Payments to configure.`,
                code: "INCOMPLETE_SETTINGS",
                missingFields: {
                    paystack: !isPaystackConfigured,
                    resend: !isResendConfigured,
                    domain: !isDomainConfigured
                }
            }, { status: 400 });
        }

        // Handle banner image upload
        let finalImageUrl = imageUrl;
        if (bannerImage) {
            try {
                const buffer = await bannerImage.arrayBuffer();
                const base64 = Buffer.from(buffer).toString("base64");
                finalImageUrl = `data:${bannerImage.type};base64,${base64}`;
            } catch (error) {
                console.error("Error processing banner image:", error);
                return NextResponse.json(
                    { message: "Failed to process banner image" },
                    { status: 400 }
                );
            }
        }

        const event = await prisma.event.create({
            data: {
                title,
                description,
                location,
                date: new Date(date),
                price,
                capacity,
                image: finalImageUrl || null,
                organizerId: session.user.id,
            },
        });

        // Update user role to ORGANIZER if not already (Optional logic based on PRD: "System must distinguish... or allow a single user to act as both")
        // For now, let's keep it simple. If they create an event, they are effectively an organizer.
        if (session.user.role === "USER") {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { role: "ORGANIZER" },
            });
        }

        return NextResponse.json(event, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: "Invalid input data", errors: error.issues }, { status: 400 });
        }
        console.error("Failed to create event:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        // Optional: Filter by organizer if query param exists
        const { searchParams } = new URL(req.url);
        const organizerId = searchParams.get("organizerId");

        const whereClause = organizerId ? { organizerId } : {};

        const events = await prisma.event.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            include: {
                organizer: {
                    select: { name: true, email: true }
                }
            }
        });

        return NextResponse.json(events);
    } catch (error) {
        console.error("Failed to fetch events:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
