import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScaffoldComponentDto } from './dto/create-scaffold-component.dto';
import { UpdateScaffoldComponentDto } from './dto/update-scaffold-component.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ScaffoldComponentsService {
  constructor(private prisma: PrismaService) {}

  async create(createScaffoldComponentDto: CreateScaffoldComponentDto) {
    // Asigură că availableStock nu depășește totalStock
    const availableStock = Math.min(
      createScaffoldComponentDto.availableStock,
      createScaffoldComponentDto.totalStock,
    );

    return this.prisma.scaffoldComponent.create({
      data: {
        name: createScaffoldComponentDto.name,
        code: createScaffoldComponentDto.code,
        type: createScaffoldComponentDto.type,
        totalStock: new Decimal(createScaffoldComponentDto.totalStock),
        availableStock: new Decimal(availableStock),
        currentProjectId: createScaffoldComponentDto.currentProjectId,
        location: createScaffoldComponentDto.location,
        notes: createScaffoldComponentDto.notes,
      },
    });
  }

  async findAll() {
    return this.prisma.scaffoldComponent.findMany({
      where: {
        deletedAt: null, // Excludează componentele șterse (soft delete)
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const component = await this.prisma.scaffoldComponent.findFirst({
      where: {
        id,
        deletedAt: null, // Verifică că nu este șters
      },
    });

    if (!component) {
      throw new NotFoundException(`Componenta cu ID-ul ${id} nu a fost găsită`);
    }

    return component;
  }

  async update(id: string, updateScaffoldComponentDto: UpdateScaffoldComponentDto) {
    // Verifică dacă componenta există și nu este ștersă
    const existing = await this.findOne(id);

    const updateData: any = {};

    // Copiază câmpurile string dacă există
    if (updateScaffoldComponentDto.name !== undefined) {
      updateData.name = updateScaffoldComponentDto.name;
    }
    if (updateScaffoldComponentDto.code !== undefined) {
      updateData.code = updateScaffoldComponentDto.code;
    }
    if (updateScaffoldComponentDto.type !== undefined) {
      updateData.type = updateScaffoldComponentDto.type;
    }
    if (updateScaffoldComponentDto.currentProjectId !== undefined) {
      updateData.currentProjectId = updateScaffoldComponentDto.currentProjectId;
    }
    if (updateScaffoldComponentDto.location !== undefined) {
      updateData.location = updateScaffoldComponentDto.location;
    }
    if (updateScaffoldComponentDto.notes !== undefined) {
      updateData.notes = updateScaffoldComponentDto.notes;
    }

    // Gestionează totalStock și availableStock
    if (updateScaffoldComponentDto.totalStock !== undefined) {
      const newTotalStock = updateScaffoldComponentDto.totalStock;
      updateData.totalStock = new Decimal(newTotalStock);

      // Dacă totalStock este actualizat și availableStock existent este mai mare, ajustează-l
      const currentAvailableStock = existing.availableStock.toNumber();
      if (currentAvailableStock > newTotalStock) {
        updateData.availableStock = new Decimal(newTotalStock);
      } else if (updateScaffoldComponentDto.availableStock !== undefined) {
        // Dacă availableStock este de asemenea actualizat, folosește minimul dintre el și noul totalStock
        updateData.availableStock = new Decimal(
          Math.min(updateScaffoldComponentDto.availableStock, newTotalStock),
        );
      }
    } else if (updateScaffoldComponentDto.availableStock !== undefined) {
      // Dacă doar availableStock este actualizat, folosește totalStock existent pentru limitare
      const currentTotalStock = existing.totalStock.toNumber();
      updateData.availableStock = new Decimal(
        Math.min(updateScaffoldComponentDto.availableStock, currentTotalStock),
      );
    }

    return this.prisma.scaffoldComponent.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    // Verifică dacă componenta există și nu este ștersă
    await this.findOne(id);

    // Soft delete - setează deletedAt
    return this.prisma.scaffoldComponent.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
