import { User } from '@erp/db/client';

//Request Types
export interface TokenPayload {
    email: string;
    sub: string;
    role: UserResponse['role'];
}

//Response Types
export type UserResponse = Omit<User, 'password'>;

export interface AuthResponse {
    access_token: string;
    csrf_token: string;
    user: UserResponse;
}
