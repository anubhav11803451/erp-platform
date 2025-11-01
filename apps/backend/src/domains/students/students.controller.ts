import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseUUIDPipe,
    UseGuards,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto } from './dto';
import { Student, UserRole } from '@erp/db/client';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

// All routes in this controller will be prefixed with /domains/students
@Controller('domains/students')
// Apply both guards to the entire controller
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
    constructor(private readonly studentsService: StudentsService) {}

    @Post()
    @Roles(UserRole.ADMIN) // <-- Only ADMINs can create
    create(@Body() createStudentDto: CreateStudentDto): Promise<Student> {
        return this.studentsService.create(createStudentDto);
    }

    @Get()
    @Roles(UserRole.ADMIN, UserRole.STAFF) // <-- Both can view students
    findAll(): Promise<Student[]> {
        return this.studentsService.findAll();
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.STAFF) // <-- Both can view one student
    findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Student | null> {
        return this.studentsService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN) // <-- Only ADMINs can update
    update(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() updateStudentDto: UpdateStudentDto,
    ): Promise<Student> {
        return this.studentsService.update(id, updateStudentDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN) // <-- Only ADMINs can delete
    remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<Student> {
        return this.studentsService.remove(id);
    }
}
