'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ProfileView } from '@/components/dashboard/profile-view';

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user) {
        redirect('/login');
    }

    return <ProfileView user={user} />;
}
