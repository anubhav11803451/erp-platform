import { Module } from '@nestjs/common';
import { CoreModule } from 'src/core/core.module';
import { GuardiansModule } from 'src/domains/guardians/guardians.module';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';

@Module({
    imports: [CoreModule, GuardiansModule], // Import CoreModule to get access to PrismaService
    controllers: [StudentsController],
    providers: [StudentsService],
})
export class StudentsModule {}
