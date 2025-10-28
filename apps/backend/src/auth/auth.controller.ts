import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { User } from '@erp/db';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    /**
     * Login endpoint
     * @param req - The request, which will have the user attached by LocalAuthGuard
     */
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Body() loginDto: LoginDto, @Request() req: { user: Omit<User, 'password_hash'> }) {
        // LocalAuthGuard runs, validates, and attaches the user to req.
        // All we have to do is sign the token.
        return this.authService.login(req.user);
    }
}
