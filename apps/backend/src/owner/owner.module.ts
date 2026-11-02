import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OwnerController } from './owner.controller';
import { OwnerService } from './owner.service';
import { InvitationSecurityHeadersInterceptor } from '../common/interceptors/invitation-security-headers.interceptor';

@Module({
    imports: [AuthModule],
    controllers: [OwnerController],
    providers: [OwnerService, InvitationSecurityHeadersInterceptor],
})
export class OwnerModule {}
