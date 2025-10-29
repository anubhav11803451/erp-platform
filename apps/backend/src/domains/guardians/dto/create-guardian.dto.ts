import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGuardianDto {
    @ApiProperty({ example: 'John', description: "The guardian's first name" })
    @IsString()
    @IsNotEmpty()
    first_name: string;

    @ApiProperty({ example: 'Doe', description: "The guardian's last name" })
    @IsString()
    @IsNotEmpty()
    last_name: string;

    @ApiProperty({ example: 'john.doe@example.com', description: "The guardian's email address" })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: '1234567890', description: "The guardian's phone number" })
    @IsString()
    @IsOptional()
    phone?: string;
}
