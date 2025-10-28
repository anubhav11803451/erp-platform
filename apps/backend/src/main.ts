import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Set global API prefix to match /api endpoint
    app.setGlobalPrefix('/v1/api');

    // Enable CORS for frontend connection
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });

    await app.listen(process.env.BACKEND_PORT ?? 3000);
    console.log(
        `Application is running on: http://localhost:${process.env.BACKEND_PORT ?? 3000}/v1/api`,
    );
}
void bootstrap();
