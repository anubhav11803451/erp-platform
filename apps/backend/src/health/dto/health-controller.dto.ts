import { healthResponseSchema } from '@erp/shared';
import { createZodDto } from 'nestjs-zod/dto';

export class HealthResponseDto extends createZodDto(healthResponseSchema) {}
