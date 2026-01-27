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
} from '@nestjs/common';
import { ScaffoldsService } from './scaffolds.service';
import { CreateScaffoldDto } from './dto/create-scaffold.dto';
import { UpdateScaffoldDto } from './dto/update-scaffold.dto';

@Controller('scaffolds')
export class ScaffoldsController {
  constructor(private readonly scaffoldsService: ScaffoldsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createScaffoldDto: CreateScaffoldDto) {
    return this.scaffoldsService.create(createScaffoldDto);
  }

  @Get()
  findAll() {
    return this.scaffoldsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scaffoldsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScaffoldDto: UpdateScaffoldDto) {
    return this.scaffoldsService.update(id, updateScaffoldDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.scaffoldsService.remove(id);
  }
}
