import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreatePaymentDto {
    @IsUUID()
    @IsNotEmpty()
    studentId: string;

    @IsUUID()
    @IsNotEmpty()
    batchId: string;

    @IsNumber()
    @Min(1, { message: 'Amount must be greater than 0' })
    amount: number;

    @IsString()
    @IsNotEmpty()
    method: string; // e.g., "Cash", "UPI", "Stripe"

    @IsString()
    @IsOptional()
    notes?: string;
}

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}
