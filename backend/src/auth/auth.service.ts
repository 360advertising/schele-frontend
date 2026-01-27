import { Injectable, ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto, currentUserRole?: UserRole) {
    // Verifică dacă încearcă să creeze un ADMIN
    if (registerDto.role === UserRole.ADMIN) {
      // Verifică câți admini reali (non-default) există
      const adminCount = await this.prisma.user.count({
        where: { 
          deletedAt: null,
          email: { not: 'admin@local.dev' }, // Exclude default seeded admin
          role: UserRole.ADMIN,
        },
      });

      // Dacă nu există admini reali (doar default admin din seed), permite crearea primului admin real
      if (adminCount === 0) {
        // Permite crearea primului admin real
      } else {
        // Dacă există deja admini reali și nu este autentificat ca ADMIN
        if (!currentUserRole || currentUserRole !== UserRole.ADMIN) {
          throw new ForbiddenException('Nu puteți crea un cont de administrator fără autentificare');
        }
      }
    } else {
      // Pentru roluri non-ADMIN, verifică doar dacă utilizatorul autentificat are permisiuni
      if (currentUserRole && currentUserRole !== UserRole.ADMIN) {
        throw new ForbiddenException('Doar administratorii pot înregistra utilizatori noi');
      }
    }

    // Verifică dacă utilizatorul există deja
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Un utilizator cu acest email există deja');
    }

    // Hash parola
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Creează utilizatorul
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        role: registerDto.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  async login(loginDto: LoginDto) {
    // Găsește utilizatorul
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Email sau parolă incorectă');
    }

    // Verifică parola
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email sau parolă incorectă');
    }

    // Generează JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
