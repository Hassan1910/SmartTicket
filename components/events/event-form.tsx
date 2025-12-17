"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Loader2, CalendarIcon, AlertCircle, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";

const eventFormSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters."),
    description: z.string().min(10, "Description must be at least 10 characters."),
    location: z.string().min(2, "Location must be at least 2 characters."),
    date: z.date(),
    price: z.coerce.number().min(0, "Price must be 0 or greater."),
    capacity: z.coerce.number().min(1, "Capacity must be at least 1."),
    imageUrl: z.string().optional(),
    bannerImage: z.instanceof(File).optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
    initialData?: {
        title: string;
        description: string;
        location: string;
        date: Date;
        price: number;
        capacity: number;
        image?: string | null;
    };
    eventId?: string;
}

export function EventForm({ initialData, eventId }: EventFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<{ message: string; missingFields?: Record<string, boolean> } | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema) as any,
        defaultValues: {
            title: initialData?.title || "",
            description: initialData?.description || "",
            location: initialData?.location || "",
            date: initialData?.date || new Date(),
            price: initialData?.price || 0,
            capacity: initialData?.capacity || 100,
            imageUrl: initialData?.image || "",
        },
    });

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const removeBanner = () => {
        setBannerFile(null);
        setBannerPreview(null);
    };

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragActive(true);
        } else if (e.type === "dragleave") {
            setIsDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            const file = files[0];
            processFile(file);
        }
    };

    const processFile = (file: File) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file");
            return;
        }
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error("Image size should be less than 10MB");
            return;
        }
        setBannerFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setBannerPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    async function onSubmit(data: EventFormValues) {
        setIsLoading(true);
        setError(null);

        try {
            // Create FormData to handle file upload
            const formData = new FormData();
            formData.append("title", data.title);
            formData.append("description", data.description);
            formData.append("location", data.location);
            formData.append("date", data.date.toISOString());
            formData.append("price", data.price.toString());
            formData.append("capacity", data.capacity.toString());
            formData.append("imageUrl", data.imageUrl || "");

            if (bannerFile) {
                formData.append("bannerImage", bannerFile);
            }

            if (bannerFile) {
                formData.append("bannerImage", bannerFile);
            }

            const url = eventId ? `/api/events/${eventId}` : "/api/events";
            const method = eventId ? "PATCH" : "POST";

            const res = await fetch(url, {
                method: method,
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();

                // Handle incomplete settings error
                if (errorData.code === "INCOMPLETE_SETTINGS") {
                    setError({
                        message: errorData.message,
                        missingFields: errorData.missingFields
                    });
                    toast.error("Please complete your payment settings first");
                } else {
                    toast.error(errorData.message || "Something went wrong");
                    setError({ message: errorData.message || "Something went wrong" });
                }
                return;
            }

            toast.success(eventId ? "Event updated successfully!" : "Event created successfully!");
            router.push("/dashboard");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred");
            setError({ message: "An unexpected error occurred" });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <div className="font-semibold mb-2">{error.message}</div>
                            {error.missingFields && (
                                <div className="text-sm space-y-1">
                                    {error.missingFields.paystack && (
                                        <div>• Paystack API keys (Public & Secret)</div>
                                    )}
                                    {error.missingFields.resend && (
                                        <div>• Resend API key for email</div>
                                    )}
                                    {error.missingFields.domain && (
                                        <div>• Email domain configuration</div>
                                    )}
                                    <div className="mt-2">
                                        <a href="/dashboard/settings/payments" className="underline font-semibold hover:no-underline">
                                            Go to Settings → Payments to configure
                                        </a>
                                    </div>
                                </div>
                            )}
                        </AlertDescription>
                    </Alert>
                )}
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Event Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Annual Tech Conference 2025" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Tell us a little bit about the event"
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date: Date) =>
                                                date < new Date()
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                    <Input placeholder="Convention Center, NY" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ticket Price (KES)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormDescription>Set to 0 for free events.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Capacity</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Banner Image</FormLabel>
                            <FormControl>
                                <Input placeholder="https://example.com/banner.jpg" {...field} />
                            </FormControl>
                            <FormDescription>Or upload an image using the upload button below</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-3">
                    <FormLabel>Upload Banner Image (Optional)</FormLabel>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleBannerChange}
                        className="hidden"
                        id="banner-upload"
                    />
                    <div
                        onClick={() => {
                            console.log("Upload clicked");
                            if (fileInputRef.current) {
                                fileInputRef.current.click();
                            }
                        }}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${isDragActive
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                            }`}
                    >
                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>

                    {bannerPreview && (
                        <div className="relative w-full max-w-md">
                            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                                <Image
                                    src={bannerPreview}
                                    alt="Banner preview"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={removeBanner}
                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <p className="text-sm text-gray-600 mt-2">{bannerFile?.name}</p>
                        </div>
                    )}
                </div>

                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {eventId ? "Save Changes" : "Create Event"}
                </Button>
            </form>
        </Form>
    );
}
