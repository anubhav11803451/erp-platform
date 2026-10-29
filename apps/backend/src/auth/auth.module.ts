import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { CoreModule } from '../core/core.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PlatformOwnerJwtAuthGuard } from '../common/guards/platform-owner-jwt-auth.guard';
import { PlatformOwnerJwtStrategy } from '../common/strategies/platform-owner-jwt.strategy';

@Module({
    imports: [
        CoreModule,
        ThrottlerModule.forRoot([{ limit: 5, ttl: 60_000 }]),
        PassportModule.register({ defaultStrategy: 'platform-owner-jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getOrThrow<string>('JWT_SECRET'),
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, PlatformOwnerJwtStrategy, PlatformOwnerJwtAuthGuard],
    exports: [PlatformOwnerJwtAuthGuard],
})
export class AuthModule {}
