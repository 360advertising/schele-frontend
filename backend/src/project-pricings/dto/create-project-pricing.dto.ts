import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { UnitOfMeasure } from '@prisma/client';

export class CreateProjectPricingDto {
  @IsString()
  projectId: string; // Proiectul pentru care se definește prețul

  @IsString()
  scaffoldComponentId: string; // Componenta pentru care se definește prețul

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  price: number; // Preț per unitate

  @IsEnum(UnitOfMeasure)
  unitOfMeasure: UnitOfMeasure; // Unitatea de măsură pentru preț

  @IsDateString()
  @IsOptional()
  validFrom?: string; // Data de la care prețul este valabil

  @IsDateString()
  @IsOptional()
  validTo?: string; // Data până la care prețul este valabil (null = nelimitat)

  @IsString()
  @IsOptional()
  notes?: string;
}
