import { Module } from '@nestjs/common';
import { CoreModule } from '../../core/core.module';
import { GuardiansService } from './guardians.service';
import { GuardiansController } from './guardians.controller';

@Module({
    imports: [CoreModule],
    controllers: [GuardiansController],
    providers: [GuardiansService],
    // We export the service so the StudentsModule can use it
    exports: [GuardiansService],
})
export class GuardiansModule {}
