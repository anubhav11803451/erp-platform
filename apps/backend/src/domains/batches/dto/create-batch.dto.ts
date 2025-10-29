import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBatchDto {
    @ApiProperty({ example: 'Class 10 CBSE Maths - 2025', description: 'The name of the batch' })
    @IsString()
    @IsNotEmpty()
    name: string; // e.g., "Class 10 CBSE Maths - 2025"

    @ApiProperty({ example: 'Mathematics', description: 'The subject of the batch' })
    @IsString()
    @IsOptional()
    subject?: string; // e.g., "Mathematics"

    // tutorId is the ID of a User who is the assigned tutor
    @ApiProperty({ example: 'a uuid', description: 'The ID of the tutor' })
    @IsUUID('4')
    @IsOptional()
    tutorId?: string;

    @ApiProperty({ example: '2025-01-01', description: 'The start date of the batch' })
    @IsDateString()
    @IsOptional()
    start_date?: Date;

    @ApiProperty({ example: '2025-12-31', description: 'The end date of the batch' })
    @IsDateString()
    @IsOptional()
    end_date?: Date;
}
