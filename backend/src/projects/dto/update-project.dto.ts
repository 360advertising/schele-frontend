import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string; // Nume proiect

  @IsString()
  @IsOptional()
  @MaxLength(50)
  clientId?: string; // Clientul beneficiar al proiectului

  @IsString()
  @IsOptional()
  @MaxLength(50)
  code?: string; // Cod proiect (opțional, unic)

  @IsString()
  @IsOptional()
  @MaxLength(500)
  location?: string; // Locația proiectului

  @IsString()
  @IsOptional()
  description?: string;
}
