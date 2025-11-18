import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    ParseUUIDPipe,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '@erp/db/client';
import { AttendanceMarkDto, AttendanceQueryDto } from './dto/attendance.dto';

@Controller('features/attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) {}

    @Get('batch/:batchId')
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    getAttendanceForBatch(
        @Param('batchId', ParseUUIDPipe) batchId: string,
        @Query() query: AttendanceQueryDto,
    ) {
        // The query.date is now a validated Date object
        return this.attendanceService.getAttendanceForBatch(batchId, query.date);
    }

    @Post('mark')
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    markAttendance(@Body() dto: AttendanceMarkDto) {
        // The dto is now a fully validated object
        return this.attendanceService.markAttendance(dto);
    }
}
