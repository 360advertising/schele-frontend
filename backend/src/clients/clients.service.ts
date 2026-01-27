import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    return this.prisma.client.create({
      data: createClientDto,
    });
  }

  async findAll() {
    return this.prisma.client.findMany({
      where: {
        deletedAt: null, // Excludează clienții șterși (soft delete)
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findFirst({
      where: {
        id,
        deletedAt: null, // Verifică că nu este șters
      },
    });

    if (!client) {
      throw new NotFoundException(`Clientul cu ID-ul ${id} nu a fost găsit`);
    }

    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    // Verifică dacă clientul există și nu este șters
    await this.findOne(id);

    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }

  async remove(id: string) {
    // Verifică dacă clientul există și nu este șters
    await this.findOne(id);

    // Soft delete - setează deletedAt
    return this.prisma.client.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
