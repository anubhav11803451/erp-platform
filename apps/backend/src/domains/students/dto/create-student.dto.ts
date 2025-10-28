// We use class-validator to ensure data is correctly shaped
import {
    IsString,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsDateString,
} from 'class-validator';

export class CreateStudentDto {
    @IsString()
    @IsNotEmpty()
    first_name: string;

    @IsString()
    @IsNotEmpty()
    last_name: string;

    @IsEmail()
    email: string;

    @IsPhoneNumber(undefined)
    phone: string;

    @IsOptional()
    @IsDateString()
    dob?: string; // We take string and Prisma converts to DateTime

    @IsOptional()
    @IsString()
    school_name?: string;

    @IsOptional()
    @IsString()
    guardian_name?: string;

    @IsOptional()
    @IsPhoneNumber(undefined)
    guardian_phone?: string;
}
