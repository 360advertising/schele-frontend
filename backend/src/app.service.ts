import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Schele Management API - Backend Running';
  }

  async getHealth() {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
        uptime: process.uptime(),
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        uptime: process.uptime(),
        error: error.message,
      };
    }
  }

  getApiInfo() {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    return {
      name: 'Schele Management API',
      version: '1.0.0',
      description: 'API pentru gestionarea schelelor, clienților, proceselor verbale și facturilor proforma',
      endpoints: {
        health: `${baseUrl}/health`,
        auth: {
          register: `${baseUrl}/auth/register`,
          login: `${baseUrl}/auth/login`,
          profile: `${baseUrl}/auth/profile`,
        },
        clients: `${baseUrl}/clients`,
        contracts: `${baseUrl}/contracts`,
        projects: `${baseUrl}/projects`,
        scaffolds: `${baseUrl}/scaffolds`,
        components: `${baseUrl}/components`,
        projectPricings: `${baseUrl}/project-pricings`,
        workReports: `${baseUrl}/work-reports`,
        proformaInvoices: `${baseUrl}/proforma-invoices`,
        dashboard: `${baseUrl}/dashboard/summary`,
      },
      documentation: 'Pentru a crea un utilizator, accesați: ' + `${baseUrl}/auth/register`,
    };
  }
}
