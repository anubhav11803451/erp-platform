import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Set global API prefix to match /api endpoint
    app.setGlobalPrefix('/v1/api');

    // This tells NestJS to use the ValidationPipe on
    // *every* incoming request for *all* controllers.
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // Automatically strip properties that don't exist in the DTO
            forbidNonWhitelisted: true, // Throw an error if non-DTO properties are sent
            transform: true, // Automatically transform payloads to DTO class instances
        }),
    );

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
    SwaggerModule.setup('api', app, document);

    // Enable CORS for frontend connection
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: true,
    });

    await app.listen(process.env.BACKEND_PORT ?? 3000);
    console.log(
        `Application is running on: http://localhost:${process.env.BACKEND_PORT ?? 3000}/v1/api`,
    );
}
void bootstrap();
