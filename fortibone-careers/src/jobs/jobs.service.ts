import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class JobsService {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.JobCreateInput) {
        return this.prisma.job.create({ data });
    }

    async apply(jobId: string, data: any, file?: Express.Multer.File) {
        // Prevent duplicate application
        const existingApp = await this.prisma.application.findFirst({
            where: {
                jobId,
                email: data.email
            }
        });

        if (existingApp) {
            throw new Error('Vous avez déjà postulé à cette offre.');
        }

        const cvPath = file ? `/uploads/cv/${file.filename}` : data.cvLink; // Use uploaded file or fallback (though we want upload)

        return this.prisma.application.create({
            data: {
                jobId,
                name: data.name,
                email: data.email,
                phone: data.phone,
                cvLink: cvPath,
                message: data.message,
            },
        });
    }

    async findAll() {
        return this.prisma.job.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.job.findUnique({ where: { id } });
    }

    async update(id: string, data: Prisma.JobUpdateInput) {
        return this.prisma.job.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.job.delete({ where: { id } });
    }

    // New methods for Admin
    async getJobApplications(jobId: string) {
        return this.prisma.application.findMany({
            where: { jobId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getAllApplications() {
        return this.prisma.application.findMany({
            include: { job: true },
            orderBy: { createdAt: 'desc' },
        });
    }
}
