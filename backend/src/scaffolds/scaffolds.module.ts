import { Module } from '@nestjs/common';
import { ScaffoldsService } from './scaffolds.service';
import { ScaffoldsController } from './scaffolds.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ScaffoldsController],
  providers: [ScaffoldsService, PrismaService],
  exports: [ScaffoldsService],
})
export class ScaffoldsModule {}
