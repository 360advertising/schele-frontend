import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProjectPricingsService } from './project-pricings.service';
import { CreateProjectPricingDto } from './dto/create-project-pricing.dto';
import { UpdateProjectPricingDto } from './dto/update-project-pricing.dto';

@Controller('project-pricings')
export class ProjectPricingsController {
  constructor(private readonly projectPricingsService: ProjectPricingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProjectPricingDto: CreateProjectPricingDto) {
    return this.projectPricingsService.create(createProjectPricingDto);
  }

  @Get()
  findAll(
    @Query('projectId') projectId?: string,
    @Query('scaffoldComponentId') scaffoldComponentId?: string,
  ) {
    return this.projectPricingsService.findAll(projectId, scaffoldComponentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectPricingsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectPricingDto: UpdateProjectPricingDto) {
    return this.projectPricingsService.update(id, updateProjectPricingDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.projectPricingsService.remove(id);
  }
}
