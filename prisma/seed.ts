import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
    // Create test organizer user
    const organizer = await prisma.user.upsert({
        where: { email: 'organizer@test.com' },
        update: {},
        create: {
            email: 'organizer@test.com',
            name: 'Test Organizer',
            password: await bcrypt.hash('password123', 10),
            role: 'ORGANIZER',
            emailVerified: new Date(),
        },
    });

    console.log('Created organizer:', organizer);

    // Create payment config for organizer
    const paymentConfig = await prisma.organizerPaymentConfig.upsert({
        where: { organizerId: organizer.id },
        update: {},
        create: {
            organizerId: organizer.id,
            isEnabled: true,
            publicKey: 'pk_test_c7f8306f56b3fe44259a7e8d8a025c3f69e8102b',
            secretKey: 'sk_test_36c2a669d1feb76b51dd0bff57eccdfebea18350',
            resendApiKey: 're_ic8449Ru_Gt6ncxBWnFWeYEEqVBiMYVPo',
            emailDomain: 'tickets@bizsmart.shop',
        },
    });

    console.log('Created payment config:', paymentConfig);

    // Create test regular user
    const user = await prisma.user.upsert({
        where: { email: 'user@test.com' },
        update: {},
        create: {
            email: 'user@test.com',
            name: 'Test User',
            password: await bcrypt.hash('password123', 10),
            role: 'USER',
            emailVerified: new Date(),
        },
    });

    console.log('Created user:', user);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
