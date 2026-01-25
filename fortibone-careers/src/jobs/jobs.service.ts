import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class JobsService {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.JobCreateInput) {
        return this.prisma.job.create({ data });
    }

    async apply(jobId: string, data: any) {
        return this.prisma.application.create({
            data: {
                jobId,
                name: data.name,
                email: data.email,
                phone: data.phone,
                cvLink: data.cvLink,
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
}
