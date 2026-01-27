import { IsString, IsEnum, IsOptional, IsDateString, MaxLength } from 'class-validator';
import { WorkType } from '@prisma/client';

export class CreateWorkReportDto {
  @IsString()
  @MaxLength(100)
  number: string; // Număr proces verbal

  @IsString()
  clientId: string; // Clientul beneficiar al procesului verbal

  @IsString()
  projectId: string; // Proiectul pentru care se întocmește procesul verbal

  @IsEnum(WorkType)
  workType: WorkType; // Tip lucrare: instalare, dezinstalare, modificare

  @IsDateString()
  @IsOptional()
  reportDate?: string; // Data procesului verbal

  @IsString()
  @IsOptional()
  @MaxLength(500)
  location?: string; // Locația lucrării (poate diferi de locația proiectului)

  @IsString()
  @IsOptional()
  notes?: string;
}
