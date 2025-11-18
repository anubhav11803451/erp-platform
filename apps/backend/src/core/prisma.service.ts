import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@erp/db/client';
import { withAccelerate } from '@prisma/extension-accelerate';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    // 2. Inject ConfigService to access environment variables
    constructor(private configService: ConfigService) {
        super({
            datasourceUrl: configService.get<string>('DATABASE_URL'),
        });
    }
    async onModuleInit() {
        // Note: this is optional
        await this.$connect();
    }

    extendedPrismaClient() {
        return this.$extends(withAccelerate());
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
