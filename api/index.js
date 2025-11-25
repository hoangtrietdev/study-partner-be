// Vercel serverless function entry point
// This file loads and bootstraps the NestJS application

// Register ts-node and tsconfig-paths for TypeScript support
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
  },
});
require('tsconfig-paths/register');

let app;

async function bootstrap() {
  if (!app) {
    // Require at runtime to ensure all dependencies are loaded
    const { NestFactory } = require('@nestjs/core');
    const { ValidationPipe } = require('@nestjs/common');
    const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
    const { ExpressAdapter } = require('@nestjs/platform-express');
    const helmet = require('helmet');
    const cookieParser = require('cookie-parser');
    const express = require('express');

    // Load the AppModule from source (Vercel compiles TS automatically)
    const { AppModule } = require('../src/app.module');

    const expressApp = express();

    app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
      logger: ['error', 'warn', 'log'],
    });

    app.use(helmet());
    app.use(cookieParser());

    app.enableCors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

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

    return expressApp;
  }
  return app;
}

module.exports = async (req, res) => {
  const server = await bootstrap();
  return server(req, res);
};
