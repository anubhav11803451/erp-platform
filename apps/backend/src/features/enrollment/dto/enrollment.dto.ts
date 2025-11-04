import { IsNotEmpty, IsNumber, IsUUID, Min, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateEnrollmentDto {
    @IsUUID()
    @IsNotEmpty()
    studentId: string;

    @IsUUID()
    @IsNotEmpty()
    batchId: string;

    @IsNumber()
    @Min(0, { message: 'Amount must be greater than 0' })
    total_fee_agreed: number;
}

export class DisenrollDto {
    @IsUUID()
    @IsNotEmpty()
    batchId: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsUUID('all', { each: true })
    studentIds: string[];
}
