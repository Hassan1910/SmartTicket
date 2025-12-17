import { NextResponse } from "next/server";
import { verifyEmailCode } from "@/lib/verification";
import * as z from "zod";

const verifyCodeSchema = z.object({
    email: z.string().email(),
    code: z.string().length(6).regex(/^\d+$/, "Code must be 6 digits"),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, code } = verifyCodeSchema.parse(body);

        const user = await verifyEmailCode(email, code);

        return NextResponse.json({
            user,
            message: "Email verified successfully. You can now log in.",
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Verification failed";
        console.error("Verification error:", error);
        return NextResponse.json({ message }, { status: 400 });
    }
}
