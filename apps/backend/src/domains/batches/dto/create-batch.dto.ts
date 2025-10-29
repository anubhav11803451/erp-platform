import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBatchDto {
    @IsString()
    @IsNotEmpty()
    name: string; // e.g., "Class 10 CBSE Maths - 2025"

    @IsString()
    @IsOptional()
    subject?: string; // e.g., "Mathematics"

    // tutorId is the ID of a User who is the assigned tutor
    @IsUUID('4')
    @IsOptional()
    tutorId?: string;

    @IsDateString()
    @IsOptional()
    start_date?: Date;

    @IsDateString()
    @IsOptional()
    end_date?: Date;
}
