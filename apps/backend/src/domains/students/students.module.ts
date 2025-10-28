import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { CoreModule } from 'src/core/core.module';

@Module({
    imports: [CoreModule], // Import CoreModule to get access to PrismaService
    controllers: [StudentsController],
    providers: [StudentsService],
})
export class StudentsModule {}
