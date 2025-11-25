import * as fs from 'fs';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';

async function exportSwagger() {
  const app = await NestFactory.create(AppModule);

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

  // Export JSON
  fs.writeFileSync(path.join(__dirname, '../openapi.json'), JSON.stringify(document, null, 2));

  // Export YAML
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const yaml = require('js-yaml');
  fs.writeFileSync(path.join(__dirname, '../openapi.yaml'), yaml.dump(document));

  console.log('✅ OpenAPI spec exported to openapi.json and openapi.yaml');
  await app.close();
}

exportSwagger();
