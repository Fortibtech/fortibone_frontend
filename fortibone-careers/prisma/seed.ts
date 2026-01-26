import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding...');

    const job1 = await prisma.job.create({
        data: {
            title: 'Responsable Commercial Comores',
            department: 'commercial',
            location: 'Moroni',
            type: 'CDI',
            description: 'Développer le réseau de partenaires.',
            requirements: 'Expérience B2B\nConnaissance du marché\nPermis B',
            isActive: true,
        },
    });

    const job2 = await prisma.job.create({
        data: {
            title: 'Dev Fullstack',
            department: 'tech',
            location: 'Remote',
            type: 'Freelance',
            description: 'Développer la plateforme KomoraLink.',
            requirements: 'Node.js\nReact\nPostgres',
            isActive: true,
        },
    });

    // Create default Admin User
    const password = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@komoralink.com' },
        update: {},
        create: {
            email: 'admin@komoralink.com',
            password: password,
            role: 'ADMIN',
        },
    });

    // Create second Admin User (contact)
    const passwordContact = await bcrypt.hash('26bara', 10);
    const adminContact = await prisma.user.upsert({
        where: { email: 'contact@komoralink.info' },
        update: {},
        create: {
            email: 'contact@komoralink.info',
            password: passwordContact,
            role: 'ADMIN',
        },
    });

    console.log({ job1, job2, admin, adminContact });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
