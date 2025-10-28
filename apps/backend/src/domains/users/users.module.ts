import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CoreModule } from 'src/core/core.module';

@Module({
    imports: [CoreModule],
    controllers: [UsersController],
    providers: [UsersService],
    // Export UsersService so AuthModule can use it
    exports: [UsersService],
})
export class UsersModule {}
