import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * @Global()
 * This makes the PrismaService available for injection in any other module
 * without needing to import CoreModule everywhere.
 */
@Global()
@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class CoreModule {}
