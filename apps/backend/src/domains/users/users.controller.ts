import {
    Controller,
    Post,
    Body,
    UseGuards,
    Get,
    Param,
    Patch,
    ParseUUIDPipe,
    Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '@erp/db/client';
import { RolesGuard } from '@/common/guards/roles.guard';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserWithoutPassword } from '@/auth/types';
import { UpdateUserDto } from './dto/update-user.dto';

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

    //update
    @Patch(':id')
    @Roles(UserRole.ADMIN) // <-- THIS WAS MISSING
    update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() updateUserInput: UpdateUserDto,
    ): Promise<UserWithoutPassword> {
        return this.usersService.update(id, updateUserInput);
    }

    @Get()
    @Roles(UserRole.ADMIN) // <-- THIS WAS MISSING
    findAll(): Promise<UserWithoutPassword[]> {
        return this.usersService.findAll();
    }

    @Get(':id')
    @Roles(UserRole.ADMIN) // <-- THIS WAS MISSING
    findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<UserWithoutPassword | null> {
        return this.usersService.findById(id);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN) // <-- THIS WAS MISSING
    remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<UserWithoutPassword> {
        return this.usersService.remove(id);
    }
}
