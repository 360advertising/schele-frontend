import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule } from './clients/clients.module';
import { ScaffoldsModule } from './scaffolds/scaffolds.module';
import { ScaffoldComponentsModule } from './scaffold-components/scaffold-components.module';
import { WorkReportsModule } from './work-reports/work-reports.module';
import { ProformaInvoicesModule } from './proforma-invoices/proforma-invoices.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ProjectsModule } from './projects/projects.module';
import { ContractsModule } from './contracts/contracts.module';
import { ProjectPricingsModule } from './project-pricings/project-pricings.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    AuthModule,
    ClientsModule,
    ProjectsModule,
    ContractsModule,
    ScaffoldsModule,
    ScaffoldComponentsModule,
    ProjectPricingsModule,
    WorkReportsModule,
    ProformaInvoicesModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
