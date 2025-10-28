import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGuardianDto {
    @IsString()
    @IsNotEmpty()
    first_name: string;

    @IsString()
    @IsNotEmpty()
    last_name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsOptional()
    phone?: string;
}
