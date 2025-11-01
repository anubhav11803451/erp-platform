import { UserRole } from '@erp/db/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'user@example.com', description: "The user's email address" })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123', description: "The user's password" })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiProperty({ example: 'John', description: "The user's first name" })
    @IsString()
    @IsNotEmpty()
    first_name: string;

    @ApiProperty({ example: 'Doe', description: "The user's last name" })
    @IsString()
    @IsNotEmpty()
    last_name: string;

    @ApiProperty({ enum: UserRole, default: UserRole.STAFF, description: "The user's role" })
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}
