"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 6);
        setCode(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (code.length !== 6) {
            toast.error("Invalid Code", {
                description: "Please enter a 6-digit code",
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch("/api/auth/verify-code", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    code,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error("Verification Failed", {
                    description: data.message || "Invalid or expired code",
                });
                return;
            }

            toast.success("Success!", {
                description: "Email verified successfully. Redirecting to login...",
            });

            setTimeout(() => {
                router.push(`/login?verified=true&email=${encodeURIComponent(email)}`);
            }, 1500);
        } catch {
            toast.error("Error", {
                description: "Something went wrong. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight">Verify Your Email</h1>
                <p className="text-muted-foreground">
                    Enter the 6-digit code sent to <strong>{email}</strong>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="code" className="text-sm font-medium">
                        Verification Code
                    </label>
                    <Input
                        id="code"
                        type="text"
                        placeholder="000000"
                        value={code}
                        onChange={handleCodeChange}
                        maxLength={6}
                        className="text-center text-2xl tracking-widest font-bold"
                        disabled={isLoading}
                        autoComplete="off"
                    />
                    <p className="text-xs text-muted-foreground">
                        Enter the code you received in your email. Code expires in 24 hours.
                    </p>
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || code.length !== 6}
                >
                    {isLoading ? "Verifying..." : "Verify Email"}
                </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
                <p>Didn&apos;t receive a code?</p>
                <Link href={`/register?email=${encodeURIComponent(email)}`} className="text-blue-600 hover:underline">
                    Back to Register
                </Link>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
