import { Module } from '@nestjs/common';
import { ProformaInvoicesService } from './proforma-invoices.service';
import { ProformaInvoicesController } from './proforma-invoices.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ProformaInvoicesController],
  providers: [ProformaInvoicesService, PrismaService],
  exports: [ProformaInvoicesService],
})
export class ProformaInvoicesModule {}
