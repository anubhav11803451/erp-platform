import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@erp/db/client';
import {
    institutionAttendanceDayResponseSchema,
    institutionGroupListResponseSchema,
    institutionGroupResponseSchema,
    institutionProfileResponseSchema,
    institutionStaffContextResponseSchema,
    institutionStudentListResponseSchema,
    institutionStudentResponseSchema,
} from '@erp/shared';
import type {
    InstitutionAttendanceDayResponse,
    InstitutionAttendanceSaveRequest,
    InstitutionGroupCreateRequest,
    InstitutionGroupListResponse,
    InstitutionGroupResponse,
    InstitutionGroupUpdateRequest,
    InstitutionProfileResponse,
    InstitutionProfileUpdateRequest,
    InstitutionStaffContextResponse,
    InstitutionStudentCreateRequest,
    InstitutionStudentListResponse,
    InstitutionStudentResponse,
    InstitutionStudentUpdateRequest,
} from '@erp/shared';
import { PrismaService } from '../../core/prisma.service';

export type InstitutionActor = {
    accountId: string;
    institutionId: string;
    role: 'ADMIN' | 'STAFF';
};

type OperationalClient = Pick<
    Prisma.TransactionClient,
    | 'institution'
    | 'institutionGroup'
    | 'institutionStaffGroupAssignment'
    | 'institutionStaffMembership'
    | 'institutionStudent'
    | 'institutionStudentGroupMembership'
    | 'institutionAttendanceMark'
>;

@Injectable()
export class InstitutionOperationsService {
    constructor(private readonly prisma: PrismaService) {}

    async getProfile(institutionId: string): Promise<InstitutionProfileResponse> {
        const institution = await this.prisma.institution.findUnique({
            where: { id: institutionId },
            select: { id: true, name: true, timezone: true },
        });
        if (!institution) {
            throw new NotFoundException('Institution not found');
        }
        return institutionProfileResponseSchema.parse(institution);
    }

    async getStaffContext(institutionId: string): Promise<InstitutionStaffContextResponse> {
        const institution = await this.prisma.institution.findUnique({
            where: { id: institutionId },
            select: { name: true, timezone: true },
        });
        if (!institution) {
            throw new NotFoundException('Institution not found');
        }
        return institutionStaffContextResponseSchema.parse({
            institution_name: institution.name,
            timezone: institution.timezone,
        });
    }

    async updateProfile(
        institutionId: string,
        request: InstitutionProfileUpdateRequest,
    ): Promise<InstitutionProfileResponse> {
        this.assertTimeZone(request.timezone);
        const updated = await this.prisma.institution.updateMany({
            where: { id: institutionId },
            data: { name: request.name.trim(), timezone: request.timezone.trim() },
        });
        if (updated.count !== 1) {
            throw new NotFoundException('Institution not found');
        }
        return this.getProfile(institutionId);
    }

    async listGroups(institutionId: string): Promise<InstitutionGroupListResponse> {
        const groups = await this.prisma.institutionGroup.findMany({
            where: { institution_id: institutionId, archived_at: null },
            orderBy: [{ name: 'asc' }, { id: 'asc' }],
        });
        return institutionGroupListResponseSchema.parse({
            groups: groups.map((group) => this.toGroupResponse(group)),
        });
    }

    async listAssignedGroups(actor: InstitutionActor): Promise<InstitutionGroupListResponse> {
        const groupIds = await this.currentStaffGroupIds(this.prisma, actor);
        const groups = await this.prisma.institutionGroup.findMany({
            where: { institution_id: actor.institutionId, id: { in: groupIds }, archived_at: null },
            orderBy: [{ name: 'asc' }, { id: 'asc' }],
        });
        return institutionGroupListResponseSchema.parse({
            groups: groups.map((group) => this.toGroupResponse(group)),
        });
    }

    async createGroup(
        institutionId: string,
        request: InstitutionGroupCreateRequest,
    ): Promise<InstitutionGroupResponse> {
        const group = await this.prisma.institutionGroup.create({
            data: {
                institution_id: institutionId,
                name: request.name.trim(),
                type: request.type,
            },
        });
        return this.toGroupResponse(group);
    }

    async updateGroup(
        institutionId: string,
        groupId: string,
        request: InstitutionGroupUpdateRequest,
    ): Promise<InstitutionGroupResponse> {
        const updated = await this.prisma.institutionGroup.updateMany({
            where: { id: groupId, institution_id: institutionId, archived_at: null },
            data: { name: request.name.trim(), type: request.type },
        });
        if (updated.count !== 1) {
            throw new NotFoundException('Group not found');
        }
        return this.getGroup(institutionId, groupId);
    }

    async archiveGroup(institutionId: string, groupId: string): Promise<void> {
        const archived = await this.prisma.institutionGroup.updateMany({
            where: { id: groupId, institution_id: institutionId, archived_at: null },
            data: { archived_at: new Date() },
        });
        if (archived.count !== 1) {
            throw new NotFoundException('Group not found');
        }
    }

    async listAdminStudents(
        institutionId: string,
        options: { groupId?: string; search?: string } = {},
    ): Promise<InstitutionStudentListResponse> {
        return this.listStudents({ accountId: '', institutionId, role: 'ADMIN' }, options);
    }

    async listStaffStudents(
        actor: InstitutionActor,
        options: { groupId?: string; search?: string } = {},
    ): Promise<InstitutionStudentListResponse> {
        return this.listStudents(actor, options);
    }

    async createStudent(
        institutionId: string,
        request: InstitutionStudentCreateRequest,
    ): Promise<InstitutionStudentResponse> {
        return this.withUniqueLocalIdHandling(async () =>
            this.prisma.$transaction(async (transaction) => {
                await this.assertActiveGroups(transaction, institutionId, request.group_ids);
                await this.assertLocalIdAvailable(
                    transaction,
                    institutionId,
                    request.local_id?.trim() ?? null,
                );
                const student = await transaction.institutionStudent.create({
                    data: {
                        institution_id: institutionId,
                        display_name: request.display_name.trim(),
                        local_id: request.local_id?.trim() ?? null,
                    },
                });
                if (request.group_ids.length > 0) {
                    await transaction.institutionStudentGroupMembership.createMany({
                        data: request.group_ids.map((group_id) => ({
                            institution_id: institutionId,
                            student_id: student.id,
                            group_id,
                        })),
                    });
                }
                return this.getStudentResponse(transaction, institutionId, student.id);
            }),
        );
    }

    async updateStudent(
        actor: InstitutionActor,
        studentId: string,
        request: InstitutionStudentUpdateRequest,
    ): Promise<InstitutionStudentResponse> {
        return this.withUniqueLocalIdHandling(async () =>
            this.prisma.$transaction(async (transaction) => {
                const groupIds =
                    actor.role === 'STAFF'
                        ? await this.lockAndGetCurrentStaffGroupIds(transaction, actor)
                        : [];
                const where = this.studentScopeWhere(actor, studentId, groupIds);
                const student = await transaction.institutionStudent.findFirst({
                    where,
                    select: { id: true },
                });
                if (!student) {
                    throw new NotFoundException('Student not found');
                }
                if (request.local_id !== undefined && actor.role === 'ADMIN') {
                    await this.assertLocalIdAvailable(
                        transaction,
                        actor.institutionId,
                        request.local_id?.trim() ?? null,
                        studentId,
                    );
                }
                const data: Prisma.InstitutionStudentUpdateManyMutationInput = {};
                if (request.display_name !== undefined) {
                    data.display_name = request.display_name.trim();
                }
                if (request.local_id !== undefined) {
                    data.local_id = request.local_id?.trim() ?? null;
                }
                const updated = await transaction.institutionStudent.updateMany({
                    where,
                    data,
                });
                if (updated.count !== 1) {
                    throw new NotFoundException('Student not found');
                }
                return this.getStudentResponse(
                    transaction,
                    actor.institutionId,
                    studentId,
                    actor.role === 'STAFF' ? groupIds : undefined,
                );
            }),
        );
    }

    async archiveStudent(institutionId: string, studentId: string): Promise<void> {
        await this.prisma.$transaction(async (transaction) => {
            const now = new Date();
            const archived = await transaction.institutionStudent.updateMany({
                where: {
                    id: studentId,
                    institution_id: institutionId,
                    archived_at: null,
                },
                data: { archived_at: now },
            });
            if (archived.count !== 1) {
                throw new NotFoundException('Student not found');
            }
            await transaction.institutionStudentGroupMembership.updateMany({
                where: {
                    institution_id: institutionId,
                    student_id: studentId,
                    archived_at: null,
                },
                data: { archived_at: now },
            });
        });
    }

    async updateStudentGroups(
        institutionId: string,
        studentId: string,
        groupIds: string[],
    ): Promise<InstitutionStudentResponse> {
        return this.prisma.$transaction(async (transaction) => {
            await this.assertStudentExists(transaction, institutionId, studentId);
            await this.assertActiveGroups(transaction, institutionId, groupIds);
            const now = new Date();
            await transaction.institutionStudentGroupMembership.updateMany({
                where: {
                    institution_id: institutionId,
                    student_id: studentId,
                    archived_at: null,
                    ...(groupIds.length > 0 ? { group_id: { notIn: groupIds } } : {}),
                },
                data: { archived_at: now },
            });
            for (const groupId of groupIds) {
                await transaction.institutionStudentGroupMembership.upsert({
                    where: {
                        institution_id_student_id_group_id: {
                            institution_id: institutionId,
                            student_id: studentId,
                            group_id: groupId,
                        },
                    },
                    create: {
                        institution_id: institutionId,
                        student_id: studentId,
                        group_id: groupId,
                    },
                    update: { archived_at: null },
                });
            }
            return this.getStudentResponse(transaction, institutionId, studentId);
        });
    }

    async getAttendanceDay(
        actor: InstitutionActor,
        groupId: string,
        attendanceDate: string,
    ): Promise<InstitutionAttendanceDayResponse> {
        const timezone = await this.requireAttendanceTimeZone(this.prisma, actor.institutionId);
        this.assertTimeZone(timezone);
        const groupIds =
            actor.role === 'STAFF' ? await this.currentStaffGroupIds(this.prisma, actor) : [];
        await this.assertGroupAccess(this.prisma, actor, groupId, groupIds);
        const date = this.toAttendanceDate(attendanceDate);
        const memberships = await this.prisma.institutionStudentGroupMembership.findMany({
            where: {
                institution_id: actor.institutionId,
                group_id: groupId,
                archived_at: null,
                student: { institution_id: actor.institutionId, archived_at: null },
                group: { institution_id: actor.institutionId, archived_at: null },
            },
            orderBy: [{ student: { display_name: 'asc' } }, { student_id: 'asc' }],
            include: {
                student: { select: { id: true, display_name: true, local_id: true } },
                attendance: {
                    where: {
                        institution_id: actor.institutionId,
                        group_id: groupId,
                        attendance_date: date,
                    },
                    select: {
                        status: true,
                        updated_by_account_id: true,
                        updated_at: true,
                    },
                },
            },
        });
        return institutionAttendanceDayResponseSchema.parse({
            group_id: groupId,
            attendance_date: attendanceDate,
            entries: memberships.map(({ student, attendance }) => ({
                student_id: student.id,
                display_name: student.display_name,
                local_id: student.local_id,
                status: attendance[0]?.status ?? null,
                updated_by_account_id: attendance[0]?.updated_by_account_id ?? null,
                updated_at: attendance[0]?.updated_at.toISOString() ?? null,
            })),
        });
    }

    async saveAttendance(
        actor: InstitutionActor,
        request: InstitutionAttendanceSaveRequest,
    ): Promise<InstitutionAttendanceDayResponse> {
        const timezone = await this.requireAttendanceTimeZone(this.prisma, actor.institutionId);
        this.assertTimeZone(timezone);
        const date = this.toAttendanceDate(request.attendance_date);
        await this.prisma.$transaction(async (transaction) => {
            const groupIds =
                actor.role === 'STAFF'
                    ? await this.lockAndGetCurrentStaffGroupIds(transaction, actor)
                    : [];
            await this.assertGroupAccess(transaction, actor, request.group_id, groupIds);
            const requestedStudentIds = request.marks.map(({ student_id }) => student_id);
            if (requestedStudentIds.length > 0) {
                const memberships = await transaction.institutionStudentGroupMembership.findMany({
                    where: {
                        institution_id: actor.institutionId,
                        group_id: request.group_id,
                        student_id: { in: requestedStudentIds },
                        archived_at: null,
                        student: { institution_id: actor.institutionId, archived_at: null },
                        group: { institution_id: actor.institutionId, archived_at: null },
                    },
                    select: { student_id: true },
                });
                if (memberships.length !== requestedStudentIds.length) {
                    throw new NotFoundException('One or more active group members were not found');
                }
            }
            for (const mark of request.marks) {
                const key = {
                    institution_id: actor.institutionId,
                    group_id: request.group_id,
                    student_id: mark.student_id,
                    attendance_date: date,
                };
                if (mark.status === null) {
                    await transaction.institutionAttendanceMark.deleteMany({ where: key });
                } else {
                    await transaction.institutionAttendanceMark.upsert({
                        where: {
                            institution_id_group_id_student_id_attendance_date: key,
                        },
                        create: {
                            ...key,
                            status: mark.status,
                            updated_by_account_id: actor.accountId,
                        },
                        update: {
                            status: mark.status,
                            updated_by_account_id: actor.accountId,
                        },
                    });
                }
            }
        });
        return this.getAttendanceDay(actor, request.group_id, request.attendance_date);
    }

    private async listStudents(
        actor: InstitutionActor,
        options: { groupId?: string; search?: string },
    ): Promise<InstitutionStudentListResponse> {
        const search = options.search?.trim();
        if (search && search.length > 100) {
            throw new BadRequestException('Search text is too long');
        }
        const groupIds =
            actor.role === 'STAFF' ? await this.currentStaffGroupIds(this.prisma, actor) : [];
        if (options.groupId) {
            await this.assertGroupAccess(this.prisma, actor, options.groupId, groupIds);
        }
        const where: Prisma.InstitutionStudentWhereInput = {
            institution_id: actor.institutionId,
            archived_at: null,
        };
        if (actor.role === 'STAFF' || options.groupId) {
            const allowedGroupIds = options.groupId ? [options.groupId] : groupIds;
            where.group_memberships = {
                some: {
                    institution_id: actor.institutionId,
                    archived_at: null,
                    group_id: { in: allowedGroupIds },
                    group: { institution_id: actor.institutionId, archived_at: null },
                },
            };
        }
        if (search) {
            where.OR = [
                { display_name: { contains: search, mode: 'insensitive' } },
                { local_id: { contains: search, mode: 'insensitive' } },
            ];
        }
        const students = await this.prisma.institutionStudent.findMany({
            where,
            orderBy: [{ display_name: 'asc' }, { id: 'asc' }],
            include: {
                group_memberships: {
                    where: {
                        institution_id: actor.institutionId,
                        archived_at: null,
                        group: { institution_id: actor.institutionId, archived_at: null },
                        ...(actor.role === 'STAFF' ? { group_id: { in: groupIds } } : {}),
                        ...(options.groupId ? { group_id: options.groupId } : {}),
                    },
                    select: { group_id: true },
                },
            },
        });
        return institutionStudentListResponseSchema.parse({
            students: students.map((student) => this.toStudentResponse(student)),
        });
    }

    private async getGroup(
        institutionId: string,
        groupId: string,
    ): Promise<InstitutionGroupResponse> {
        const group = await this.prisma.institutionGroup.findFirst({
            where: { id: groupId, institution_id: institutionId, archived_at: null },
        });
        if (!group) {
            throw new NotFoundException('Group not found');
        }
        return this.toGroupResponse(group);
    }

    private async getStudentResponse(
        client: OperationalClient,
        institutionId: string,
        studentId: string,
        visibleGroupIds?: string[],
    ): Promise<InstitutionStudentResponse> {
        const student = await client.institutionStudent.findFirst({
            where: {
                id: studentId,
                institution_id: institutionId,
                archived_at: null,
            },
            include: {
                group_memberships: {
                    where: {
                        institution_id: institutionId,
                        archived_at: null,
                        group: { institution_id: institutionId, archived_at: null },
                        ...(visibleGroupIds ? { group_id: { in: visibleGroupIds } } : {}),
                    },
                    select: { group_id: true },
                },
            },
        });
        if (!student) {
            throw new NotFoundException('Student not found');
        }
        return this.toStudentResponse(student);
    }

    private async assertStudentExists(
        client: OperationalClient,
        institutionId: string,
        studentId: string,
    ): Promise<void> {
        const student = await client.institutionStudent.findFirst({
            where: { id: studentId, institution_id: institutionId, archived_at: null },
            select: { id: true },
        });
        if (!student) {
            throw new NotFoundException('Student not found');
        }
    }

    private async assertActiveGroups(
        client: OperationalClient,
        institutionId: string,
        groupIds: string[],
    ): Promise<void> {
        if (groupIds.length === 0) {
            return;
        }
        const groups = await client.institutionGroup.findMany({
            where: {
                institution_id: institutionId,
                archived_at: null,
                id: { in: groupIds },
            },
            select: { id: true },
        });
        if (groups.length !== groupIds.length) {
            throw new NotFoundException('One or more active groups were not found');
        }
    }

    private async currentStaffGroupIds(
        client: OperationalClient,
        actor: InstitutionActor,
    ): Promise<string[]> {
        if (actor.role !== 'STAFF') {
            return [];
        }
        const membership = await client.institutionStaffGroupAssignment.findMany({
            where: {
                institution_id: actor.institutionId,
                staff_account_id: actor.accountId,
                revoked_at: null,
                staff_membership: {
                    revoked_at: null,
                    account: { identity_kind: 'INSTITUTION_STAFF' },
                },
                group: { institution_id: actor.institutionId, archived_at: null },
            },
            select: { group_id: true },
        });
        return membership.map(({ group_id }) => group_id);
    }

    private async lockAndGetCurrentStaffGroupIds(
        transaction: Prisma.TransactionClient,
        actor: InstitutionActor,
    ): Promise<string[]> {
        await this.lockInstitution(transaction, actor.institutionId);
        const membership = await transaction.institutionStaffMembership.findFirst({
            where: {
                account_id: actor.accountId,
                institution_id: actor.institutionId,
                revoked_at: null,
                account: { identity_kind: 'INSTITUTION_STAFF' },
            },
            select: { account_id: true },
        });
        if (!membership) {
            throw new NotFoundException('Group not found');
        }
        return this.currentStaffGroupIds(transaction, actor);
    }

    private async lockInstitution(
        transaction: Prisma.TransactionClient,
        institutionId: string,
    ): Promise<void> {
        const rows = await transaction.$queryRaw<Array<{ id: string }>>`
            SELECT "id" FROM "Institution" WHERE "id" = ${institutionId} FOR UPDATE
        `;
        if (rows.length !== 1) {
            throw new NotFoundException('Institution not found');
        }
    }

    private async assertGroupAccess(
        client: OperationalClient,
        actor: InstitutionActor,
        groupId: string,
        groupIds?: string[],
    ): Promise<void> {
        if (actor.role === 'STAFF' && !groupIds?.includes(groupId)) {
            throw new NotFoundException('Group not found');
        }
        const group = await client.institutionGroup.findFirst({
            where: {
                id: groupId,
                institution_id: actor.institutionId,
                archived_at: null,
                ...(actor.role === 'STAFF'
                    ? {
                          staff_assignments: {
                              some: {
                                  institution_id: actor.institutionId,
                                  staff_account_id: actor.accountId,
                                  revoked_at: null,
                                  staff_membership: {
                                      revoked_at: null,
                                      account: { identity_kind: 'INSTITUTION_STAFF' },
                                  },
                              },
                          },
                      }
                    : {}),
            },
            select: { id: true },
        });
        if (!group) {
            throw new NotFoundException('Group not found');
        }
    }

    private studentScopeWhere(
        actor: InstitutionActor,
        studentId: string,
        groupIds: string[],
    ): Prisma.InstitutionStudentWhereInput {
        return {
            id: studentId,
            institution_id: actor.institutionId,
            archived_at: null,
            ...(actor.role === 'STAFF'
                ? {
                      group_memberships: {
                          some: {
                              institution_id: actor.institutionId,
                              archived_at: null,
                              group_id: { in: groupIds },
                              group: { institution_id: actor.institutionId, archived_at: null },
                          },
                      },
                  }
                : {}),
        };
    }

    private async assertLocalIdAvailable(
        client: OperationalClient,
        institutionId: string,
        localId: string | null,
        excludingStudentId?: string,
    ): Promise<void> {
        if (!localId) {
            return;
        }
        const duplicate = await client.institutionStudent.findFirst({
            where: {
                institution_id: institutionId,
                local_id: { equals: localId, mode: 'insensitive' },
                ...(excludingStudentId ? { id: { not: excludingStudentId } } : {}),
            },
            select: { id: true },
        });
        if (duplicate) {
            throw new ConflictException('Local ID is already in use');
        }
    }

    private async requireAttendanceTimeZone(
        client: OperationalClient,
        institutionId: string,
    ): Promise<string> {
        const institution = await client.institution.findUnique({
            where: { id: institutionId },
            select: { timezone: true },
        });
        if (!institution?.timezone) {
            throw new ConflictException('Institution timezone must be configured for attendance');
        }
        return institution.timezone;
    }

    private assertTimeZone(timezone: string): void {
        try {
            new Intl.DateTimeFormat('en-US', { timeZone: timezone });
        } catch {
            throw new BadRequestException('A valid IANA timezone is required');
        }
    }

    private toAttendanceDate(date: string): Date {
        const parsed = new Date(`${date}T00:00:00.000Z`);
        if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
            throw new BadRequestException('Attendance date must be a valid ISO date');
        }
        return parsed;
    }

    private toGroupResponse(group: {
        id: string;
        institution_id: string;
        name: string;
        type: 'SCHOOL_SECTION' | 'COACHING_BATCH';
        created_at: Date;
        updated_at: Date;
        archived_at: Date | null;
    }): InstitutionGroupResponse {
        return institutionGroupResponseSchema.parse({
            id: group.id,
            name: group.name,
            type: group.type,
            created_at: group.created_at.toISOString(),
            updated_at: group.updated_at.toISOString(),
            archived_at: group.archived_at?.toISOString() ?? null,
        });
    }

    private toStudentResponse(student: {
        id: string;
        display_name: string;
        local_id: string | null;
        created_at: Date;
        updated_at: Date;
        archived_at: Date | null;
        group_memberships: { group_id: string }[];
    }): InstitutionStudentResponse {
        return institutionStudentResponseSchema.parse({
            id: student.id,
            display_name: student.display_name,
            local_id: student.local_id,
            group_ids: student.group_memberships.map(({ group_id }) => group_id),
            created_at: student.created_at.toISOString(),
            updated_at: student.updated_at.toISOString(),
            archived_at: student.archived_at?.toISOString() ?? null,
        });
    }

    private async withUniqueLocalIdHandling<T>(operation: () => Promise<T>): Promise<T> {
        try {
            return await operation();
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException('Local ID is already in use');
            }
            throw error;
        }
    }
}
