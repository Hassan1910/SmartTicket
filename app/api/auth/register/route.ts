import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import * as z from "zod";
import { generateVerificationCode, sendVerificationEmail } from "@/lib/verification";

const registerSchema = z.object({
    name: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, name } = registerSchema.parse(body);

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "User with this email already exists" },
                { status: 409 }
            );
        }

        const hashedPassword = await hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: "USER", // Default role
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true
            }
        });

        // Generate verification code
        let code = "";
        try {
            code = await generateVerificationCode(user.id, email);
            console.log(`✅ Verification code generated for ${email}: ${code}`);
        } catch (codeError) {
            console.error("Failed to generate verification code:", codeError);
            throw codeError;
        }

        // Send verification email via Resend
        try {
            await sendVerificationEmail(email, code, name);
        } catch (emailError) {
            console.error("Failed to send verification email:", emailError);
            throw emailError;
        }

        return NextResponse.json({ 
            user, 
            message: "User created successfully. Please check your email for the verification code."
        }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: "Invalid input data" }, { status: 400 });
        }
        console.error("Registration error:", error);
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";
        return NextResponse.json(
            { message: errorMessage },
            { status: 500 }
        );
    }
}
