import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from '@/core/core.module';
// We will import our domain/feature modules here as we create them
// import { UsersModule } from './domains/users/users.module';
import { StudentsModule } from '@/domains/students/students.module';
import { GuardiansModule } from '@/domains/guardians/guardians.module';
// import { BatchesModule } from './domains/batches/batches.module';
// import { EnrollmentModule } from './features/enrollment/enrollment.module';
// import { PaymentsModule } from './features/payments/payments.module';
// import { AttendanceModule } from './features/attendance/attendance.module';

@Module({
    imports: [
        // 1. Config Module: Set to global
        // This makes .env variables available everywhere via ConfigService
        ConfigModule.forRoot({
            isGlobal: true,
            // Tell ConfigModule to look up 2 directories
            // for the .env file at the monorepo root.
            envFilePath: '../../.env', // Assumes .env file is in the backend root
        }),

        // 2. Core Module: Provides core services like Prisma
        CoreModule,

        // 3. Domain Modules (uncomment as we build them)
        // UsersModule,
        StudentsModule,
        GuardiansModule,
        // BatchesModule,

        // 4. Feature Modules (uncomment as we build them)
        // EnrollmentModule,
        // PaymentsModule,
        // AttendanceModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
