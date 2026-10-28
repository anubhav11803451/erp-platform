import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class PlatformOwnerJwtAuthGuard extends AuthGuard('platform-owner-jwt') {}
