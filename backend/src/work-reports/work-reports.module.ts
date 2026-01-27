import { Module } from '@nestjs/common';
import { WorkReportsService } from './work-reports.service';
import { WorkReportsController } from './work-reports.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [WorkReportsController],
  providers: [WorkReportsService, PrismaService],
  exports: [WorkReportsService],
})
export class WorkReportsModule {}
