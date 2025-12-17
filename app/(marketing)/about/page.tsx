"use client"

import { motion } from "framer-motion"
import { Users, Shield, Zap, Globe, Heart, Award } from "lucide-react"
import Link from "next/link"

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
}

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
}

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden bg-background">
                <div className="container px-4 md:px-6 relative z-10">
                    <motion.div
                        className="max-w-3xl mx-auto text-center"
                        initial="initial"
                        animate="animate"
                        variants={stagger}
                    >
                        <motion.h1
                            className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
                            variants={fadeIn}
                        >
                            Reimagining Event Experiences
                        </motion.h1>
                        <motion.p
                            className="text-xl text-muted-foreground mb-8 text-balance"
                            variants={fadeIn}
                        >
                            We&apos;re on a mission to make event organizing and attending seamless, secure, and memorable for everyone, everywhere.
                        </motion.p>
                    </motion.div>
                </div>

                {/* Background elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-16 bg-muted/30">
                <div className="container px-4 md:px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl font-bold mb-4">Our Story</h2>
                            <p className="text-muted-foreground mb-4 leading-relaxed">
                                SmartTicket was born from a simple frustration: clunky booking systems and hidden fees. We believed there had to be a better way to connect organizers with their audiences.
                            </p>
                            <p className="text-muted-foreground mb-4 leading-relaxed">
                                Founded in 2024, we set out to build a platform that puts user experience first. Whether you&apos;re hosting a local workshop or a major music festival, our tools are designed to scale with your ambition.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                Today, we&apos;re proud to power thousands of events, helping creators focus on what they do best: bringing people together.
                            </p>
                        </motion.div>
                        <motion.div
                            className="relative aspect-video rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-gray-900 to-gray-800 borderborder-border"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            {/* Placeholder for an image */}
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                                <Globe className="w-32 h-32" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20">
                <div className="container px-4 md:px-6">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-bold mb-4">Why Choose SmartTicket?</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            We&apos;re not just another ticketing platform. We&apos;re your partner in success.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary/5">
                <div className="container px-4 md:px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
                        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Join the fastest-growing community of event organizers and attendees.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/register"
                                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                            >
                                Start for Free
                            </Link>
                            <Link
                                href="/events"
                                className="inline-flex h-12 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                            >
                                Browse Events
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}

const features = [
    {
        icon: <Zap className="w-6 h-6" />,
        title: "Lightning Fast",
        description: "Experience zero-lag booking and instant ticket delivery. Speed is our priority."
    },
    {
        icon: <Shield className="w-6 h-6" />,
        title: "Secure Payments",
        description: "Bank-grade encryption ensures your transactions are safe and verified every time."
    },
    {
        icon: <Users className="w-6 h-6" />,
        title: "Community First",
        description: "Built for organizers and attendees to connect, share, and build lasting memories."
    },
    {
        icon: <GlobalIcon />,
        title: "Global Reach",
        description: "Host events anywhere, sell tickets to anyone. We support multiple currencies and locations."
    },
    {
        icon: <Heart className="w-6 h-6" />,
        title: "Passionate Support",
        description: "Our dedicated team is always here to help you succeed, 24/7."
    },
    {
        icon: <Award className="w-6 h-6" />,
        title: "Premium Experience",
        description: "A beautiful, intuitive interface that looks great on any device."
    }
]

function GlobalIcon() {
    return <Globe className="w-6 h-6" />
}
