import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
    constructor(private readonly jobsService: JobsService) { }

    @Post()
    create(@Body() createJobDto: any) {
        // Basic mapping, assuming DTO matches schema
        return this.jobsService.create(createJobDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/apply')
    @UseInterceptors(FileInterceptor('cv', {
        storage: diskStorage({
            destination: './uploads/cv',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    apply(@Param('id') id: string, @Body() applicationDto: any, @UploadedFile() file: Express.Multer.File) {
        return this.jobsService.apply(id, applicationDto, file);
    }

    @Get()
    findAll() {
        return this.jobsService.findAll();
    }

    @Get('all')
    findAllAdmin() {
        return this.jobsService.findAllAdmin();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.jobsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateJobDto: any) {
        return this.jobsService.update(id, updateJobDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.jobsService.remove(id);
    }

    // Admin Endpoints
    @Get(':id/applications')
    getJobApplications(@Param('id') id: string) {
        return this.jobsService.getJobApplications(id);
    }

    @Get('admin/applications') // Specific path to avoid conflict with :id
    getAllApplications() {
        return this.jobsService.getAllApplications();
    }
}
