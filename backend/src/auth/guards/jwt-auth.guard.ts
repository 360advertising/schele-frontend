import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // #region agent log
    const request = context.switchToHttp().getRequest();
    const path = request.url || request.path;
    fetch('http://127.0.0.1:7242/ingest/dc52974b-a705-44fa-9973-b4a502e44aca',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'jwt-auth.guard.ts:13',message:'JwtAuthGuard canActivate called',data:{path,hasAuthHeader:!!request.headers?.authorization,method:request.method},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // Verifică dacă ruta este marcată ca publică
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/dc52974b-a705-44fa-9973-b4a502e44aca',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'jwt-auth.guard.ts:22',message:'Route is public, allowing access',data:{path},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      return true; // Permite accesul fără autentificare
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/dc52974b-a705-44fa-9973-b4a502e44aca',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'jwt-auth.guard.ts:27',message:'Route requires auth, calling super.canActivate',data:{path},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const result = super.canActivate(context);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/dc52974b-a705-44fa-9973-b4a502e44aca',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'jwt-auth.guard.ts:29',message:'super.canActivate result',data:{result:result instanceof Promise ? 'Promise' : result,path},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return result;
  }
}
