import { Injectable } from '@nestjs/common';
import { UsersService } from '@/domains/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@erp/db';
import omit from 'lodash/omit';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    /**
     * Validates a user based on email and password.
     * Called by LocalStrategy.
     */
    async validateUser(email: string, pass: string): Promise<Omit<User, 'password_hash'> | null> {
        const user = await this.usersService.findByEmail(email);
        if (user) {
            const encryptedPass: string = user.password_hash;
            await bcrypt.compare(pass, encryptedPass);
            // Passwords match. Return user *without* the password hash.

            //use loadash omit
            return omit(user, 'password_hash');
        }
        return null; // Invalid credentials
    }

    /**
     * Logs in a user and returns a JWT.
     * Called by the AuthController.
     */
    async login(user: Omit<User, 'password_hash'>) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }), // Refresh token expires in 7 days
        };
    }
}
