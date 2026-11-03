import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import {
    InstitutionOperationsController,
    InstitutionStaffOperationsController,
} from './institution-operations.controller';
import { InstitutionOperationsService } from './institution-operations.service';

@Module({
    imports: [AuthModule],
    controllers: [InstitutionOperationsController, InstitutionStaffOperationsController],
    providers: [InstitutionOperationsService],
})
export class InstitutionOperationsModule {}
