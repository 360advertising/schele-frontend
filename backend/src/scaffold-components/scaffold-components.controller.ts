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
import { ScaffoldComponentsService } from './scaffold-components.service';
import { CreateScaffoldComponentDto } from './dto/create-scaffold-component.dto';
import { UpdateScaffoldComponentDto } from './dto/update-scaffold-component.dto';

@Controller('components')
export class ScaffoldComponentsController {
  constructor(private readonly scaffoldComponentsService: ScaffoldComponentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createScaffoldComponentDto: CreateScaffoldComponentDto) {
    return this.scaffoldComponentsService.create(createScaffoldComponentDto);
  }

  @Get()
  findAll() {
    return this.scaffoldComponentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scaffoldComponentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScaffoldComponentDto: UpdateScaffoldComponentDto) {
    return this.scaffoldComponentsService.update(id, updateScaffoldComponentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.scaffoldComponentsService.remove(id);
  }
}
