import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkReportStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    // Run all count queries in parallel for better performance
    const [
      totalClients,
      totalProjects,
      totalScaffolds,
      scaffoldsInUse,
      totalComponents,
      totalWorkReports,
      unbilledWorkReportsCount,
      totalProformas,
    ] = await Promise.all([
      this.prisma.client.count({ where: { deletedAt: null } }),
      this.prisma.project.count({ where: { deletedAt: null } }),
      this.prisma.scaffold.count({ where: { deletedAt: null } }),
      this.prisma.scaffold.count({
        where: { deletedAt: null, status: 'IN_USE' },
      }),
      this.prisma.scaffoldComponent.count({ where: { deletedAt: null } }),
      this.prisma.workReport.count({ where: { deletedAt: null } }),
      this.prisma.workReport.count({
        where: {
          deletedAt: null,
          status: { not: WorkReportStatus.BILLED },
        },
      }),
      this.prisma.proformaInvoice.count({ where: { deletedAt: null } }),
    ]);

    const activeProjects = totalProjects;

    // Get unbilled work reports with all data and pricings in optimized queries
    const unbilledWorkReportsValue =
      await this.calculateUnbilledWorkReportsValue();

    // Get total proformas value
    const totalProformasValue = await this.calculateProformasValue();

    return {
      totalClients,
      totalProjects,
      activeProjects,
      totalScaffolds,
      scaffoldsInUse,
      totalComponents,
      totalWorkReports,
      unbilledWorkReportsCount,
      unbilledWorkReportsValue,
      totalProformas,
      totalProformasValue,
    };
  }

  private async calculateUnbilledWorkReportsValue(): Promise<number> {
    // Get all unbilled work reports with items
    const workReports = await this.prisma.workReport.findMany({
      where: {
        deletedAt: null,
        status: { not: WorkReportStatus.BILLED },
      },
      select: {
        id: true,
        projectId: true,
        reportDate: true,
        items: {
          select: {
            quantity: true,
            scaffoldComponentId: true,
          },
        },
      },
    });

    if (workReports.length === 0) {
      return 0;
    }

    // Collect all unique project-component pairs
    const projectComponentPairs = new Set<string>();
    workReports.forEach((wr) => {
      wr.items.forEach((item) => {
        projectComponentPairs.add(`${wr.projectId}:${item.scaffoldComponentId}`);
      });
    });

    // Fetch all relevant pricings in a single optimized query
    const pricings = await this.prisma.projectComponentPricing.findMany({
      where: {
        deletedAt: null,
        validFrom: { lte: new Date() },
        OR: [{ validTo: null }, { validTo: { gte: new Date() } }],
      },
      select: {
        projectId: true,
        scaffoldComponentId: true,
        price: true,
        validFrom: true,
      },
      orderBy: {
        validFrom: 'desc',
      },
    });

    // Create a pricing map for fast lookup
    const pricingMap = new Map<string, number>();
    pricings.forEach((p) => {
      const key = `${p.projectId}:${p.scaffoldComponentId}`;
      if (!pricingMap.has(key)) {
        pricingMap.set(key, Number(p.price));
      }
    });

    // Calculate total value
    let totalValue = 0;
    workReports.forEach((wr) => {
      wr.items.forEach((item) => {
        const key = `${wr.projectId}:${item.scaffoldComponentId}`;
        const price = pricingMap.get(key);
        if (price) {
          totalValue += Number(item.quantity) * price;
        }
      });
    });

    return Number(totalValue.toFixed(2));
  }

  private async calculateProformasValue(): Promise<number> {
    // Get all proformas with work reports and items
    const proformas = await this.prisma.proformaInvoice.findMany({
      where: { deletedAt: null },
      select: {
        items: {
          select: {
            workReport: {
              select: {
                projectId: true,
                reportDate: true,
                items: {
                  select: {
                    quantity: true,
                    scaffoldComponentId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (proformas.length === 0) {
      return 0;
    }

    // Collect all unique project-component pairs
    const projectComponentPairs = new Set<string>();
    proformas.forEach((proforma) => {
      proforma.items.forEach((pItem) => {
        pItem.workReport.items.forEach((item) => {
          projectComponentPairs.add(
            `${pItem.workReport.projectId}:${item.scaffoldComponentId}`,
          );
        });
      });
    });

    // Fetch all relevant pricings
    const pricings = await this.prisma.projectComponentPricing.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        projectId: true,
        scaffoldComponentId: true,
        price: true,
        validFrom: true,
        validTo: true,
      },
      orderBy: {
        validFrom: 'desc',
      },
    });

    // Calculate total value
    let totalValue = 0;
    proformas.forEach((proforma) => {
      proforma.items.forEach((pItem) => {
        const workReport = pItem.workReport;
        workReport.items.forEach((item) => {
          // Find the appropriate pricing
          const pricing = pricings.find(
            (p) =>
              p.projectId === workReport.projectId &&
              p.scaffoldComponentId === item.scaffoldComponentId &&
              p.validFrom <= workReport.reportDate &&
              (p.validTo === null || p.validTo >= workReport.reportDate),
          );

          if (pricing) {
            totalValue += Number(item.quantity) * Number(pricing.price);
          }
        });
      });
    });

    return Number(totalValue.toFixed(2));
  }
}
