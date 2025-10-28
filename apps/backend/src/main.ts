import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Set global API prefix to match /api endpoint
    app.setGlobalPrefix('/v1/api');

    // Enable CORS for frontend connection
    app.enableCors({
        origin: 'http://localhost:5173',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
        preflightContinue: true,
    });

    await app.listen(process.env.PORT ?? 3000);
    console.log(`Application is running on: http://localhost:3000/v1/api`);
}
void bootstrap();
