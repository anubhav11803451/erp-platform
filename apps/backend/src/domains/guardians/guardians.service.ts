import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/prisma.service';
import { CreateGuardianDto, UpdateGuardianDto } from './dto';
import { Guardian } from '@erp/db';

@Injectable()
export class GuardiansService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Finds a guardian by their unique email.
     * If not found, creates a new guardian.
     */
    async findOrCreate(dto: CreateGuardianDto): Promise<Guardian> {
        const existingGuardian = await this.prisma.guardian.findUnique({
            where: { email: dto.email },
        });

        if (existingGuardian) {
            return existingGuardian;
        }

        // Not found, so create a new one
        return this.prisma.guardian.create({
            data: { ...dto },
        });
    }

    create(dto: CreateGuardianDto): Promise<Guardian> {
        return this.prisma.guardian.create({
            data: { ...dto },
        });
    }

    findAll(): Promise<Guardian[]> {
        return this.prisma.guardian.findMany();
    }

    findOne(id: string): Promise<Guardian | null> {
        return this.prisma.guardian.findUnique({
            where: { id },
        });
    }

    update(id: string, dto: UpdateGuardianDto): Promise<Guardian> {
        return this.prisma.guardian.update({
            where: { id },
            data: { ...dto },
        });
    }

    remove(id: string): Promise<Guardian> {
        // Note: This will fail if the guardian is still linked to students.
        // This is good! It's a data integrity safety check.
        return this.prisma.guardian.delete({
            where: { id },
        });
    }
}
