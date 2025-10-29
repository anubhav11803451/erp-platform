import { ApiProperty } from '@nestjs/swagger';
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
    @ApiProperty({ example: 'Jane', description: "The student's first name" })
    @IsString()
    @IsNotEmpty()
    first_name: string;

    @ApiProperty({ example: 'Doe', description: "The student's last name" })
    @IsString()
    @IsNotEmpty()
    last_name: string;

    @ApiProperty({ example: 'jane.doe@example.com', description: "The student's email address" })
    @IsEmail()
    @IsOptional()
    email?: string; // Student's own email

    @ApiProperty({ example: '0987654321', description: "The student's phone number" })
    @IsString()
    @IsOptional()
    phone?: string; // Student's own phone

    @ApiProperty({ example: 'Springfield Elementary', description: "The student's school name" })
    @IsString()
    @IsOptional()
    school_name?: string;

    // --- This is the new part ---
    // We nest the guardian's info inside the student DTO
    @ApiProperty({ type: () => CreateGuardianDto })
    @IsObject()
    @ValidateNested()
    @Type(() => CreateGuardianDto)
    guardian: CreateGuardianDto;
    // --- End of new part ---
}
