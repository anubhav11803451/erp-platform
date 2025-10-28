import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { CoreModule } from '@/core/core.module';
import { GuardiansModule } from '../guardians/guardians.module';

@Module({
    imports: [CoreModule, GuardiansModule], // Import CoreModule to get access to PrismaService
    controllers: [StudentsController],
    providers: [StudentsService],
})
export class StudentsModule {}
