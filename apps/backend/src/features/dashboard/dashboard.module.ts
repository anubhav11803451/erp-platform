import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { CoreModule } from '@/core/core.module';

@Module({
    imports: [CoreModule],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule {}
