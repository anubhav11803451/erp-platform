import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { UsersModule } from '../../domains/users/users.module'; // Needed to satisfy the tutorId foreign key
import { BatchesService } from './batches.service';
import { BatchesController } from './batches.controller';

@Module({
    imports: [
        CoreModule,
        UsersModule, // Import UsersModule to ensure tutorId validation works
    ],
    controllers: [BatchesController],
    providers: [BatchesService],
    exports: [BatchesService], // Export so Enrollment, Payments, etc., can use it
})
export class BatchesModule {}
