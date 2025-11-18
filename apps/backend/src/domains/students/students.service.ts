import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma.service';
import { CreateStudentDto, UpdateStudentDto } from './dto';
import { Student } from '@erp/db/client';
import { GuardiansService } from '../guardians/guardians.service';

@Injectable()
export class StudentsService {
    // Inject the PrismaService from CoreModule
    constructor(
        private readonly prisma: PrismaService,
        // Inject the GuardiansService here
        private readonly guardiansService: GuardiansService,
    ) {}

    async create(dto: CreateStudentDto): Promise<Student> {
        // 1. Find or create the guardian
        const guardianRecord = await this.guardiansService.findOrCreate(dto.guardian!);

        // 2. Create the student, linking them to the guardian
        // --- THIS IS THE FIX ---
        // We explicitly build the data object instead of using the spread operator (...dto).
        // This avoids type conflicts between the DTO class and the Prisma type.
        return this.prisma.extendedPrismaClient().student.create({
            data: {
                first_name: dto.first_name,
                last_name: dto.last_name,
                email: dto.email,
                phone: dto.phone,
                school_name: dto.school_name,
                guardianId: guardianRecord.id, // Link to the found/created guardian
            },
        });
        // --- END OF FIX ---
    }

    async findAll(): Promise<Student[]> {
        return this.prisma.extendedPrismaClient().student.findMany({
            orderBy: {
                created_at: 'desc',
            },
            include: {
                guardian: true,
            },
        });
    }

    async findOne(id: string): Promise<Student | null> {
        const student = await this.prisma.extendedPrismaClient().student.findUnique({
            where: { id },
            include: {
                guardian: true,
            },
        });
        if (!student) {
            throw new NotFoundException(`Student with ID "${id}" not found`);
        }
        return student;
    }

    async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
        try {
            // --- PROACTIVE FIX ---
            // We do the same explicit mapping for the update method.
            // Since UpdateStudentDto is a Partial, we check which fields exist.
            const dataToUpdate: Partial<Student> = {};
            if (updateStudentDto.first_name) dataToUpdate.first_name = updateStudentDto.first_name;
            if (updateStudentDto.last_name) dataToUpdate.last_name = updateStudentDto.last_name;
            if (updateStudentDto.email) dataToUpdate.email = updateStudentDto.email;
            if (updateStudentDto.phone) dataToUpdate.phone = updateStudentDto.phone;
            if (updateStudentDto.school_name)
                dataToUpdate.school_name = updateStudentDto.school_name;

            return this.prisma.extendedPrismaClient().student.update({
                where: { id },
                data: dataToUpdate,
            });
            // --- END OF FIX ---
        } catch (_error) {
            // Handle case where the student to update doesn't exist
            throw new NotFoundException(`Student with ID "${id}" not found`);
        }
    }

    async remove(id: string): Promise<Student> {
        try {
            return await this.prisma.extendedPrismaClient().student.delete({
                where: { id },
            });
        } catch (_error) {
            // Handle case where the student to delete doesn't exist
            throw new NotFoundException(`Student with ID "${id}" not found`);
        }
    }
}
