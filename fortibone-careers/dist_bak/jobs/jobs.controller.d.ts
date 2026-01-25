import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
export declare class JobsController {
    private readonly jobsService;
    constructor(jobsService: JobsService);
    create(createJobDto: CreateJobDto): import("@prisma/client").Prisma.Prisma__JobClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__JobClient<{
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
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateJobDto: UpdateJobDto): import("@prisma/client").Prisma.Prisma__JobClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__JobClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
