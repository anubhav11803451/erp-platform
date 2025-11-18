import { paymentCreateSchema } from '@erp/shared';
import { PartialType } from '@nestjs/mapped-types';
import { createZodDto } from 'nestjs-zod/dto';

export class CreatePaymentDto extends createZodDto(paymentCreateSchema) {}

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}
