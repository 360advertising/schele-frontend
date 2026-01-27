import { Module } from '@nestjs/common';
import { ScaffoldComponentsService } from './scaffold-components.service';
import { ScaffoldComponentsController } from './scaffold-components.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ScaffoldComponentsController],
  providers: [ScaffoldComponentsService, PrismaService],
  exports: [ScaffoldComponentsService],
})
export class ScaffoldComponentsModule {}
