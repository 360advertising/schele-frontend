import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTING)
  getSummary() {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/dc52974b-a705-44fa-9973-b4a502e44aca',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'dashboard.controller.ts:16',message:'getSummary endpoint called',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return this.dashboardService.getSummary();
  }
}
