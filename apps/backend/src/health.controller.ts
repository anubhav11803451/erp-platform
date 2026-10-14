import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
    @Get('health')
    check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptimeSeconds: Math.floor(process.uptime()),
        };
    }
}
