import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
// import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';

import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { PrismaClientExceptionFilter } from '@/common/filters/prisma-client-exception.filter';
import { cleanupOpenApiDoc } from 'nestjs-zod';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // --- Security Headers ---
    app.use(helmet());

    // --- Cookie Parser ---
    app.use(cookieParser());

    // Set global API prefix to match /api endpoint
    app.setGlobalPrefix('/v1/api');

    // Global ValidationPipe (unchanged)
    // app.useGlobalPipes(new ZodValidationPipe());
    // app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

    // Swagger API documentation
    const config = new DocumentBuilder()
        .setTitle('ERP Platform API')
        .setDescription('ERP Platform API documentation for developers')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const options: SwaggerDocumentOptions = {
        deepScanRoutes: true,
    };
    const document = SwaggerModule.createDocument(app, config, options);
    SwaggerModule.setup('api', app, cleanupOpenApiDoc(document));

    app.enableCors({
        origin: ['http://localhost:5173', 'http://localhost:4173'], // frontend URL
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept, Authorization, X-CSRF-Token', // Added X-CSRF-Token
        credentials: true, // This is CRITICAL for cookies
    });

    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

    await app.listen(process.env.BACKEND_PORT ?? 3000);
    console.log(
        `Application is running on: http://localhost:${process.env.BACKEND_PORT ?? 3000}/v1/api`,
    );
}
void bootstrap();
