import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectPricingDto } from './dto/create-project-pricing.dto';
import { UpdateProjectPricingDto } from './dto/update-project-pricing.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProjectPricingsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectPricingDto: CreateProjectPricingDto) {
    // Verifică că proiectul există
    const project = await this.prisma.project.findFirst({
      where: {
        id: createProjectPricingDto.projectId,
        deletedAt: null,
      },
    });

    if (!project) {
      throw new NotFoundException(
        `Proiectul cu ID-ul ${createProjectPricingDto.projectId} nu a fost găsit`,
      );
    }

    // Verifică că componenta există
    const component = await this.prisma.scaffoldComponent.findFirst({
      where: {
        id: createProjectPricingDto.scaffoldComponentId,
        deletedAt: null,
      },
    });

    if (!component) {
      throw new NotFoundException(
        `Componenta cu ID-ul ${createProjectPricingDto.scaffoldComponentId} nu a fost găsită`,
      );
    }

    // Verifică dacă există deja un preț activ pentru această combinație
    const existingPricing = await this.prisma.projectComponentPricing.findFirst({
      where: {
        projectId: createProjectPricingDto.projectId,
        scaffoldComponentId: createProjectPricingDto.scaffoldComponentId,
        deletedAt: null,
        validFrom: {
          lte: createProjectPricingDto.validFrom
            ? new Date(createProjectPricingDto.validFrom)
            : new Date(),
        },
        OR: [
          { validTo: null },
          {
            validTo: {
              gte: createProjectPricingDto.validFrom
                ? new Date(createProjectPricingDto.validFrom)
                : new Date(),
            },
          },
        ],
      },
    });

    if (existingPricing) {
      throw new BadRequestException(
        'Există deja un preț activ pentru această combinație proiect + componentă în perioada specificată',
      );
    }

    return this.prisma.projectComponentPricing.create({
      data: {
        projectId: createProjectPricingDto.projectId,
        scaffoldComponentId: createProjectPricingDto.scaffoldComponentId,
        price: new Decimal(createProjectPricingDto.price),
        unitOfMeasure: createProjectPricingDto.unitOfMeasure,
        validFrom: createProjectPricingDto.validFrom
          ? new Date(createProjectPricingDto.validFrom)
          : new Date(),
        validTo: createProjectPricingDto.validTo
          ? new Date(createProjectPricingDto.validTo)
          : null,
        notes: createProjectPricingDto.notes,
      },
      include: {
        project: true,
        scaffoldComponent: true,
      },
    });
  }

  async findAll(projectId?: string, scaffoldComponentId?: string) {
    const where: any = {
      deletedAt: null,
    };

    if (projectId) {
      where.projectId = projectId;
    }

    if (scaffoldComponentId) {
      where.scaffoldComponentId = scaffoldComponentId;
    }

    return this.prisma.projectComponentPricing.findMany({
      where,
      include: {
        project: true,
        scaffoldComponent: true,
      },
      orderBy: {
        validFrom: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const pricing = await this.prisma.projectComponentPricing.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        project: true,
        scaffoldComponent: true,
      },
    });

    if (!pricing) {
      throw new NotFoundException(`Prețul cu ID-ul ${id} nu a fost găsit`);
    }

    return pricing;
  }

  async update(id: string, updateProjectPricingDto: UpdateProjectPricingDto) {
    await this.findOne(id);

    const updateData: any = {};

    if (updateProjectPricingDto.price !== undefined) {
      updateData.price = new Decimal(updateProjectPricingDto.price);
    }
    if (updateProjectPricingDto.unitOfMeasure !== undefined) {
      updateData.unitOfMeasure = updateProjectPricingDto.unitOfMeasure;
    }
    if (updateProjectPricingDto.validFrom !== undefined) {
      updateData.validFrom = new Date(updateProjectPricingDto.validFrom);
    }
    if (updateProjectPricingDto.validTo !== undefined) {
      updateData.validTo = updateProjectPricingDto.validTo
        ? new Date(updateProjectPricingDto.validTo)
        : null;
    }
    if (updateProjectPricingDto.notes !== undefined) {
      updateData.notes = updateProjectPricingDto.notes;
    }

    return this.prisma.projectComponentPricing.update({
      where: { id },
      data: updateData,
      include: {
        project: true,
        scaffoldComponent: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.projectComponentPricing.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
