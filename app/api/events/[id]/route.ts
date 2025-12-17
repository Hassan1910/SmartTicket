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

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const event = await prisma.event.findUnique({
            where: {
                id,
                organizerId: session.user.id
            }
        });

        if (!event) {
            return NextResponse.json({ message: "Event not found" }, { status: 404 });
        }

        return NextResponse.json(event);
    } catch (error) {
        console.error("Failed to fetch event:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership
        const event = await prisma.event.findUnique({
            where: {
                id,
                organizerId: session.user.id
            }
        });

        if (!event) {
            return NextResponse.json({ message: "Event not found or unauthorized" }, { status: 404 });
        }

        await prisma.event.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Failed to delete event:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership
        const existingEvent = await prisma.event.findUnique({
            where: {
                id,
                organizerId: session.user.id
            }
        });

        if (!existingEvent) {
            return NextResponse.json({ message: "Event not found or unauthorized" }, { status: 404 });
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

        const updatedEvent = await prisma.event.update({
            where: { id },
            data: {
                title,
                description,
                location,
                date: new Date(date),
                price,
                capacity,
                image: finalImageUrl || null,
            },
        });

        return NextResponse.json(updatedEvent);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: "Invalid input data", errors: error.issues }, { status: 400 });
        }
        console.error("Failed to update event:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
