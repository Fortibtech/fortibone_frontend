import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
export declare class ApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    create(createApplicationDto: CreateApplicationDto, req: any): import("@prisma/client").Prisma.Prisma__ApplicationClient<{
        id: string;
        status: string;
        coverLetter: string | null;
        createdAt: Date;
        updatedAt: Date;
        jobId: string;
        candidateId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<({
        candidate: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            resumeUrl: string | null;
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
        status: string;
        coverLetter: string | null;
        createdAt: Date;
        updatedAt: Date;
        jobId: string;
        candidateId: string;
    })[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__ApplicationClient<({
        candidate: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            resumeUrl: string | null;
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
        status: string;
        coverLetter: string | null;
        createdAt: Date;
        updatedAt: Date;
        jobId: string;
        candidateId: string;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateApplicationDto: UpdateApplicationDto): import("@prisma/client").Prisma.Prisma__ApplicationClient<{
        id: string;
        status: string;
        coverLetter: string | null;
        createdAt: Date;
        updatedAt: Date;
        jobId: string;
        candidateId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__ApplicationClient<{
        id: string;
        status: string;
        coverLetter: string | null;
        createdAt: Date;
        updatedAt: Date;
        jobId: string;
        candidateId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
