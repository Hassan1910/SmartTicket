import { AuthForm } from "@/components/auth/auth-form";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Create an Account | SmartTicket",
    description: "Create a new account to get started",
};

export default function RegisterPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
                <p className="text-muted-foreground">
                    Enter your email below to create your account
                </p>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
                <AuthForm type="register" />
            </Suspense>
        </div>
    );
}
