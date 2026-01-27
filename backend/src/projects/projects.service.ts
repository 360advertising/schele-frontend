import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto) {
    return this.prisma.project.create({
      data: createProjectDto,
      include: {
        client: true,
      },
    });
  }

  async findAll() {
    return this.prisma.project.findMany({
      where: {
        deletedAt: null, // Excludează proiectele șterse (soft delete)
      },
      include: {
        client: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        deletedAt: null, // Verifică că nu este șters
      },
      include: {
        client: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Proiectul cu ID-ul ${id} nu a fost găsit`);
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    // Verifică dacă proiectul există și nu este șters
    await this.findOne(id);

    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        client: true,
      },
    });
  }

  async remove(id: string) {
    // Verifică dacă proiectul există și nu este șters
    await this.findOne(id);

    // Soft delete - setează deletedAt
    return this.prisma.project.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
