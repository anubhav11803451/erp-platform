import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma.service';
import { CreateStudentDto, UpdateStudentDto } from './dto';
import { Student } from '@erp/db'; // <-- Importing our shared type!

@Injectable()
export class StudentsService {
    // Inject the PrismaService from CoreModule
    constructor(private prisma: PrismaService) {}

    async create(createStudentDto: CreateStudentDto): Promise<Student> {
        // DTO ensures data is validated before it gets here
        return this.prisma.student.create({
            data: createStudentDto,
        });
    }

    async findAll(): Promise<Student[]> {
        return this.prisma.student.findMany({
            orderBy: {
                created_at: 'desc',
            },
        });
    }

    async findOne(id: string): Promise<Student | null> {
        const student = await this.prisma.student.findUnique({
            where: { id },
        });
        if (!student) {
            throw new NotFoundException(`Student with ID "${id}" not found`);
        }
        return student;
    }

    async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
        try {
            return await this.prisma.student.update({
                where: { id },
                data: updateStudentDto,
            });
        } catch (error) {
            // Handle case where the student to update doesn't exist
            throw new NotFoundException(`Student with ID "${id}" not found`);
        }
    }

    async remove(id: string): Promise<Student> {
        try {
            return await this.prisma.student.delete({
                where: { id },
            });
        } catch (error) {
            // Handle case where the student to delete doesn't exist
            throw new NotFoundException(`Student with ID "${id}" not found`);
        }
    }
}
