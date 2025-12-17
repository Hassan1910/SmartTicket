"use client"

import Link from "next/link"
import { ArrowRight, QrCode, ShieldCheck, Zap, Globe, Smartphone, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function IndexPage() {
    return (
        <>
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 lg:py-32 w-full px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium backdrop-blur-sm">
                            <span className="flex h-2 w-2 rounded-full bg-primary mr-2" />
                            v1.0 Now Available
                        </div>
                    </motion.div>

                    <motion.h1
                        className="mt-6 max-w-4xl bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent text-5xl font-bold tracking-tight sm:text-7xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        The Future of <br className="hidden sm:block" />
                        Event Ticketing
                    </motion.h1>

                    <motion.p
                        className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        Experience lightning-fast check-ins, military-grade security, and instant payouts.
                        SmartTicket redefines how you organize and attend events.
                    </motion.p>

                    <motion.div
                        className="mt-10 flex flex-wrap justify-center gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Link href="/register">
                            <Button size="lg" className="h-12 px-8 text-base">
                                Start for Free <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/events">
                            <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                                View Demo Events
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                {/* Abstract Background Elements */}
                <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 opacity-30 blur-[100px] bg-primary/20 rounded-full" />
            </section>

            {/* Features Bento Grid */}
            <section className="w-full px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
                        Everything you need. <br />
                        <span className="text-muted-foreground">Nothing you don&apos;t.</span>
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Powerful features packed into a simple, elegant interface.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 auto-rows-[minmax(250px,auto)]">
                    {/* Feature 1: Large Card (2x2) */}
                    <motion.div
                        className="md:col-span-2 md:row-span-2"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Card className="h-full bg-gradient-to-br from-card to-background border-muted/50 overflow-hidden relative flex flex-col justify-between text-center">
                            <CardHeader className="items-center">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                    <QrCode className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle className="text-2xl">Dynamic QR Codes</CardTitle>
                                <CardDescription className="text-base leading-relaxed max-w-lg mx-auto">
                                    Our proprietary anti-fraud system generates cryptographically signed QR codes.
                                    Screenshots won&apos;t work. Duplicates are impossible. Security is baked in from the start.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="relative min-h-[100px] flex-1 w-full">
                                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
                                <QrCode className="absolute -bottom-10 -right-10 w-64 h-64 text-foreground/5 dark:text-foreground/10 rotate-12" />
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Feature 2: Standard Card */}
                    <motion.div
                        className="md:col-span-1 md:row-span-1"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Card className="h-full border-muted/50 bg-card/50 backdrop-blur-sm text-center">
                            <CardHeader className="items-center">
                                <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-2">
                                    <Zap className="h-5 w-5 text-yellow-500" />
                                </div>
                                <CardTitle>Instant Check-In</CardTitle>
                                <CardDescription>
                                    Scan tickets in under 500ms. Keep the line moving.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </motion.div>

                    {/* Feature 3: Standard Card */}
                    <motion.div
                        className="md:col-span-1 md:row-span-1"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Card className="h-full border-muted/50 bg-card/50 backdrop-blur-sm text-center">
                            <CardHeader className="items-center">
                                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-2">
                                    <ShieldCheck className="h-5 w-5 text-green-500" />
                                </div>
                                <CardTitle>Bank-Grade Security</CardTitle>
                                <CardDescription>
                                    Payments processed securely via Paystack.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </motion.div>

                    {/* Feature 4: Standard Card */}
                    <motion.div
                        className="md:col-span-1 md:row-span-1"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Card className="h-full border-muted/50 bg-card/50 backdrop-blur-sm text-center">
                            <CardHeader className="items-center">
                                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-2">
                                    <Globe className="h-5 w-5 text-blue-500" />
                                </div>
                                <CardTitle>Global Reach</CardTitle>
                                <CardDescription>Accept payments from anywhere in the world.</CardDescription>
                            </CardHeader>
                        </Card>
                    </motion.div>

                    {/* Feature 5: Standard Card */}
                    <motion.div
                        className="md:col-span-1 md:row-span-1"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Card className="h-full border-muted/50 bg-card/50 backdrop-blur-sm text-center">
                            <CardHeader className="items-center">
                                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-2">
                                    <Smartphone className="h-5 w-5 text-purple-500" />
                                </div>
                                <CardTitle>Mobile First</CardTitle>
                                <CardDescription>Optimized for every device, big or small.</CardDescription>
                            </CardHeader>
                        </Card>
                    </motion.div>

                    {/* Feature 6: Standard Card */}
                    <motion.div
                        className="md:col-span-1 md:row-span-1"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Card className="h-full border-muted/50 bg-card/50 backdrop-blur-sm text-center">
                            <CardHeader className="items-center">
                                <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center mb-2">
                                    <Lock className="h-5 w-5 text-red-500" />
                                </div>
                                <CardTitle>Privacy Focused</CardTitle>
                                <CardDescription>We don&apos;t sell your attendees&apos; data.</CardDescription>
                            </CardHeader>
                        </Card>
                    </motion.div>
                </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 border-t">
                <div className="w-full flex flex-col items-center justify-center text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Ready to get started?
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Join thousands of event organizers today.
                    </p>
                    <div className="mt-8">
                        <Link href="/register">
                            <Button size="lg">Create Account</Button>
                        </Link>
                    </div>
                </div>
            </section>
        </>
    )
}
