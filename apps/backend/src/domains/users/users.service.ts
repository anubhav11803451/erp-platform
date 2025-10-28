import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserRole } from '@erp/db';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreateUserDto): Promise<User> {
        // Hash the password before saving
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

        return this.prisma.user.create({
            data: {
                email: dto.email,
                first_name: dto.first_name,
                last_name: dto.last_name,
                role: dto.role || UserRole.STAFF,
                password_hash: hashedPassword,
            },
        });
    }

    /**
     * Finds a user by their unique email.
     * Used by the AuthModule to validate login.
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    // Find by ID (useful for JWT)
    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id } });
    }

    // ... you can add findAll, update, delete as needed
}
