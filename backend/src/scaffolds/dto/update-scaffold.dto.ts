import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ScaffoldStatus } from '@prisma/client';

export class UpdateScaffoldDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  number?: string; // Număr unic al schelei

  @IsEnum(ScaffoldStatus)
  @IsOptional()
  status?: ScaffoldStatus; // Status schelă

  @IsString()
  @IsOptional()
  @MaxLength(50)
  currentProjectId?: string; // Proiectul în care se află în prezent

  @IsString()
  @IsOptional()
  @MaxLength(500)
  location?: string; // Locația curentă

  @IsString()
  @IsOptional()
  notes?: string;
}
