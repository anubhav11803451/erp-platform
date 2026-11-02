import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AccountSessionJwtAuthGuard extends AuthGuard('account-session-jwt') {}
