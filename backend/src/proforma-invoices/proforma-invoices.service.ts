import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProformaInvoiceDto } from './dto/create-proforma-invoice.dto';
import { WorkReportStatus } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

@Injectable()
export class ProformaInvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(createProformaInvoiceDto: CreateProformaInvoiceDto) {
    // Verifică că toate procesele verbale există și nu sunt șterse
    const workReports = await this.prisma.workReport.findMany({
      where: {
        id: { in: createProformaInvoiceDto.workReportIds },
        deletedAt: null,
      },
      include: {
        client: true,
        items: {
          include: {
            scaffoldComponent: true,
          },
        },
      },
    });

    // Verifică că toate procesele verbale au fost găsite
    if (workReports.length !== createProformaInvoiceDto.workReportIds.length) {
      const foundIds = workReports.map((wr) => wr.id);
      const missingIds = createProformaInvoiceDto.workReportIds.filter(
        (id) => !foundIds.includes(id),
      );
      throw new NotFoundException(
        `Procesele verbale cu ID-urile ${missingIds.join(', ')} nu au fost găsite`,
      );
    }

    // Verifică că toate procesele verbale aparțin aceluiași client
    const clientIds = [...new Set(workReports.map((wr) => wr.clientId))];
    if (clientIds.length > 1) {
      throw new BadRequestException(
        'Toate procesele verbale trebuie să aparțină aceluiași client',
      );
    }

    // Verifică că clientul proceselor verbale corespunde cu clientId-ul proformei
    if (workReports[0].clientId !== createProformaInvoiceDto.clientId) {
      throw new BadRequestException(
        'Clientul proceselor verbale nu corespunde cu clientul proformei',
      );
    }

    // Verifică că procesele verbale nu sunt deja facturate
    const billedReports = workReports.filter(
      (wr) => wr.status === WorkReportStatus.BILLED,
    );
    if (billedReports.length > 0) {
      throw new BadRequestException(
        `Procesele verbale cu ID-urile ${billedReports.map((wr) => wr.id).join(', ')} sunt deja facturate`,
      );
    }

    // Verifică că procesele verbale nu sunt deja incluse în altă proformă
    const existingItems = await this.prisma.proformaInvoiceItem.findMany({
      where: {
        workReportId: { in: createProformaInvoiceDto.workReportIds },
      },
    });

    if (existingItems.length > 0) {
      const alreadyIncludedIds = existingItems.map((item) => item.workReportId);
      throw new BadRequestException(
        `Procesele verbale cu ID-urile ${alreadyIncludedIds.join(', ')} sunt deja incluse într-o altă proformă`,
      );
    }

    // Creează proforma și marcasează procesele verbale ca facturate folosind tranzacție
    return this.prisma.$transaction(async (tx) => {
      // Creează proforma
      const proforma = await tx.proformaInvoice.create({
        data: {
          number: createProformaInvoiceDto.number,
          clientId: createProformaInvoiceDto.clientId,
          issueDate: createProformaInvoiceDto.issueDate
            ? new Date(createProformaInvoiceDto.issueDate)
            : new Date(),
          dueDate: createProformaInvoiceDto.dueDate
            ? new Date(createProformaInvoiceDto.dueDate)
            : null,
          notes: createProformaInvoiceDto.notes,
        },
      });

      // Creează liniile proformei și marchează procesele verbale ca facturate
      await Promise.all(
        createProformaInvoiceDto.workReportIds.map(async (workReportId) => {
          await tx.proformaInvoiceItem.create({
            data: {
              proformaInvoiceId: proforma.id,
              workReportId,
            },
          });

          await tx.workReport.update({
            where: { id: workReportId },
            data: {
              status: WorkReportStatus.BILLED,
            },
          });
        }),
      );

      // Returnează proforma cu toate datele
      return tx.proformaInvoice.findUnique({
        where: { id: proforma.id },
        include: {
          client: true,
          items: {
            include: {
              workReport: {
                include: {
                  items: {
                    include: {
                      scaffoldComponent: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    });
  }

  async findAll() {
    return this.prisma.proformaInvoice.findMany({
      where: {
        deletedAt: null, // Excludează proformele șterse (soft delete)
      },
      include: {
        client: true,
        items: {
          include: {
            workReport: {
              include: {
                items: {
                  include: {
                    scaffoldComponent: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const proforma = await this.prisma.proformaInvoice.findFirst({
      where: {
        id,
        deletedAt: null, // Verifică că nu este șters
      },
      include: {
        client: true,
        items: {
          include: {
            workReport: {
              include: {
                items: {
                  include: {
                    scaffoldComponent: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!proforma) {
      throw new NotFoundException(`Proforma cu ID-ul ${id} nu a fost găsită`);
    }

    return proforma;
  }

  async remove(id: string) {
    // Verifică dacă proforma există și nu este ștersă
    await this.findOne(id);

    // Soft delete - setează deletedAt
    return this.prisma.proformaInvoice.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async generatePdf(proformaId: string, res: Response): Promise<void> {
    const proforma = await this.findOne(proformaId);

    const doc = new PDFDocument({ margin: 50 });
    
    // Setează header-ul pentru download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Proforma_${proforma.number}.pdf"`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('FACTURĂ PROFORMĂ', { align: 'center' });
    doc.moveDown();

    // Număr proformă
    doc.fontSize(14).text(`Nr. ${proforma.number}`, { align: 'center' });
    doc.moveDown(2);

    // Data emiterii
    const issueDate = proforma.issueDate
      ? new Date(proforma.issueDate).toLocaleDateString('ro-RO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Nedeterminată';
    doc.fontSize(12).text(`Data emiterii: ${issueDate}`, { align: 'right' });
    
    if (proforma.dueDate) {
      const dueDate = new Date(proforma.dueDate).toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      doc.text(`Data scadenței: ${dueDate}`, { align: 'right' });
    }
    doc.moveDown(2);

    // Informații client
    doc.fontSize(14).text('CLIENT:', { underline: true });
    doc.moveDown();
    doc.fontSize(11)
      .text(`Denumire: ${proforma.client?.name || '-'}`)
      .moveDown(0.5);
    
    if (proforma.client?.taxId) {
      doc.text(`CUI/CIF: ${proforma.client.taxId}`).moveDown(0.5);
    }
    if (proforma.client?.address) {
      doc.text(`Adresă: ${proforma.client.address}`).moveDown(0.5);
    }
    if (proforma.client?.phone) {
      doc.text(`Telefon: ${proforma.client.phone}`).moveDown(0.5);
    }
    if (proforma.client?.email) {
      doc.text(`Email: ${proforma.client.email}`);
    }
    doc.moveDown(2);

    // Procese verbale incluse
    doc.fontSize(14).text('PROCESE VERBALE INCLUSE:', { underline: true });
    doc.moveDown();

    if (proforma.items && proforma.items.length > 0) {
      let totalValue = 0;

      for (const item of proforma.items) {
        const workReport = item.workReport;
        
        // Header proces verbal
        doc.fontSize(12)
          .font('Helvetica-Bold')
          .text(`Proces Verbal: ${workReport.number}`, { underline: true })
          .font('Helvetica');
        doc.moveDown(0.5);
        
        doc.fontSize(10)
          .text(`Data: ${workReport.reportDate ? new Date(workReport.reportDate).toLocaleDateString('ro-RO') : '-'}`)
          .text(`Tip lucrare: ${this.getWorkTypeLabel(workReport.workType)}`)
          .text(`Locație: ${workReport.location || '-'}`);
        doc.moveDown();

        // Linii proces verbal
        if (workReport.items && workReport.items.length > 0) {
          doc.fontSize(10).text('Componente:', { underline: true });
          doc.moveDown(0.3);

          // Fetch pricings
          const pricings = await this.prisma.projectComponentPricing.findMany({
            where: {
              projectId: workReport.projectId,
              scaffoldComponentId: { in: workReport.items.map((i) => i.scaffoldComponentId) },
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

          // Header tabel
          const startY = doc.y;
          doc.fontSize(9)
            .text('Componentă', 50, startY)
            .text('Cant.', 200, startY, { width: 50, align: 'right' })
            .text('Preț unit.', 260, startY, { width: 70, align: 'right' })
            .text('Valoare', 340, startY, { width: 80, align: 'right' });
          
          doc.moveTo(50, startY + 12).lineTo(420, startY + 12).stroke();
          doc.moveDown(0.5);

          // Linii
          for (const wrItem of workReport.items) {
            const quantity = typeof wrItem.quantity === 'number' ? wrItem.quantity : parseFloat(wrItem.quantity.toString());
            const pricingKey = `${workReport.projectId}_${wrItem.scaffoldComponentId}`;
            const unitPrice = pricingMap.get(pricingKey) || 0;
            const itemValue = quantity * unitPrice;
            totalValue += itemValue;

            const y = doc.y;
            doc.fontSize(9)
              .text(wrItem.scaffoldComponent?.name || 'N/A', 50, y, { width: 140 })
              .text(quantity.toString(), 200, y, { width: 50, align: 'right' })
              .text(unitPrice.toFixed(2) + ' RON', 260, y, { width: 70, align: 'right' })
              .text(itemValue.toFixed(2) + ' RON', 340, y, { width: 80, align: 'right' });

            doc.moveDown(0.6);

            if (doc.y > 700) {
              doc.addPage();
            }
          }

          doc.moveDown(0.5);
          doc.moveTo(50, doc.y).lineTo(420, doc.y).stroke();
          doc.moveDown();
        }

        doc.moveDown();
      }

      // Total
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(420, doc.y).stroke();
      doc.moveDown();
      doc.fontSize(14)
        .font('Helvetica-Bold')
        .text(`TOTAL: ${totalValue.toFixed(2)} RON`, { align: 'right' })
        .font('Helvetica');
    } else {
      doc.fontSize(11).text('Nu există procese verbale incluse în această proformă.');
    }

    doc.moveDown(2);

    // Observații
    if (proforma.notes) {
      doc.fontSize(12).text('OBSERVAȚII:', { underline: true });
      doc.moveDown();
      doc.fontSize(11).text(proforma.notes);
    }

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
}
