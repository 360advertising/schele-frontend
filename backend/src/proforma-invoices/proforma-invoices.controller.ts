import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ProformaInvoicesService } from './proforma-invoices.service';
import { CreateProformaInvoiceDto } from './dto/create-proforma-invoice.dto';

@Controller('proformas')
export class ProformaInvoicesController {
  constructor(private readonly proformaInvoicesService: ProformaInvoicesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProformaInvoiceDto: CreateProformaInvoiceDto) {
    return this.proformaInvoicesService.create(createProformaInvoiceDto);
  }

  @Get()
  findAll() {
    return this.proformaInvoicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proformaInvoicesService.findOne(id);
  }

  @Get(':id/pdf')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    await this.proformaInvoicesService.generatePdf(id, res);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.proformaInvoicesService.remove(id);
  }
}
