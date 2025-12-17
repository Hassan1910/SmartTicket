"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const authSchema = z.object({
    name: z.string().optional(),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

interface AuthFormProps {
    type: "login" | "register";
}

export function AuthForm({ type }: AuthFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AuthFormData>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    async function onSubmit(data: AuthFormData) {
        setIsLoading(true);
        setError(null);

        try {
            if (type === "register") {
                // Register flow
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: data.name,
                        email: data.email,
                        password: data.password,
                    }),
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || "Registration failed");
                }

                // Redirect to email verification page
                router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);

            } else {
                // Login flow
                const signInResult = await signIn("credentials", {
                    email: data.email,
                    password: data.password,
                    redirect: false,
                });

                if (signInResult?.error) {
                    // Providing more user-friendly error messages
                    if (signInResult.error === "CredentialsSignin") {
                        throw new Error("Invalid email or password");
                    }
                    throw new Error(signInResult.error);
                }

                // Get the redirect URL from the 'from' query parameter, default to dashboard
                const from = searchParams?.get("from") || "/dashboard";

                // Successful login - navigate to the original page or dashboard
                router.push(from);
                // Force a page reload to ensure middleware runs with valid token
                router.refresh();
            }

        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Something went wrong';
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="grid gap-6">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4">
                    {type === "register" && (
                        <div className="grid gap-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="name">
                                Name
                            </label>
                            <input
                                id="name"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="John Doe"
                                type="text"
                                disabled={isLoading}
                                {...register("name")}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>
                    )}

                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="name@example.com"
                            type="email"
                            disabled={isLoading}
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            type="password"
                            disabled={isLoading}
                            {...register("password")}
                        />
                        {errors.password && (
                            <p className="text-sm text-red-500">{errors.password.message}</p>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-500/15 p-3 rounded-md text-sm text-red-500">
                            {error}
                        </div>
                    )}

                    <button
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                        disabled={isLoading}
                        type="submit"
                    >
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {type === "login" ? "Sign In" : "Create Account"}
                    </button>
                </div>
            </form>
            <div className="text-center text-sm">
                {type === "login" ? (
                    <p className="text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="font-semibold text-primary hover:underline">
                            Sign up
                        </Link>
                    </p>
                ) : (
                    <p className="text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="font-semibold text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
}
