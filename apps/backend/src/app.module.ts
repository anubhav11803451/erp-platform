import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { CoreModule } from './core/core.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { OwnerModule } from './owner/owner.module';

@Module({
    imports: [
        // 1. Config Module: Set to global
        // This makes .env variables available everywhere via ConfigService
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '../../.env',
        }),
        CoreModule,
        AuthModule,
        OwnerModule,
    ],
    controllers: [HealthController],
    providers: [
        { provide: APP_PIPE, useClass: ZodValidationPipe },
        { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    ],
})
export class AppModule {}
