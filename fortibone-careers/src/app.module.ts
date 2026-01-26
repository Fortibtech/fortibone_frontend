import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { JobsModule } from './jobs/jobs.module';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [
        PrismaModule,
        JobsModule,
        AuthModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'uploads'),
            serveRoot: '/api/uploads',
        }),
    ],
})
export class AppModule { }
