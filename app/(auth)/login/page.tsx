import { AuthForm } from "@/components/auth/auth-form";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Login | SmartTicket",
    description: "Login to your account",
};

export default function LoginPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                <p className="text-muted-foreground">
                    Enter your credentials to sign in to your account
                </p>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
                <AuthForm type="login" />
            </Suspense>
        </div>
    );
}
