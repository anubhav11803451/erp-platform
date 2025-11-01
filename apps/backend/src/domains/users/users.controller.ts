import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserRole } from '@erp/db/client';
import { RolesGuard } from '@/common/guards/roles.guard';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@Controller('domains/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @Roles(UserRole.ADMIN) // <-- THIS WAS MISSING
    create(@Body() createUserDto: CreateUserDto): Promise<User> {
        // Note: In a real app, only an ADMIN should be able to create new users.
        return this.usersService.create(createUserDto);
    }
}
