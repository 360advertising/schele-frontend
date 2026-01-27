import { IsString, IsOptional, IsNumber, Min, Max, MaxLength, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateScaffoldComponentDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string; // Nume componentă

  @IsString()
  @IsOptional()
  @MaxLength(50)
  code?: string; // Cod componentă

  @IsString()
  @IsOptional()
  @MaxLength(100)
  type?: string; // Tip componentă

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  totalStock?: number; // Stoc total

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Min(0)
  availableStock?: number; // Stoc disponibil

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
