import { User, UserRole } from '@erp/db/client';

// Define our token payload
export interface TokenPayload {
    email: string;
    sub: string;
    role: UserRole;
}

// Define the shape of our login response
export interface AuthResponse {
    access_token: string;
    csrf_token: string;
    user: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        role: UserRole;
    };
}

export type UserWithoutPassword = Omit<User, 'password'>;
