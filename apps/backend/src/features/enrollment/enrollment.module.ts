import { Module } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';
import { CoreModule } from 'src/core/core.module';

@Module({
    imports: [CoreModule],
    controllers: [EnrollmentController],
    providers: [EnrollmentService],
})
export class EnrollmentModule {}
