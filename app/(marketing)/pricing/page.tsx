"use client"

import { useState } from "react"
import Link from "next/link"
import { Check } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function PricingPage() {
    const [isAnnual, setIsAnnual] = useState(false)

    return (
        <div className="container py-10 md:py-20">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
                <h1 className="text-3xl font-bold leading-tight sm:text-5xl md:text-6xl">
                    Simple, transparent pricing
                </h1>
                <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    Choose the plan that&apos;s right for you. All plans include a 14-day free trial.
                </p>
            </div>

            <div className="flex justify-center items-center mt-8 space-x-4">
                <Label htmlFor="billing-toggle" className={!isAnnual ? "font-bold" : "text-muted-foreground"}>Monthly</Label>
                <Switch
                    id="billing-toggle"
                    checked={isAnnual}
                    onCheckedChange={setIsAnnual}
                />
                <Label htmlFor="billing-toggle" className={isAnnual ? "font-bold" : "text-muted-foreground"}>
                    Yearly <span className="text-xs text-primary ml-1 font-normal">(Save 20%)</span>
                </Label>
            </div>

            <div className="grid w-full grid-cols-1 gap-8 pt-12 md:grid-cols-3 lg:gap-12">
                {pricingData.map((plan) => {
                    const price = typeof plan.price === 'object'
                        ? (isAnnual ? plan.price.yearly : plan.price.monthly)
                        : plan.price
                    const currency = typeof plan.price === 'object' ? 'KSH' : ''
                    const period = typeof plan.price === 'object' ? (isAnnual ? '/year' : '/mo') : ''

                    return (
                        <Card key={plan.title} className={plan.popular ? "border-primary shadow-lg relative" : ""}>
                            {plan.popular && (
                                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1">
                                    Most Popular
                                </Badge>
                            )}
                            <CardHeader>
                                <CardTitle className="text-2xl">{plan.title}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="text-4xl font-bold">
                                    {currency && <span className="text-2xl align-top mr-1">{currency}</span>}
                                    {price}
                                    <span className="text-lg font-normal text-muted-foreground">{period}</span>
                                </div>
                                <ul className="grid gap-2 text-sm">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-primary" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant={plan.popular ? "default" : "outline"} asChild>
                                    <Link href="/register">Get Started</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}

const pricingData = [
    {
        title: "Basic",
        price: "Free",
        description: "Essential features for small events.",
        features: [
            "Up to 100 attendees",
            "Basic analytics",
            "Email support",
            "Standard ticket customization",
        ],
        popular: false,
    },
    {
        title: "Pro",
        price: {
            monthly: "500",
            yearly: "4,800",
        },
        description: "Advanced tools for growing organizers.",
        features: [
            "Unlimited attendees",
            "Advanced analytics",
            "Priority support",
            "Custom branding",
            "Export attendee data",
        ],
        popular: true,
    },
    {
        title: "Enterprise",
        price: "Custom",
        description: "Tailored solutions for large scale events.",
        features: [
            "Dedicated account manager",
            "SSO & Custom integrations",
            "White-labeling",
            "SLA support",
            "On-site support options",
        ],
        popular: false,
    },
]
