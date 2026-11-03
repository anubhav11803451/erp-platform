import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma.service';
import { InstitutionActor, InstitutionOperationsService } from './institution-operations.service';

const institutionId = '00000000-0000-4000-8000-000000000001';
const assignedGroupId = '00000000-0000-4000-8000-000000000002';
const otherGroupId = '00000000-0000-4000-8000-000000000003';
const studentId = '00000000-0000-4000-8000-000000000004';
const staffActor: InstitutionActor = {
    accountId: '00000000-0000-4000-8000-000000000005',
    institutionId,
    role: 'STAFF',
};

describe('InstitutionOperationsService scoping', () => {
    let service: InstitutionOperationsService;
    let prisma: Record<string, any>;
    let transaction: Record<string, any>;

    beforeEach(() => {
        transaction = {
            $queryRaw: jest.fn().mockResolvedValue([{ id: institutionId }]),
            institution: { findUnique: jest.fn().mockResolvedValue({ timezone: 'Asia/Kolkata' }) },
            institutionGroup: {
                findFirst: jest.fn().mockResolvedValue({ id: assignedGroupId }),
                findMany: jest.fn().mockResolvedValue([{ id: assignedGroupId }]),
                updateMany: jest.fn().mockResolvedValue({ count: 1 }),
                create: jest.fn(),
            },
            institutionStaffGroupAssignment: {
                findMany: jest.fn().mockResolvedValue([{ group_id: assignedGroupId }]),
            },
            institutionStaffMembership: {
                findFirst: jest.fn().mockResolvedValue({ account_id: staffActor.accountId }),
            },
            institutionStudent: {
                findFirst: jest.fn(),
                findMany: jest.fn().mockResolvedValue([]),
                create: jest.fn(),
                updateMany: jest.fn(),
            },
            institutionStudentGroupMembership: {
                findMany: jest.fn().mockResolvedValue([]),
                updateMany: jest.fn(),
                upsert: jest.fn(),
                createMany: jest.fn(),
            },
            institutionAttendanceMark: {
                deleteMany: jest.fn(),
                upsert: jest.fn(),
            },
        };
        prisma = {
            ...transaction,
            institution: {
                findUnique: jest.fn().mockResolvedValue({ timezone: 'Asia/Kolkata' }),
                updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            institutionGroup: {
                ...transaction.institutionGroup,
                findMany: jest.fn().mockResolvedValue([]),
            },
            institutionStaffGroupAssignment: {
                findMany: jest.fn().mockResolvedValue([{ group_id: assignedGroupId }]),
            },
            institutionStudent: {
                ...transaction.institutionStudent,
                findMany: jest.fn().mockResolvedValue([]),
            },
            institutionStudentGroupMembership: {
                ...transaction.institutionStudentGroupMembership,
                findMany: jest.fn().mockResolvedValue([]),
            },
            institutionAttendanceMark: { ...transaction.institutionAttendanceMark },
            $transaction: jest.fn((callback: (tx: typeof transaction) => unknown) =>
                callback(transaction),
            ),
        };
        service = new InstitutionOperationsService(prisma as unknown as PrismaService);
    });

    it('returns fresh Staff context scoped to the guard-derived Institution', async () => {
        prisma.institution.findUnique.mockResolvedValue({
            name: 'Current Institution',
            timezone: null,
        });

        await expect(service.getStaffContext(staffActor.institutionId)).resolves.toEqual({
            institution_name: 'Current Institution',
            timezone: null,
        });
        expect(prisma.institution.findUnique).toHaveBeenCalledWith({
            where: { id: institutionId },
            select: { name: true, timezone: true },
        });
    });

    it('omits the internal Institution ID from group list and create responses', async () => {
        const group = {
            id: assignedGroupId,
            institution_id: institutionId,
            name: 'Grade 1',
            type: 'SCHOOL_SECTION' as const,
            created_at: new Date('2026-11-02T00:00:00.000Z'),
            updated_at: new Date('2026-11-02T00:00:00.000Z'),
            archived_at: null,
        };
        const expected = {
            id: assignedGroupId,
            name: 'Grade 1',
            type: 'SCHOOL_SECTION',
            created_at: '2026-11-02T00:00:00.000Z',
            updated_at: '2026-11-02T00:00:00.000Z',
            archived_at: null,
        };
        prisma.institutionGroup.findMany.mockResolvedValue([group]);
        prisma.institutionGroup.create.mockResolvedValue(group);

        await expect(service.listGroups(institutionId)).resolves.toEqual({ groups: [expected] });
        await expect(
            service.createGroup(institutionId, { name: 'Grade 1', type: 'SCHOOL_SECTION' }),
        ).resolves.toEqual(expected);
    });

    it('scopes Staff direct student updates to the current Institution and assigned groups', async () => {
        transaction.institutionStudent.findFirst.mockResolvedValue(null);

        await expect(
            service.updateStudent(staffActor, studentId, { display_name: 'Updated name' }),
        ).rejects.toThrow(NotFoundException);

        expect(transaction.institutionStudent.findFirst).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    id: studentId,
                    institution_id: institutionId,
                    group_memberships: {
                        some: expect.objectContaining({
                            institution_id: institutionId,
                            group_id: { in: [assignedGroupId] },
                            archived_at: null,
                        }),
                    },
                }),
            }),
        );
        expect(transaction.institutionStudent.updateMany).not.toHaveBeenCalled();
    });

    it('locks and refreshes Staff membership and assignments before updating a student', async () => {
        const callOrder: string[] = [];
        const student = {
            id: studentId,
            display_name: 'Updated name',
            local_id: null,
            created_at: new Date('2026-11-02T00:00:00.000Z'),
            updated_at: new Date('2026-11-02T00:00:00.000Z'),
            archived_at: null,
            group_memberships: [{ group_id: assignedGroupId }],
        };
        transaction.$queryRaw.mockImplementation(async () => {
            callOrder.push('lock');
            return [{ id: institutionId }];
        });
        transaction.institutionStaffMembership.findFirst.mockImplementation(async () => {
            callOrder.push('membership');
            return { account_id: staffActor.accountId };
        });
        transaction.institutionStaffGroupAssignment.findMany.mockImplementation(async () => {
            callOrder.push('assignments');
            return [{ group_id: assignedGroupId }];
        });
        transaction.institutionStudent.findFirst.mockImplementation(async () => {
            callOrder.push('student-scope');
            return student;
        });
        transaction.institutionStudent.updateMany.mockImplementation(async () => {
            callOrder.push('student-write');
            return { count: 1 };
        });

        await service.updateStudent(staffActor, studentId, { display_name: 'Updated name' });

        expect(callOrder.slice(0, 5)).toEqual([
            'lock',
            'membership',
            'assignments',
            'student-scope',
            'student-write',
        ]);
        expect(transaction.institutionStaffMembership.findFirst).toHaveBeenCalledWith({
            where: {
                account_id: staffActor.accountId,
                institution_id: institutionId,
                revoked_at: null,
                account: { identity_kind: 'INSTITUTION_STAFF' },
            },
            select: { account_id: true },
        });
        expect(transaction.institutionStaffGroupAssignment.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    institution_id: institutionId,
                    staff_account_id: staffActor.accountId,
                    revoked_at: null,
                }),
            }),
        );
    });

    it('rejects a revoked Staff membership after locking before student authorization', async () => {
        transaction.institutionStaffMembership.findFirst.mockResolvedValue(null);

        await expect(
            service.updateStudent(staffActor, studentId, { display_name: 'Updated name' }),
        ).rejects.toThrow(NotFoundException);

        expect(transaction.$queryRaw).toHaveBeenCalledTimes(1);
        expect(transaction.institutionStaffGroupAssignment.findMany).not.toHaveBeenCalled();
        expect(transaction.institutionStudent.findFirst).not.toHaveBeenCalled();
        expect(transaction.institutionStudent.updateMany).not.toHaveBeenCalled();
    });

    it('does not update a direct student ID outside the Admin Institution scope', async () => {
        transaction.institutionStudent.findFirst.mockResolvedValue(null);

        await expect(
            service.updateStudent(
                { accountId: 'admin-id', institutionId, role: 'ADMIN' },
                studentId,
                { display_name: 'Tampered' },
            ),
        ).rejects.toThrow(NotFoundException);

        expect(transaction.institutionStudent.findFirst).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    id: studentId,
                    institution_id: institutionId,
                    archived_at: null,
                },
                select: { id: true },
            }),
        );
        expect(transaction.institutionStudent.updateMany).not.toHaveBeenCalled();
        expect(transaction.$queryRaw).not.toHaveBeenCalled();
    });

    it('filters Staff roster search and nested group projections to current assignments', async () => {
        prisma.institutionStudent.findMany.mockResolvedValue([
            {
                id: studentId,
                display_name: 'Student One',
                local_id: 'S-1',
                created_at: new Date('2026-11-02T00:00:00.000Z'),
                updated_at: new Date('2026-11-02T00:00:00.000Z'),
                archived_at: null,
                group_memberships: [{ group_id: assignedGroupId }],
            },
        ]);

        const result = await service.listStaffStudents(staffActor, {
            groupId: assignedGroupId,
            search: 'student',
        });

        expect(result.students[0].group_ids).toEqual([assignedGroupId]);
        expect(prisma.institutionStudent.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    institution_id: institutionId,
                    archived_at: null,
                    group_memberships: {
                        some: expect.objectContaining({
                            institution_id: institutionId,
                            group_id: { in: [assignedGroupId] },
                            archived_at: null,
                        }),
                    },
                    OR: [
                        { display_name: { contains: 'student', mode: 'insensitive' } },
                        { local_id: { contains: 'student', mode: 'insensitive' } },
                    ],
                }),
                include: {
                    group_memberships: expect.objectContaining({
                        where: expect.objectContaining({
                            institution_id: institutionId,
                            group_id: assignedGroupId,
                            group: { institution_id: institutionId, archived_at: null },
                        }),
                        select: { group_id: true },
                    }),
                },
            }),
        );
    });

    it('rejects cross-Institution/unassigned bulk attendance marks before any mark write', async () => {
        transaction.institutionStudentGroupMembership.findMany.mockResolvedValue([]);

        await expect(
            service.saveAttendance(staffActor, {
                group_id: assignedGroupId,
                attendance_date: '2026-11-02',
                marks: [{ student_id: studentId, status: 'PRESENT' }],
            }),
        ).rejects.toThrow(NotFoundException);

        expect(transaction.institutionStudentGroupMembership.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    institution_id: institutionId,
                    group_id: assignedGroupId,
                    student_id: { in: [studentId] },
                    archived_at: null,
                    student: { institution_id: institutionId, archived_at: null },
                    group: { institution_id: institutionId, archived_at: null },
                }),
            }),
        );
        expect(transaction.institutionAttendanceMark.upsert).not.toHaveBeenCalled();
        expect(transaction.institutionAttendanceMark.deleteMany).not.toHaveBeenCalled();
    });

    it('keeps local IDs Institution-wide and reserved by archived students', async () => {
        transaction.institutionStudent.findFirst.mockResolvedValue({ id: 'archived-student-id' });

        await expect(
            service.createStudent(institutionId, {
                display_name: 'New student',
                local_id: ' existing-id ',
                group_ids: [],
            }),
        ).rejects.toThrow(ConflictException);

        expect(transaction.institutionStudent.findFirst).toHaveBeenCalledWith({
            where: {
                institution_id: institutionId,
                local_id: { equals: 'existing-id', mode: 'insensitive' },
            },
            select: { id: true },
        });
        expect(transaction.institutionStudent.create).not.toHaveBeenCalled();
    });

    it('rejects a cross-Institution group membership before changing roster relations', async () => {
        transaction.institutionStudent.findFirst.mockResolvedValue({ id: studentId });
        transaction.institutionGroup.findMany.mockResolvedValue([{ id: assignedGroupId }]);

        await expect(
            service.updateStudentGroups(institutionId, studentId, [assignedGroupId, otherGroupId]),
        ).rejects.toThrow(NotFoundException);

        expect(transaction.institutionGroup.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    institution_id: institutionId,
                    archived_at: null,
                    id: { in: [assignedGroupId, otherGroupId] },
                },
            }),
        );
        expect(transaction.institutionStudentGroupMembership.upsert).not.toHaveBeenCalled();
    });

    it('records the latest attendance editor and clears a mark back to Unmarked', async () => {
        transaction.institutionStudentGroupMembership.findMany.mockResolvedValue([
            { student_id: studentId },
        ]);

        await service.saveAttendance(staffActor, {
            group_id: assignedGroupId,
            attendance_date: '2026-11-02',
            marks: [{ student_id: studentId, status: 'PRESENT' }],
        });
        await service.saveAttendance(staffActor, {
            group_id: assignedGroupId,
            attendance_date: '2026-11-02',
            marks: [{ student_id: studentId, status: null }],
        });

        expect(transaction.institutionAttendanceMark.upsert).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    institution_id_group_id_student_id_attendance_date: {
                        institution_id: institutionId,
                        group_id: assignedGroupId,
                        student_id: studentId,
                        attendance_date: new Date('2026-11-02T00:00:00.000Z'),
                    },
                },
                create: expect.objectContaining({
                    status: 'PRESENT',
                    updated_by_account_id: staffActor.accountId,
                }),
                update: expect.objectContaining({
                    status: 'PRESENT',
                    updated_by_account_id: staffActor.accountId,
                }),
            }),
        );
        expect(transaction.institutionAttendanceMark.deleteMany).toHaveBeenCalledWith({
            where: {
                institution_id: institutionId,
                group_id: assignedGroupId,
                student_id: studentId,
                attendance_date: new Date('2026-11-02T00:00:00.000Z'),
            },
        });
    });

    it('locks and refreshes Staff membership and assignments before saving attendance', async () => {
        const callOrder: string[] = [];
        transaction.$queryRaw.mockImplementation(async () => {
            callOrder.push('lock');
            return [{ id: institutionId }];
        });
        transaction.institutionStaffMembership.findFirst.mockImplementation(async () => {
            callOrder.push('membership');
            return { account_id: staffActor.accountId };
        });
        transaction.institutionStaffGroupAssignment.findMany.mockImplementation(async () => {
            callOrder.push('assignments');
            return [{ group_id: assignedGroupId }];
        });
        transaction.institutionGroup.findFirst.mockImplementation(async () => {
            callOrder.push('group-validation');
            return { id: assignedGroupId };
        });
        transaction.institutionStudentGroupMembership.findMany.mockImplementation(async () => {
            callOrder.push('active-student-membership');
            return [{ student_id: studentId }];
        });
        transaction.institutionAttendanceMark.upsert.mockImplementation(async () => {
            callOrder.push('attendance-write');
            return {};
        });

        await service.saveAttendance(staffActor, {
            group_id: assignedGroupId,
            attendance_date: '2026-11-02',
            marks: [{ student_id: studentId, status: 'PRESENT' }],
        });

        expect(callOrder.slice(0, 6)).toEqual([
            'lock',
            'membership',
            'assignments',
            'group-validation',
            'active-student-membership',
            'attendance-write',
        ]);
    });

    it('archives roster and memberships without deleting attendance history', async () => {
        transaction.institutionStudent.updateMany.mockResolvedValue({ count: 1 });

        await service.archiveStudent(institutionId, studentId);

        expect(transaction.institutionStudent.updateMany).toHaveBeenCalledWith({
            where: { id: studentId, institution_id: institutionId, archived_at: null },
            data: { archived_at: expect.any(Date) },
        });
        expect(transaction.institutionStudentGroupMembership.updateMany).toHaveBeenCalledWith({
            where: {
                institution_id: institutionId,
                student_id: studentId,
                archived_at: null,
            },
            data: { archived_at: expect.any(Date) },
        });
        expect(transaction.institutionAttendanceMark.deleteMany).not.toHaveBeenCalled();
    });

    it('does not expose attendance until the Institution timezone is configured', async () => {
        prisma.institution.findUnique.mockResolvedValue({ timezone: null });

        await expect(
            service.getAttendanceDay(staffActor, assignedGroupId, '2026-11-02'),
        ).rejects.toThrow('Institution timezone must be configured');
        expect(prisma.institutionStaffGroupAssignment.findMany).not.toHaveBeenCalled();
        expect(prisma.institutionStudentGroupMembership.findMany).not.toHaveBeenCalled();
    });

    it('uses the Institution predicate for direct group updates', async () => {
        prisma.institutionGroup.updateMany.mockResolvedValue({ count: 0 });

        await expect(
            service.updateGroup(institutionId, otherGroupId, {
                name: 'Group',
                type: 'SCHOOL_SECTION',
            }),
        ).rejects.toThrow(NotFoundException);
        expect(prisma.institutionGroup.updateMany).toHaveBeenCalledWith({
            where: {
                id: otherGroupId,
                institution_id: institutionId,
                archived_at: null,
            },
            data: { name: 'Group', type: 'SCHOOL_SECTION' },
        });
    });
});
