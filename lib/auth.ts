import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
        maxAge: 12 * 60 * 60, // 12 hours
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "Sign in",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "hello@example.com",
                },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                });

                if (!user || !user.password) {
                    return null;
                }

                // Check if email is verified
                if (!user.emailVerified) {
                    throw new Error("Please verify your email before logging in");
                }

                const isPasswordValid = await compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id + "",
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async session({ session, token }: { session: Session; token: JWT }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role;
            }
            return session;
        },
        async jwt({ token, user }: { token: JWT; user?: { id: string; role: string } }) {
            if (user) {
                // user is only passed on initial sign in
                return {
                    ...token,
                    id: user.id,
                    role: user.role,
                };
            }
            return token;
        },
    },
};
