"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const express_1 = __importDefault(require("express"));
let cachedServer;
async function createServer() {
    if (!cachedServer) {
        const expressApp = (0, express_1.default)();
        const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressApp), {
            logger: ['error', 'warn', 'log'],
        });
        app.use((0, helmet_1.default)());
        app.use((0, cookie_parser_1.default)());
        app.enableCors({
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true,
        });
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Groq Study Partner API')
            .setDescription('Tinder-style study partner discovery app API')
            .setVersion('1.0')
            .addBearerAuth()
            .addTag('auth', 'Authentication endpoints')
            .addTag('users', 'User management endpoints')
            .addTag('matches', 'Match management endpoints')
            .addTag('messages', 'Message management endpoints')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
        await app.init();
        cachedServer = expressApp;
    }
    return cachedServer;
}
exports.default = async (req, res) => {
    const server = await createServer();
    return server(req, res);
};
if (require.main === module) {
    async function bootstrap() {
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        app.use((0, helmet_1.default)());
        app.use((0, cookie_parser_1.default)());
        app.enableCors({
            origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
            credentials: true,
        });
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Groq Study Partner API')
            .setDescription('Tinder-style study partner discovery app API')
            .setVersion('1.0')
            .addBearerAuth()
            .addTag('auth', 'Authentication endpoints')
            .addTag('users', 'User management endpoints')
            .addTag('matches', 'Match management endpoints')
            .addTag('messages', 'Message management endpoints')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
        const port = process.env.PORT || 3001;
        await app.listen(port);
        console.log(`🚀 Application is running on: http://localhost:${port}`);
        console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
    }
    bootstrap();
}
//# sourceMappingURL=main.js.map