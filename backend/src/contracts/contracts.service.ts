import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { Response } from 'express';

@Injectable()
export class ContractsService {
  // Datele default ale furnizorului (pot fi mutate în variabile de mediu)
  private readonly defaultSupplier = {
    name: 'A.D. SCHELE',
    taxId: 'RO12345678', // Va fi înlocuit cu datele reale
    address: 'Strada Exemplu, Nr. 1, București',
    phone: '+40 123 456 789',
    email: 'contact@schele.ro',
    bankAccount: 'RO12BANK1234567890123456',
    bankName: 'Banca Exemplu',
  };

  constructor(private prisma: PrismaService) {}

  async create(createContractDto: CreateContractDto) {
    // Setează datele default ale furnizorului dacă nu sunt furnizate
    const contractData = {
      ...createContractDto,
      supplierName: createContractDto.supplierName || this.defaultSupplier.name,
      supplierTaxId: createContractDto.supplierTaxId || this.defaultSupplier.taxId,
      supplierAddress: createContractDto.supplierAddress || this.defaultSupplier.address,
      supplierPhone: createContractDto.supplierPhone || this.defaultSupplier.phone,
      supplierEmail: createContractDto.supplierEmail || this.defaultSupplier.email,
      supplierBankAccount: createContractDto.supplierBankAccount || this.defaultSupplier.bankAccount,
      supplierBankName: createContractDto.supplierBankName || this.defaultSupplier.bankName,
      contractDate: createContractDto.contractDate ? new Date(createContractDto.contractDate) : new Date(),
      startDate: new Date(createContractDto.startDate),
      endDate: createContractDto.endDate ? new Date(createContractDto.endDate) : null,
    };

    return this.prisma.contract.create({
      data: contractData,
      include: {
        client: true,
      },
    });
  }

  async findAll() {
    return this.prisma.contract.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        client: true,
      },
      orderBy: {
        contractDate: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const contract = await this.prisma.contract.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        client: true,
      },
    });

    if (!contract) {
      throw new NotFoundException(`Contractul cu ID-ul ${id} nu a fost găsit`);
    }

    return contract;
  }

  async update(id: string, updateContractDto: UpdateContractDto) {
    await this.findOne(id);

    const updateData: any = { ...updateContractDto };
    
    if ((updateContractDto as any).startDate) {
      updateData.startDate = new Date((updateContractDto as any).startDate);
    }
    if ((updateContractDto as any).endDate) {
      updateData.endDate = new Date((updateContractDto as any).endDate);
    }
    if ((updateContractDto as any).contractDate) {
      updateData.contractDate = new Date((updateContractDto as any).contractDate);
    }

    return this.prisma.contract.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.contract.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async generatePdf(contractId: string, res: Response): Promise<void> {
    const contract = await this.findOne(contractId);

    const doc = new PDFDocument({ margin: 50 });
    
    // Setează header-ul pentru download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Contract_${contract.number}.pdf"`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('CONTRACT DE ÎNCHIRIERE SCHELE', { align: 'center' });
    doc.moveDown();

    // Număr contract
    doc.fontSize(14).text(`Contract nr. ${contract.number}`, { align: 'center' });
    doc.moveDown(2);

    // Data contractului
    const contractDate = new Date(contract.contractDate).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.fontSize(12).text(`Data: ${contractDate}`, { align: 'right' });
    doc.moveDown(2);

    // Partile contractante
    doc.fontSize(14).text('PĂRȚILE CONTRACTANTE:', { underline: true });
    doc.moveDown();

    // Furnizor (PROPRIETAR)
    doc.fontSize(12).text('PROPRIETAR (FURNIZOR):', { underline: true });
    doc.fontSize(11).text(`Denumire: ${contract.supplierName}`);
    if (contract.supplierTaxId) {
      doc.text(`CUI/CIF: ${contract.supplierTaxId}`);
    }
    if (contract.supplierAddress) {
      doc.text(`Adresă: ${contract.supplierAddress}`);
    }
    if (contract.supplierPhone) {
      doc.text(`Telefon: ${contract.supplierPhone}`);
    }
    if (contract.supplierEmail) {
      doc.text(`Email: ${contract.supplierEmail}`);
    }
    if (contract.supplierBankAccount) {
      doc.text(`Cont bancar: ${contract.supplierBankAccount}`);
    }
    if (contract.supplierBankName) {
      doc.text(`Bancă: ${contract.supplierBankName}`);
    }
    doc.moveDown();

    // Client (BENEFICIAR)
    doc.fontSize(12).text('BENEFICIAR (CLIENT):', { underline: true });
    doc.fontSize(11).text(`Denumire: ${contract.client.name}`);
    if (contract.client.taxId) {
      doc.text(`CUI/CIF: ${contract.client.taxId}`);
    }
    if (contract.client.address) {
      doc.text(`Adresă: ${contract.client.address}`);
    }
    if (contract.client.phone) {
      doc.text(`Telefon: ${contract.client.phone}`);
    }
    if (contract.client.email) {
      doc.text(`Email: ${contract.client.email}`);
    }
    doc.moveDown(2);

    // Obiectul contractului
    doc.fontSize(14).text('OBIECTUL CONTRACTULUI:', { underline: true });
    doc.moveDown();
    
    if (contract.description) {
      doc.fontSize(11).text(contract.description);
    } else {
      doc.fontSize(11).text('Închirierea de echipamente de schele pentru lucrări de construcție.');
    }
    doc.moveDown();

    // Locația
    if (contract.location) {
      doc.fontSize(12).text('Locația lucrărilor:', { underline: true });
      doc.fontSize(11).text(contract.location);
      doc.moveDown();
    }

    // Perioada contractului
    doc.fontSize(12).text('PERIOADA CONTRACTULUI:', { underline: true });
    const startDate = new Date(contract.startDate).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.fontSize(11).text(`Data începerii: ${startDate}`);
    
    if (contract.endDate) {
      const endDate = new Date(contract.endDate).toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      doc.text(`Data încheierii: ${endDate}`);
    } else {
      doc.text('Data încheierii: Nedeterminată');
    }
    doc.moveDown(2);

    // Termeni și condiții
    if (contract.terms) {
      doc.fontSize(14).text('TERMENI ȘI CONDIȚII:', { underline: true });
      doc.moveDown();
      doc.fontSize(11).text(contract.terms);
      doc.moveDown(2);
    } else {
      // Termeni default
      doc.fontSize(14).text('TERMENI ȘI CONDIȚII:', { underline: true });
      doc.moveDown();
      doc.fontSize(11)
        .text('1. Proprietarul pune la dispoziția beneficiarului echipamente de schele conform specificațiilor tehnice.')
        .moveDown(0.5)
        .text('2. Beneficiarul se obligă să utilizeze echipamentele conform instrucțiunilor și să le restituie în starea în care le-a primit.')
        .moveDown(0.5)
        .text('3. Beneficiarul este responsabil pentru întreținerea și securitatea echipamentelor pe durata contractului.')
        .moveDown(0.5)
        .text('4. Orice deteriorare sau pierdere a echipamentelor va fi suportată de beneficiar.')
        .moveDown(0.5)
        .text('5. Contractul poate fi reziliat de oricare dintre părți cu notificare prealabilă de 7 zile.');
      doc.moveDown(2);
    }

    // Semnături
    doc.moveDown();
    doc.fontSize(12).text('Semnături:', { underline: true });
    doc.moveDown(3);
    
    // Semnătură proprietar
    doc.fontSize(11).text('PROPRIETAR', { align: 'left' });
    doc.moveDown(2);
    doc.text('_________________________', { align: 'left' });
    doc.text(contract.supplierName, { align: 'left' });
    
    // Semnătură beneficiar
    const startX = doc.page.width / 2 + 50;
    doc.fontSize(11).text('BENEFICIAR', { align: 'right' });
    doc.moveDown(2);
    doc.text('_________________________', { align: 'right' });
    doc.text(contract.client.name, { align: 'right' });

    // Note
    if (contract.notes) {
      doc.moveDown(3);
      doc.fontSize(10).text('Note:');
      doc.fontSize(10).text(contract.notes);
    }

    doc.end();
  }
}
