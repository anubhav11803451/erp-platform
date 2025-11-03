import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '@erp/db/client';
import { RolesGuard } from '@/common/guards/roles.guard';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserWithoutPassword } from '@/auth/types';

@Controller('domains/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @Roles(UserRole.ADMIN) // <-- THIS WAS MISSING
    create(@Body() createUserInput: CreateUserDto): Promise<UserWithoutPassword> {
        // Note: In a real app, only an ADMIN should be able to create new users.
        return this.usersService.create(createUserInput);
    }

    @Get()
    @Roles(UserRole.ADMIN) // <-- THIS WAS MISSING
    findAll(): Promise<UserWithoutPassword[]> {
        return this.usersService.findAll();
    }
}
