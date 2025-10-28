import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@erp/db'; // <-- 1. IMPORT FROM OUR SHARED PACKAGE!
import { ConfigService } from '@nestjs/config';

/**
 * Our injectable Prisma service.
 * It extends the auto-generated PrismaClient.
 *
 * We inject ConfigService to ensure the database URL is loaded
 * from our .env file before the client connects.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    // 2. Inject ConfigService to access environment variables
    constructor(private configService: ConfigService) {
        super({
            datasources: {
                db: {
                    // 3. Get the DATABASE_URL from .env
                    url: configService.get<string>('DATABASE_URL'),
                },
            },
        });
    }

    // 4. Automatically connect to the DB when the app starts
    async onModuleInit() {
        await this.$connect();
    }
}
