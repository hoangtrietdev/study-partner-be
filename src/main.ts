import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import express, { Express } from 'express';

let cachedServer: Express;

async function createServer(): Promise<Express> {
  if (!cachedServer) {
    const expressApp = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
      logger: ['error', 'warn', 'log'],
    });

    // Security
    app.use(helmet());
    app.use(cookieParser());

    // CORS
    app.enableCors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    });

    // Validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Swagger
    const config = new DocumentBuilder()
      .setTitle('Groq Study Partner API')
      .setDescription('Tinder-style study partner discovery app API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management endpoints')
      .addTag('matches', 'Match management endpoints')
      .addTag('messages', 'Message management endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.init();
    cachedServer = expressApp;
  }

  return cachedServer;
}

// For Vercel serverless
export default async (req: any, res: any) => {
  const server = await createServer();
  return server(req, res);
};

// For local development
if (require.main === module) {
  async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Security
    app.use(helmet());
    app.use(cookieParser());

    // CORS
    app.enableCors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    });

    // Validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Swagger
    const config = new DocumentBuilder()
      .setTitle('Groq Study Partner API')
      .setDescription('Tinder-style study partner discovery app API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management endpoints')
      .addTag('matches', 'Match management endpoints')
      .addTag('messages', 'Message management endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
  }

  bootstrap();
}
