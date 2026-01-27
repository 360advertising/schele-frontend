import { Module } from '@nestjs/common';
import { ProjectPricingsService } from './project-pricings.service';
import { ProjectPricingsController } from './project-pricings.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ProjectPricingsController],
  providers: [ProjectPricingsService, PrismaService],
  exports: [ProjectPricingsService],
})
export class ProjectPricingsModule {}
