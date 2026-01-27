import { IsString, IsOptional, IsEmail, MaxLength } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @MaxLength(255)
  name: string; // Nume client/beneficiar

  @IsString()
  @IsOptional()
  @MaxLength(50)
  code?: string; // Cod client (opțional, unic)

  @IsString()
  @IsOptional()
  @MaxLength(50)
  taxId?: string; // CUI/CIF

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @IsString()
  @IsOptional()
  notes?: string; // Note despre client
}
