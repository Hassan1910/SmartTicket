"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EventActionsProps {
    eventId: string;
}

export function EventActions({ eventId }: EventActionsProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const onDelete = async () => {
        try {
            setIsDeleting(true);
            const res = await fetch(`/api/events/${eventId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Failed to delete event");
            }

            toast.success("Event deleted successfully");
            router.push("/dashboard");
            router.refresh();
        } catch (error) {
            toast.error("Something went wrong");
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Link href={`/dashboard/events/${eventId}/edit`}>
                <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                </Button>
            </Link>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isDeleting}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the event and all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
