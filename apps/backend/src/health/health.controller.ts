import { Controller, Get } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';
import { HealthResponseDto } from './dto/health-controller.dto';

@Controller()
export class HealthController {
    @Get('health')
    @ZodResponse({
        status: 200,
        type: HealthResponseDto,
    })
    check() {
        return {
            status: 'ok' as const,
            timestamp: new Date().toISOString(),
            uptimeSeconds: Math.floor(process.uptime()),
        };
    }
}
