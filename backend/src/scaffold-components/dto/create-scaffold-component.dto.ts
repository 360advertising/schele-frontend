import { IsString, IsOptional, IsNumber, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateScaffoldComponentDto {
  @IsString()
  @MaxLength(255)
  name: string; // Nume componentă

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
  @Min(0)
  totalStock: number; // Stoc total

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  availableStock: number; // Stoc disponibil

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
