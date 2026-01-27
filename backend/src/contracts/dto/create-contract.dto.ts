import { IsString, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateContractDto {
  @IsString()
  @IsNotEmpty()
  number: string; // Număr contract

  @IsString()
  @IsNotEmpty()
  clientId: string; // Clientul cu care s-a încheiat contractul

  @IsDateString()
  @IsNotEmpty()
  startDate: string; // Data începerii contractului

  @IsDateString()
  @IsOptional()
  endDate?: string; // Data încheierii contractului (opțional)

  @IsDateString()
  @IsOptional()
  contractDate?: string; // Data semnării contractului

  @IsString()
  @IsOptional()
  location?: string; // Locația unde se execută lucrările

  @IsString()
  @IsOptional()
  description?: string; // Descrierea lucrărilor

  @IsString()
  @IsOptional()
  terms?: string; // Termeni și condiții

  @IsString()
  @IsOptional()
  supplierName?: string; // Numele furnizorului

  @IsString()
  @IsOptional()
  supplierTaxId?: string; // CUI/CIF furnizor

  @IsString()
  @IsOptional()
  supplierAddress?: string; // Adresa furnizorului

  @IsString()
  @IsOptional()
  supplierPhone?: string; // Telefon furnizor

  @IsString()
  @IsOptional()
  supplierEmail?: string; // Email furnizor

  @IsString()
  @IsOptional()
  supplierBankAccount?: string; // Cont bancar furnizor

  @IsString()
  @IsOptional()
  supplierBankName?: string; // Nume bancă furnizor

  @IsString()
  @IsOptional()
  notes?: string;
}
