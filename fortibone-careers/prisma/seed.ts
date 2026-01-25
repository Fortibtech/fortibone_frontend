import { PrismaClient } from '@prisma/client';

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

    console.log({ job1, job2 });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
