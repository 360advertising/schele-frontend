import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const allowedOrigins = [
    'http://localhost:3000',
    'https://schele.360digital.ro',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  const port = 3001;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();
