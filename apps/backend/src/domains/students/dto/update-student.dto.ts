// We use NestJS's mapped-types to create an Update DTO
// This automatically makes all fields from CreateStudentDto optional
import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentDto } from './create-student.dto';

export class UpdateStudentDto extends PartialType(CreateStudentDto) {}
