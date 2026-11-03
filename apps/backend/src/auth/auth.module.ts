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
import { AccountSessionJwtStrategy } from '../common/strategies/account-session-jwt.strategy';
import { InstitutionAdminJwtAuthGuard } from '../common/guards/institution-admin-jwt-auth.guard';
import { InstitutionAdminInvitationController } from './institution-admin-invitation.controller';
import { InstitutionAdminInvitationService } from './institution-admin-invitation.service';
import { InstitutionAdminInvitationContinuationCleanupService } from './institution-admin-invitation-continuation-cleanup.service';
import { InvitationSecurityHeadersInterceptor } from '../common/interceptors/invitation-security-headers.interceptor';
import { AccountSessionJwtAuthGuard } from '../common/guards/account-session-jwt-auth.guard';
import { InstitutionStaffJwtAuthGuard } from '../common/guards/institution-staff-jwt-auth.guard';
import { InstitutionStaffController } from './institution-staff.controller';
import { InstitutionStaffInvitationController } from './institution-staff-invitation.controller';
import { InstitutionStaffInvitationService } from './institution-staff-invitation.service';

@Module({
    imports: [
        CoreModule,
        ThrottlerModule.forRoot([{ limit: 5, ttl: 60_000 }]),
        PassportModule.register({ defaultStrategy: 'account-session-jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.getOrThrow<string>('JWT_SECRET'),
            }),
        }),
    ],
    controllers: [
        AuthController,
        InstitutionAdminInvitationController,
        InstitutionStaffController,
        InstitutionStaffInvitationController,
    ],
    providers: [
        AuthService,
        InstitutionAdminInvitationService,
        InstitutionAdminInvitationContinuationCleanupService,
        InstitutionStaffInvitationService,
        PlatformOwnerJwtStrategy,
        AccountSessionJwtAuthGuard,
        PlatformOwnerJwtAuthGuard,
        AccountSessionJwtStrategy,
        InstitutionAdminJwtAuthGuard,
        InstitutionStaffJwtAuthGuard,
        InvitationSecurityHeadersInterceptor,
    ],
    exports: [
        PlatformOwnerJwtAuthGuard,
        InstitutionAdminJwtAuthGuard,
        InstitutionStaffJwtAuthGuard,
        InstitutionStaffInvitationService,
        ThrottlerModule,
    ],
})
export class AuthModule {}
