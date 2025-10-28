import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsObject,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateGuardianDto } from '../../guardians/dto/create-guardian.dto';

export class CreateStudentDto {
    @IsString()
    @IsNotEmpty()
    first_name: string;

    @IsString()
    @IsNotEmpty()
    last_name: string;

    @IsEmail()
    @IsOptional()
    email?: string; // Student's own email

    @IsString()
    @IsOptional()
    phone?: string; // Student's own phone

    @IsString()
    @IsOptional()
    school_name?: string;

    // --- This is the new part ---
    // We nest the guardian's info inside the student DTO
    @IsObject()
    @ValidateNested()
    @Type(() => CreateGuardianDto)
    guardian: CreateGuardianDto;
    // --- End of new part ---
}
