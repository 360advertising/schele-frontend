import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/dc52974b-a705-44fa-9973-b4a502e44aca',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'http-exception.filter.ts:15',message:'Exception filter caught exception',data:{path:request.url,method:request.method,exceptionType:exception?.constructor?.name,isHttpException:exception instanceof HttpException},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    // Handle validation errors and other structured responses
    let message: string;
    let errors: any = undefined;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object') {
      const resp = exceptionResponse as any;
      message = resp.message || resp.error || 'An error occurred';
      
      // Include validation errors if present
      if (Array.isArray(resp.message)) {
        errors = resp.message;
        message = 'Validation failed';
      } else if (resp.message && typeof resp.message === 'object') {
        errors = resp.message;
        message = 'Validation failed';
      }
    } else {
      message = 'An error occurred';
    }

    // Always return JSON, never HTML
    const jsonResponse: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };

    if (errors) {
      jsonResponse.errors = errors;
    }

    response.status(status).json(jsonResponse);
  }
}
