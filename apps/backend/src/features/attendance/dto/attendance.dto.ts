import { attendanceQuerySchema, markAttendanceSchema } from '@erp/shared';
import { createZodDto } from 'nestjs-zod/dto';

export class AttendanceQueryDto extends createZodDto(attendanceQuerySchema) {}

export class AttendanceMarkDto extends createZodDto(markAttendanceSchema) {}
