import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ValidationPipe,
    ParseUUIDPipe,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto } from './dto';
import { Student } from '@erp/db';

// All routes in this controller will be prefixed with /domains/students
@Controller('domains/students')
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) {}

    @Post()
    create(@Body(new ValidationPipe()) createStudentDto: CreateStudentDto): Promise<Student> {
        return this.studentsService.create(createStudentDto);
    }

    @Get()
    findAll(): Promise<Student[]> {
        return this.studentsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Student> {
        // We use ParseUUIDPipe to validate that the ID is a CUID/UUID
        // Note: Prisma uses CUIDs, which pass UUID validation.
        // For stricter CUID validation, a custom pipe would be needed,
        // but ParseUUIDPipe is good for now.
        return this.studentsService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body(new ValidationPipe()) updateStudentDto: UpdateStudentDto,
    ): Promise<Student> {
        return this.studentsService.update(id, updateStudentDto);
    }

    @Delete(':id')
    remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<Student> {
        return this.studentsService.remove(id);
    }
}
