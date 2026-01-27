import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { WorkReportsService } from './work-reports.service';
import { CreateWorkReportDto } from './dto/create-work-report.dto';
import { UpdateWorkReportDto } from './dto/update-work-report.dto';
import { CreateWorkReportItemDto } from './dto/create-work-report-item.dto';

@Controller('work-reports')
export class WorkReportsController {
  constructor(private readonly workReportsService: WorkReportsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createWorkReportDto: CreateWorkReportDto) {
    return this.workReportsService.create(createWorkReportDto);
  }

  @Get()
  findAll() {
    return this.workReportsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workReportsService.findOne(id);
  }

  @Get(':id/pdf')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    await this.workReportsService.generatePdf(id, res);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkReportDto: UpdateWorkReportDto) {
    return this.workReportsService.update(id, updateWorkReportDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.workReportsService.remove(id);
  }

  @Post(':id/items')
  @HttpCode(HttpStatus.CREATED)
  addItem(@Param('id') id: string, @Body() createItemDto: CreateWorkReportItemDto) {
    return this.workReportsService.addItem(id, createItemDto);
  }

  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string) {
    return this.workReportsService.removeItem(id, itemId);
  }

  @Post(':id/bill')
  bill(@Param('id') id: string) {
    return this.workReportsService.bill(id);
  }
}
