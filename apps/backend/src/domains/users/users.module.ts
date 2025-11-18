import { Module } from '@nestjs/common';
import { CoreModule } from '@/core/core.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
    imports: [CoreModule],
    controllers: [UsersController],
    providers: [UsersService],
    // Export UsersService so AuthModule can use it
    exports: [UsersService],
})
export class UsersModule {}
