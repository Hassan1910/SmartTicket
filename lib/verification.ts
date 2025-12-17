import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function generateVerificationCode(userId: string, email: string) {
  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.verificationToken.create({
    data: {
      token,
      code,
      email,
      userId,
      expires,
    },
  });

  return code;
}

export async function sendVerificationEmail(
  email: string,
  code: string,
  name?: string
) {
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log(`📧 Sending verification email to ${email}...`);

    const result = await resend.emails.send({
      from: "noreply@bizsmart.shop",
      to: email,
      subject: "Your Email Verification Code",
      html: `
        <h1>Welcome${name ? `, ${name}` : ""}!</h1>
        <p>Your email verification code is:</p>
        <h2 style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #007bff;">
          ${code}
        </h2>
        <p>This code will expire in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
      `,
    });

    if (result.error) {
      console.error("❌ Resend error:", result.error);
      throw new Error(`Resend error: ${JSON.stringify(result.error)}`);
    }

    console.log(`✅ Verification email sent successfully to ${email}`);
    console.log(`📌 Code: ${code}`);
  } catch (error) {
    console.error("❌ Failed to send verification email:", error);
    throw error;
  }
}

export async function verifyEmailCode(email: string, code: string) {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: { email, code },
    include: { user: true },
  });

  if (!verificationToken) {
    throw new Error("Invalid verification code");
  }

  if (verificationToken.expires < new Date()) {
    // Delete expired token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });
    throw new Error("Code has expired");
  }

  // Update user email verification
  await prisma.user.update({
    where: { id: verificationToken.userId },
    data: { emailVerified: new Date() },
  });

  // Delete the token
  await prisma.verificationToken.delete({
    where: { id: verificationToken.id },
  });

  return verificationToken.user;
}

