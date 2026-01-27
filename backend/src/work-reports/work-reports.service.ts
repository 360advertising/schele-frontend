import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkReportDto } from './dto/create-work-report.dto';
import { UpdateWorkReportDto } from './dto/update-work-report.dto';
import { CreateWorkReportItemDto } from './dto/create-work-report-item.dto';
import { WorkReportStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

@Injectable()
export class WorkReportsService {
  constructor(private prisma: PrismaService) {}

  async create(createWorkReportDto: CreateWorkReportDto) {
    return this.prisma.workReport.create({
      data: {
        ...createWorkReportDto,
        reportDate: createWorkReportDto.reportDate
          ? new Date(createWorkReportDto.reportDate)
          : new Date(),
      },
      include: {
        client: true,
        project: true,
        items: {
          include: {
            scaffoldComponent: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.workReport.findMany({
      where: {
        deletedAt: null, // Excludează procesele verbale șterse (soft delete)
      },
      include: {
        client: true,
        project: true,
        items: {
          include: {
            scaffoldComponent: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const workReport = await this.prisma.workReport.findFirst({
      where: {
        id,
        deletedAt: null, // Verifică că nu este șters
      },
      include: {
        client: true,
        project: true,
        items: {
          include: {
            scaffoldComponent: true,
          },
        },
      },
    });

    if (!workReport) {
      throw new NotFoundException(`Procesul verbal cu ID-ul ${id} nu a fost găsit`);
    }

    return workReport;
  }

  async update(id: string, updateWorkReportDto: UpdateWorkReportDto) {
    const existing = await this.findOne(id);

    // Verifică că procesul verbal nu este facturat (BILLED)
    if (existing.status === WorkReportStatus.BILLED) {
      throw new BadRequestException(
        'Procesul verbal facturat nu poate fi modificat',
      );
    }

    const updateData: any = { ...updateWorkReportDto };
    if (updateWorkReportDto.reportDate) {
      updateData.reportDate = new Date(updateWorkReportDto.reportDate);
    }

    return this.prisma.workReport.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        project: true,
        items: {
          include: {
            scaffoldComponent: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    // Verifică dacă procesul verbal există și nu este șters
    await this.findOne(id);

    // Soft delete - setează deletedAt
    return this.prisma.workReport.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async addItem(workReportId: string, createItemDto: CreateWorkReportItemDto) {
    const workReport = await this.findOne(workReportId);

    // Verifică că procesul verbal nu este facturat
    if (workReport.status === WorkReportStatus.BILLED) {
      throw new BadRequestException(
        'Nu se pot adăuga linii la un proces verbal facturat',
      );
    }

    // Caută prețul pentru componenta din proiect
    const pricing = await this.prisma.projectComponentPricing.findFirst({
      where: {
        projectId: workReport.projectId,
        scaffoldComponentId: createItemDto.scaffoldComponentId,
        deletedAt: null,
        validFrom: { lte: new Date() },
        OR: [{ validTo: null }, { validTo: { gte: new Date() } }],
      },
      orderBy: {
        validFrom: 'desc',
      },
    });

    if (!pricing) {
      throw new BadRequestException(
        `Nu există preț definit pentru componenta ${createItemDto.scaffoldComponentId} în proiectul ${workReport.projectId}`,
      );
    }

    // Creează linia procesului verbal
    return this.prisma.workReportItem.create({
      data: {
        workReportId,
        scaffoldComponentId: createItemDto.scaffoldComponentId,
        quantity: new Decimal(createItemDto.quantity),
        length: createItemDto.length ? new Decimal(createItemDto.length) : null,
        weight: createItemDto.weight ? new Decimal(createItemDto.weight) : null,
        unitOfMeasure: createItemDto.unitOfMeasure,
        notes: createItemDto.notes,
      },
      include: {
        scaffoldComponent: true,
      },
    });
  }

  async removeItem(workReportId: string, itemId: string) {
    const workReport = await this.findOne(workReportId);

    // Verifică că procesul verbal nu este facturat
    if (workReport.status === WorkReportStatus.BILLED) {
      throw new BadRequestException(
        'Nu se pot șterge linii dintr-un proces verbal facturat',
      );
    }

    // Verifică că linia aparține procesului verbal
    const item = await this.prisma.workReportItem.findFirst({
      where: {
        id: itemId,
        workReportId,
      },
    });

    if (!item) {
      throw new NotFoundException(
        `Linia cu ID-ul ${itemId} nu a fost găsită în acest proces verbal`,
      );
    }

    // Șterge linia
    return this.prisma.workReportItem.delete({
      where: { id: itemId },
    });
  }

  async bill(workReportId: string) {
    const workReport = await this.findOne(workReportId);

    // Verifică că procesul verbal nu este deja facturat
    if (workReport.status === WorkReportStatus.BILLED) {
      throw new BadRequestException('Procesul verbal este deja facturat');
    }

    // Verifică că procesul verbal are cel puțin o linie
    if (!workReport.items || workReport.items.length === 0) {
      throw new BadRequestException(
        'Procesul verbal trebuie să aibă cel puțin o linie pentru a fi marcat ca facturat',
      );
    }

    // Schimbă statusul la BILLED (face procesul verbal imutabil)
    return this.prisma.workReport.update({
      where: { id: workReportId },
      data: {
        status: WorkReportStatus.BILLED,
      },
      include: {
        client: true,
        project: true,
        items: {
          include: {
            scaffoldComponent: true,
          },
        },
      },
    });
  }

  async generatePdf(workReportId: string, res: Response): Promise<void> {
    const workReport = await this.findOne(workReportId);

    const doc = new PDFDocument({ margin: 50 });
    
    // Setează header-ul pentru download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Proces_Verbal_${workReport.number}.pdf"`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('PROCES VERBAL', { align: 'center' });
    doc.moveDown();

    // Număr proces verbal
    doc.fontSize(14).text(`Nr. ${workReport.number}`, { align: 'center' });
    doc.moveDown(2);

    // Data procesului verbal
    const reportDate = workReport.reportDate
      ? new Date(workReport.reportDate).toLocaleDateString('ro-RO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Nedeterminată';
    doc.fontSize(12).text(`Data: ${reportDate}`, { align: 'right' });
    doc.moveDown(2);

    // Informații generale
    doc.fontSize(14).text('INFORMAȚII GENERALE:', { underline: true });
    doc.moveDown();
    doc.fontSize(11)
      .text(`Client: ${workReport.client?.name || '-'}`)
      .moveDown(0.5)
      .text(`Proiect: ${workReport.project?.name || '-'}`)
      .moveDown(0.5)
      .text(`Tip lucrare: ${this.getWorkTypeLabel(workReport.workType)}`)
      .moveDown(0.5);
    
    if (workReport.location) {
      doc.text(`Locație: ${workReport.location}`).moveDown(0.5);
    }
    
    doc.text(`Status: ${this.getStatusLabel(workReport.status)}`);
    doc.moveDown(2);

    // Linii proces verbal
    doc.fontSize(14).text('COMPONENTE UTILIZATE:', { underline: true });
    doc.moveDown();

    if (workReport.items && workReport.items.length > 0) {
      // Header tabel
      const startY = doc.y;
      doc.fontSize(10)
        .text('Nr.', 50, startY)
        .text('Componentă', 80, startY)
        .text('Cantitate', 250, startY)
        .text('Lungime', 320, startY)
        .text('Greutate', 380, startY)
        .text('Unitate', 440, startY);
      
      doc.moveTo(50, startY + 15).lineTo(500, startY + 15).stroke();
      doc.moveDown();

      let totalValue = 0;
      let rowNumber = 1;

      // Fetch pricings for all items
      const pricings = await this.prisma.projectComponentPricing.findMany({
        where: {
          projectId: workReport.projectId,
          scaffoldComponentId: { in: workReport.items.map((item) => item.scaffoldComponentId) },
          deletedAt: null,
          validFrom: { lte: workReport.reportDate ? new Date(workReport.reportDate) : new Date() },
          OR: [
            { validTo: null },
            { validTo: { gte: workReport.reportDate ? new Date(workReport.reportDate) : new Date() } },
          ],
        },
      });

      const pricingMap = new Map<string, number>();
      pricings.forEach((p) => {
        const key = `${p.projectId}_${p.scaffoldComponentId}`;
        if (!pricingMap.has(key)) {
          pricingMap.set(key, Number(p.price));
        }
      });

      for (const item of workReport.items) {
        const y = doc.y;
        const quantity = typeof item.quantity === 'number' ? item.quantity : parseFloat(item.quantity.toString());
        const length = item.length ? (typeof item.length === 'number' ? item.length : parseFloat(item.length.toString())) : null;
        const weight = item.weight ? (typeof item.weight === 'number' ? item.weight : parseFloat(item.weight.toString())) : null;
        
        doc.fontSize(9)
          .text(rowNumber.toString(), 50, y)
          .text(item.scaffoldComponent?.name || 'N/A', 80, y, { width: 160 })
          .text(quantity.toString(), 250, y, { width: 60, align: 'right' })
          .text(length ? length.toString() : '-', 320, y, { width: 50, align: 'right' })
          .text(weight ? weight.toString() : '-', 380, y, { width: 50, align: 'right' })
          .text(this.getUnitLabel(item.unitOfMeasure), 440, y);

        // Calculate value if pricing exists
        const pricingKey = `${workReport.projectId}_${item.scaffoldComponentId}`;
        const price = pricingMap.get(pricingKey);
        if (price) {
          const itemValue = quantity * price;
          totalValue += itemValue;
        }

        rowNumber++;
        doc.moveDown(0.8);

        // Check if we need a new page
        if (doc.y > 700) {
          doc.addPage();
        }
      }

      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(500, doc.y).stroke();
      doc.moveDown();

      // Total value
      if (totalValue > 0) {
        doc.fontSize(12)
          .font('Helvetica-Bold')
          .text(`Valoare totală: ${totalValue.toFixed(2)} RON`, { align: 'right' })
          .font('Helvetica');
      }
    } else {
      doc.fontSize(11).text('Nu există componente înregistrate în acest proces verbal.');
    }

    doc.moveDown(2);

    // Observații
    if (workReport.notes) {
      doc.fontSize(12).text('OBSERVAȚII:', { underline: true });
      doc.moveDown();
      doc.fontSize(11).text(workReport.notes);
      doc.moveDown(2);
    }

    // Semnături
    doc.fontSize(12).text('Semnături:', { underline: true });
    doc.moveDown(3);
    
    // Semnătură executant
    doc.fontSize(11).text('EXECUTANT', { align: 'left' });
    doc.moveDown(2);
    doc.text('_________________________', { align: 'left' });
    
    // Semnătură beneficiar
    doc.fontSize(11).text('BENEFICIAR', { align: 'right' });
    doc.moveDown(2);
    doc.text('_________________________', { align: 'right' });
    doc.text(workReport.client?.name || '', { align: 'right' });

    doc.end();
  }

  private getWorkTypeLabel(workType: string): string {
    const labels: Record<string, string> = {
      INSTALLATION: 'Instalare',
      UNINSTALLATION: 'Dezinstalare',
      MODIFICATION: 'Modificare',
    };
    return labels[workType] || workType;
  }

  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      DRAFT: 'Draft',
      BILLED: 'Facturat',
      CANCELLED: 'Anulat',
    };
    return labels[status] || status;
  }

  private getUnitLabel(unit: string): string {
    const labels: Record<string, string> = {
      METER: 'm',
      KILOGRAM: 'kg',
      PIECE: 'buc',
      SQUARE_METER: 'm²',
    };
    return labels[unit] || unit;
  }
}
