import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { CoreModule } from '../../core/core.module';

@Module({
    imports: [CoreModule],
    controllers: [AttendanceController],
    providers: [AttendanceService],
})
export class AttendanceModule {}
