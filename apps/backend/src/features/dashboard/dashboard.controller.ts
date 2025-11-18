import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

import { UserRole } from '@erp/db/enums';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('features/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('stats')
    @Roles(UserRole.ADMIN, UserRole.STAFF) // Both roles can see stats
    getDashboardStats() {
        return this.dashboardService.getDashboardStats();
    }

    @Get('activity')
    @Roles(UserRole.ADMIN, UserRole.STAFF) // Both roles can see activity
    getRecentActivity() {
        return this.dashboardService.getRecentActivity();
    }
}
