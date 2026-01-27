import { IsString, IsArray, IsOptional, IsDateString, MaxLength, ArrayMinSize } from 'class-validator';

export class CreateProformaInvoiceDto {
  @IsString()
  @MaxLength(100)
  number: string; // Număr proformă

  @IsString()
  clientId: string; // Clientul pentru care se emite proforma

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  workReportIds: string[]; // Procesele verbale incluse în proformă

  @IsDateString()
  @IsOptional()
  issueDate?: string; // Data emiterii

  @IsDateString()
  @IsOptional()
  dueDate?: string; // Data scadenței

  @IsString()
  @IsOptional()
  notes?: string;
}
