'use client';

import { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, CreditCard, User as UserIcon, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserProfile {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    subscriptionPlan?: string | null;
    subscriptionStatus?: string | null;
    subscriptionEndsAt?: Date | string | null;
    role?: string | null;
    createdAt?: Date | string | null;
}

interface ProfileViewProps {
    user: UserProfile;
}

export function ProfileView({ user }: ProfileViewProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Initial values
    const [name, setName] = useState(user.name || '');

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    const tabContentVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        // In a real app, we would update the user via server action or API
    };

    return (
        <motion.div
            className="space-y-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center gap-6 p-6 bg-card rounded-xl border shadow-sm">
                <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                    <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">{user.name || 'User'}</h2>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                    </div>
                </div>
                <div className="md:ml-auto flex items-center gap-3">
                    <Badge variant={user.subscriptionPlan === 'pro' ? 'default' : 'secondary'} className="px-3 py-1 text-sm capitalize">
                        {user.subscriptionPlan || 'Free'} Plan
                    </Badge>
                </div>
            </div>

            {/* Tabs Section */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="billing">Billing</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <motion.div variants={tabContentVariants} initial="hidden" animate="visible" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold capitalize">{user.role || 'User'}</div>
                                <p className="text-xs text-muted-foreground">
                                    Current role in the system
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Member Since</CardTitle>
                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Registration date
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Subscription</CardTitle>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold capitalize">{user.subscriptionStatus || 'Inactive'}</div>
                                <p className="text-xs text-muted-foreground">
                                    {user.subscriptionEndsAt
                                        ? `Ends on ${new Date(user.subscriptionEndsAt).toLocaleDateString()}`
                                        : 'No active subscription'}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                <TabsContent value="settings">
                    <motion.div variants={tabContentVariants} initial="hidden" animate="visible">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Settings</CardTitle>
                                <CardDescription>
                                    Update your personal information here.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <form onSubmit={handleSaveProfile} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Display Name</Label>
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            value={user.email || ''}
                                            disabled
                                            className="bg-muted"
                                        />
                                        <p className="text-[0.8rem] text-muted-foreground">
                                            Email changes are currently disabled.
                                        </p>
                                    </div>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                <TabsContent value="billing">
                    <motion.div variants={tabContentVariants} initial="hidden" animate="visible">
                        <Card>
                            <CardHeader>
                                <CardTitle>Billing Information</CardTitle>
                                <CardDescription>
                                    View your subscription details and billing history.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="rounded-md border p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">Current Plan</p>
                                            <p className="text-sm text-muted-foreground capitalize">
                                                {user.subscriptionPlan || 'Free'} Plan
                                            </p>
                                        </div>
                                        <Badge variant={user.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                                            {user.subscriptionStatus || 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>

                                {user.subscriptionEndsAt && (
                                    <div className="rounded-md border p-4 bg-muted/50">
                                        <div className="flex items-center gap-4">
                                            <CalendarDays className="h-5 w-5 text-muted-foreground" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">Next Billing Date</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Your subscription renews on {new Date(user.subscriptionEndsAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col gap-4 pt-4">
                                    <Button variant="outline" className="w-full sm:w-auto">
                                        Manage Subscription
                                    </Button>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t px-6 py-4">
                                <p className="text-xs text-muted-foreground">
                                    Billing is managed securely via our payment provider.
                                </p>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}
