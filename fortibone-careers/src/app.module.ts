import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { JobsModule } from './jobs/jobs.module';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [PrismaModule, JobsModule, AuthModule],
})
export class AppModule { }
