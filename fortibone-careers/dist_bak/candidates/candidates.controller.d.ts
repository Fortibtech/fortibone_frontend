import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
export declare class CandidatesController {
    private readonly candidatesService;
    constructor(candidatesService: CandidatesService);
    create(createCandidateDto: CreateCandidateDto): import("@prisma/client").Prisma.Prisma__CandidateClient<{
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        resumeUrl: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findAll(): import("@prisma/client").Prisma.PrismaPromise<{
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        resumeUrl: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): import("@prisma/client").Prisma.Prisma__CandidateClient<{
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        resumeUrl: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, updateCandidateDto: UpdateCandidateDto): import("@prisma/client").Prisma.Prisma__CandidateClient<{
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        resumeUrl: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__CandidateClient<{
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        resumeUrl: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}
