"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "./dashboard-nav";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface MobileNavProps {
    subscriptionInfo?: {
        subscriptionStatus: string;
        trialEndsAt: Date | null;
        subscriptionEndsAt: Date | null;
        subscriptionPlan: string | null;
    } | null;
}

export function MobileNav({ subscriptionInfo }: MobileNavProps) {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[200px] p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="px-1 py-4">
                    <DashboardNav onNavigate={() => setOpen(false)} subscriptionInfo={subscriptionInfo} />
                </div>
            </SheetContent>
        </Sheet>
    );
}
