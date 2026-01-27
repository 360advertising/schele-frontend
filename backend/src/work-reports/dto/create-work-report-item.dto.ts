import { IsString, IsEnum, IsNumber, IsOptional, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { UnitOfMeasure } from '@prisma/client';

export class CreateWorkReportItemDto {
  @IsString()
  scaffoldComponentId: string; // Componenta utilizată

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  quantity: number; // Cantitate

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  length?: number; // Lungime (dacă aplicabil)

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number; // Greutate (dacă aplicabil)

  @IsEnum(UnitOfMeasure)
  unitOfMeasure: UnitOfMeasure; // Unitatea de măsură

  @IsString()
  @IsOptional()
  notes?: string;
}
