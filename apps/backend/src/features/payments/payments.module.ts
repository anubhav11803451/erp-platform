import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { CoreModule } from '../../core/core.module';

@Module({
    imports: [CoreModule],
    controllers: [PaymentsController],
    providers: [PaymentsService],
})
export class PaymentsModule {}
