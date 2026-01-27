import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // #region agent log
    const request = context.switchToHttp().getRequest();
    const path = request.url || request.path;
    fetch('http://127.0.0.1:7242/ingest/dc52974b-a705-44fa-9973-b4a502e44aca',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'roles.guard.ts:11',message:'RolesGuard canActivate called',data:{path},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/dc52974b-a705-44fa-9973-b4a502e44aca',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'roles.guard.ts:18',message:'Required roles check',data:{requiredRoles:requiredRoles||[],hasRequiredRoles:!!requiredRoles},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    if (!requiredRoles) {
      return true;
    }

    const { user } = request;

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/dc52974b-a705-44fa-9973-b4a502e44aca',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'roles.guard.ts:25',message:'User check',data:{hasUser:!!user,userRole:user?.role},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    if (!user) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/dc52974b-a705-44fa-9973-b4a502e44aca',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'roles.guard.ts:28',message:'Throwing ForbiddenException - no user',data:{path},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      throw new ForbiddenException('Utilizatorul nu este autentificat');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/dc52974b-a705-44fa-9973-b4a502e44aca',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'roles.guard.ts:35',message:'Role check result',data:{hasRole,userRole:user.role,requiredRoles},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    if (!hasRole) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/dc52974b-a705-44fa-9973-b4a502e44aca',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'roles.guard.ts:38',message:'Throwing ForbiddenException - insufficient role',data:{path,userRole:user.role,requiredRoles},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      throw new ForbiddenException('Nu aveți permisiunea necesară pentru această acțiune');
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/dc52974b-a705-44fa-9973-b4a502e44aca',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'roles.guard.ts:42',message:'RolesGuard passed',data:{path,userRole:user.role},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    return true;
  }
}
