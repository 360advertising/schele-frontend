import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', // Allow backend's own origin for registration form
      'https://schele.360digital.ro',
      process.env.FRONTEND_URL,
      'https://backend-schele.360digital.ro',
    ].filter(Boolean);

    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          logger.warn(`CORS blocked origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    });
    
    // Global exception filter to ensure all errors return JSON
    app.useGlobalFilters(new AllExceptionsFilter());
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    
    const port = process.env.PORT || 3001;
    await app.listen(port, '0.0.0.0');
    
    logger.log(`🚀 Backend running on http://0.0.0.0:${port}`);
    logger.log(`📚 API Info: http://0.0.0.0:${port}/api`);
    logger.log(`❤️  Health Check: http://0.0.0.0:${port}/health`);
    logger.log(`👤 Register User: http://0.0.0.0:${port}/auth/register`);
    logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    logger.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
