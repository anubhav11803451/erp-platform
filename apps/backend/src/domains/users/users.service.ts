import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma.service';
// import { CreateUserDto } from './dto/create-user.dto';
import { Prisma, User, UserRole } from '@erp/db/client';
import * as bcrypt from 'bcrypt';

import { UserResponse } from '@erp/shared';
import { UtilsService } from '@/utils/utils.service';

@Injectable()
export class UsersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly utilsService: UtilsService,
    ) {}

    async create(createUserInput: Prisma.UserCreateInput): Promise<UserResponse> {
        // Hash the password before saving
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(createUserInput.password as string, saltRounds);

        const user = await this.prisma.extendedPrismaClient().user.create({
            data: {
                ...createUserInput,
                role: createUserInput.role || UserRole.STAFF,
                password: hashedPassword,
            },
        });
        return this.utilsService.getUserResponse(user);
    }

    async update(id: string, updateUserInput: Prisma.UserUpdateInput): Promise<UserResponse> {
        const user = await this.prisma.extendedPrismaClient().user.update({
            where: { id },
            data: updateUserInput,
        });
        return this.utilsService.getUserResponse(user);
    }

    /**
     * Finds a user by their unique email.
     * Used by the AuthModule to validate login.
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.extendedPrismaClient().user.findUnique({
            where: { email },
        });
    }

    // Find by ID (useful for JWT)
    async findById(id: string): Promise<UserResponse | null> {
        try {
            return this.prisma.extendedPrismaClient().user.findUnique({
                where: { id },
                omit: { password: true },
            });
        } catch (error) {
            throw new NotFoundException(`User with ID "${id}" not found`, { cause: error });
        }
    }

    async findAll(): Promise<UserResponse[]> {
        return this.prisma.extendedPrismaClient().user.findMany({ omit: { password: true } });
    }

    async remove(id: string): Promise<UserResponse> {
        try {
            return await this.prisma.extendedPrismaClient().user.delete({
                where: { id },
                omit: { password: true },
            });
        } catch (error) {
            // Handle case where the student to delete doesn't exist
            throw new NotFoundException(`User with ID "${id}" not found`, { cause: error });
        }
    }
}
