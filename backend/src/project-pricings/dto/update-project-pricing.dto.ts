import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectPricingDto } from './create-project-pricing.dto';

export class UpdateProjectPricingDto extends PartialType(CreateProjectPricingDto) {}
