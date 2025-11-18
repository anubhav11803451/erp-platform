import {
    Controller,
    Post,
    Body,
    UseGuards,
    Get,
    Param,
    ParseUUIDPipe,
    Delete,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto, RemoveEnrollmentDto } from './dto/enrollment.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole, StudentBatch } from '@erp/db/client';

@Controller('features/enrollment')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentController {
    constructor(private readonly enrollmentService: EnrollmentService) {}

    @Post()
    @Roles(UserRole.ADMIN, UserRole.STAFF) // Only Admins or Staff can enroll students
    create(@Body() createEnrollmentDto: CreateEnrollmentDto): Promise<StudentBatch> {
        return this.enrollmentService.create(createEnrollmentDto);
    }

    @Get('batch/:batchId')
    @Roles(UserRole.ADMIN, UserRole.STAFF) // Admins or Staff can see who is enrolled
    getEnrollmentsByBatch(@Param('batchId', ParseUUIDPipe) batchId: string) {
        return this.enrollmentService.getEnrollmentsByBatch(batchId);
    }

    @Get('student/:studentId')
    @Roles(UserRole.ADMIN, UserRole.STAFF) // Admins or Staff can see
    getEnrollmentsByStudent(@Param('studentId', ParseUUIDPipe) studentId: string) {
        return this.enrollmentService.getEnrollmentsByStudent(studentId);
    }

    @Delete('disenroll')
    @Roles(UserRole.ADMIN) // Only Admins can disenroll
    @HttpCode(HttpStatus.OK)
    disenroll(@Body() dto: RemoveEnrollmentDto) {
        return this.enrollmentService.disenroll(dto);
    }
}
