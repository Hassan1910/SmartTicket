'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { 
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { initiateBooking } from '@/app/actions/booking';
import { toast } from 'sonner';
import { Loader2, Minus, Plus, Ticket } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
    name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
});

type FormValues = z.infer<typeof formSchema>;

export default function TicketPurchase({ eventId, price }: { eventId: string, price: number }) {
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
        },
    });

    const handleIncrement = () => {
        if (quantity < 10) setQuantity(prev => prev + 1);
    };

    const handleDecrement = () => {
        if (quantity > 1) setQuantity(prev => prev - 1);
    };

    const onSubmit = async (values: FormValues) => {
        setLoading(true);
        try {
            const result = await initiateBooking(eventId, quantity, values);

            if (result.error) {
                toast.error(result.error);
                return;
            }

            if (result.url) {
                window.location.href = result.url;
            }
        } catch {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="John Doe"
                                    disabled={loading}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="you@example.com"
                                    type="email"
                                    disabled={loading}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-2">
                    <Label>Number of Tickets</Label>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center justify-between gap-4">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleDecrement}
                                    disabled={quantity <= 1 || loading}
                                    type="button"
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <div className="flex flex-col items-center">
                                    <span className="text-2xl font-bold">{quantity}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {quantity === 1 ? 'Ticket' : 'Tickets'}
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleIncrement}
                                    disabled={quantity >= 10 || loading}
                                    type="button"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-muted">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total</span>
                            <span className="text-2xl font-bold">
                                KES {(price * quantity).toFixed(2)}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Button
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="w-full"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Ticket className="mr-2 h-4 w-4" />
                            Get {quantity} Ticket{quantity > 1 ? 's' : ''}
                        </>
                    )}
                </Button>
            </form>
        </Form>
    );
}
