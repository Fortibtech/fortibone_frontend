import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class ApplicationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createApplicationDto: CreateApplicationDto): import("@prisma/client").Prisma.Prisma__ApplicationClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        jobId: string;
        candidateId: string;
        coverLetter: string | null;
        status: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        candidate: {
            email: string;
            password: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            resumeUrl: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        job: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            department: string;
            location: string;
            type: string;
            description: string;
            requirements: string;
            isActive: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        jobId: string;
        candidateId: string;
        coverLetter: string | null;
        status: string;
    })[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__ApplicationClient<({
        candidate: {
            email: string;
            password: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            resumeUrl: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        };
        job: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            department: string;
            location: string;
            type: string;
            description: string;
            requirements: string;
            isActive: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        jobId: string;
        candidateId: string;
        coverLetter: string | null;
        status: string;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateApplicationDto: UpdateApplicationDto): import("@prisma/client").Prisma.Prisma__ApplicationClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        jobId: string;
        candidateId: string;
        coverLetter: string | null;
        status: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__ApplicationClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        jobId: string;
        candidateId: string;
        coverLetter: string | null;
        status: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
