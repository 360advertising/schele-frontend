import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScaffoldDto } from './dto/create-scaffold.dto';
import { UpdateScaffoldDto } from './dto/update-scaffold.dto';

@Injectable()
export class ScaffoldsService {
  constructor(private prisma: PrismaService) {}

  async create(createScaffoldDto: CreateScaffoldDto) {
    return this.prisma.scaffold.create({
      data: {
        ...createScaffoldDto,
        status: createScaffoldDto.status || 'AVAILABLE',
      },
    });
  }

  async findAll() {
    return this.prisma.scaffold.findMany({
      where: {
        deletedAt: null, // Excludează schelele șterse (soft delete)
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const scaffold = await this.prisma.scaffold.findFirst({
      where: {
        id,
        deletedAt: null, // Verifică că nu este șters
      },
    });

    if (!scaffold) {
      throw new NotFoundException(`Schela cu ID-ul ${id} nu a fost găsită`);
    }

    return scaffold;
  }

  async update(id: string, updateScaffoldDto: UpdateScaffoldDto) {
    // Verifică dacă schela există și nu este ștersă
    await this.findOne(id);

    return this.prisma.scaffold.update({
      where: { id },
      data: updateScaffoldDto,
    });
  }

  async remove(id: string) {
    // Verifică dacă schela există și nu este ștersă
    await this.findOne(id);

    // Soft delete - setează deletedAt
    return this.prisma.scaffold.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
