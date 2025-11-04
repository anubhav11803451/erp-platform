import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma.service';
// import { CreateUserDto } from './dto/create-user.dto';
import { Prisma, User, UserRole } from '@erp/db/client';
import * as bcrypt from 'bcrypt';
import { UserWithoutPassword } from '@/auth/types';
import { omit } from 'lodash';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async create(createUserInput: Prisma.UserCreateInput): Promise<UserWithoutPassword> {
        // Hash the password before saving
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(createUserInput.password as string, saltRounds);

        const user = this.prisma.user.create({
            data: {
                ...createUserInput,
                role: createUserInput.role || UserRole.STAFF,
                password: hashedPassword,
            },
        });
        return omit(user, ['password']) as UserWithoutPassword;
    }

    async update(
        id: string,
        updateUserInput: Prisma.UserUpdateInput,
    ): Promise<UserWithoutPassword> {
        const user = this.prisma.user.update({
            where: { id },
            data: updateUserInput,
        });
        return omit(user, ['password']) as UserWithoutPassword;
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
    async findById(id: string): Promise<UserWithoutPassword | null> {
        try {
            return this.prisma.user.findUnique({
                where: { id },
            });
        } catch (error) {
            throw new NotFoundException(`User with ID "${id}" not found`, { cause: error });
        }
    }

    async findAll(): Promise<UserWithoutPassword[]> {
        return this.prisma.user.findMany();
    }

    async remove(id: string): Promise<UserWithoutPassword> {
        try {
            return await this.prisma.user.delete({
                where: { id },
            });
        } catch (error) {
            // Handle case where the student to delete doesn't exist
            throw new NotFoundException(`User with ID "${id}" not found`, { cause: error });
        }
    }
}
