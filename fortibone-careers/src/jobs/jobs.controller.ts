import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
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
    apply(@Param('id') id: string, @Body() applicationDto: any) {
        return this.jobsService.apply(id, applicationDto);
    }

    @Get()
    findAll() {
        return this.jobsService.findAll();
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
}
