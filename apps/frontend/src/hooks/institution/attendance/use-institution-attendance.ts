import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import {
    institutionAttendanceSaveRequestSchema,
    type InstitutionAttendanceSaveRequest,
} from '@erp/shared';
import { toast } from 'sonner';
import { useInstitutionGroups } from '@/hooks/institution/groups/use-institution-groups';
import { useGetInstitutionProfileQuery } from '@/features/institution/profile/profile-api-slice';
import { useGetInstitutionStaffContextQuery } from '@/features/institution/staff-workspace/staff-workspace-api-slice';
import {
    useGetInstitutionAttendanceQuery,
    useSaveInstitutionAttendanceMutation,
} from '@/features/institution/attendance/attendance-api-slice';
import { todayForTimezone } from '@/lib/utils/timezone';

export function useInstitutionAttendance() {
    const groupsQuery = useInstitutionGroups();
    const { isInstitutionStaff, activeGroups } = groupsQuery;
    const [searchParams, setSearchParams] = useSearchParams();
    const profile = useGetInstitutionProfileQuery(undefined, { skip: isInstitutionStaff });
    const staffContext = useGetInstitutionStaffContextQuery(undefined, {
        skip: !isInstitutionStaff,
        refetchOnMountOrArgChange: true,
    });
    const [groupId, setGroupId] = useState(searchParams.get('group') ?? '');
    const [date, setDate] = useState('');
    const selectedGroup = activeGroups.find((group) => group.id === groupId);
    const activeGroupId = selectedGroup ? groupId : '';
    const timezone = isInstitutionStaff ? staffContext.data?.timezone : profile.data?.timezone;
    const timezoneReady = Boolean(timezone);
    const attendance = useGetInstitutionAttendanceQuery(
        { groupId: activeGroupId, date, staff: isInstitutionStaff },
        {
            skip: !activeGroupId || !date || !timezoneReady,
            refetchOnMountOrArgChange: isInstitutionStaff,
        }
    );
    const attendanceData = attendance.currentData;
    const [saveAttendance, saveState] = useSaveInstitutionAttendanceMutation();
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const attendanceKey = `${activeGroupId}:${date}`;

    useEffect(() => {
        const requestedGroupId = searchParams.get('group');
        if (requestedGroupId && activeGroups.some((group) => group.id === requestedGroupId)) {
            setGroupId(requestedGroupId);
        } else if (!activeGroups.some((group) => group.id === groupId)) {
            setGroupId(activeGroups[0]?.id ?? '');
        }
    }, [activeGroups, groupId, searchParams]);

    useEffect(() => {
        if (timezone && !date) {
            setDate(todayForTimezone(timezone));
        }
    }, [date, timezone]);

    useEffect(() => {
        setSaveMessage(null);
    }, [attendanceKey]);

    function selectGroup(value: string) {
        setGroupId(value);
        setSearchParams(value ? { group: value } : {});
    }

    async function save(values: { marks: InstitutionAttendanceSaveRequest['marks'] }) {
        if (!activeGroupId || !date) {
            return;
        }
        setSaveMessage(null);
        const parsed = institutionAttendanceSaveRequestSchema.safeParse({
            group_id: activeGroupId,
            attendance_date: date,
            marks: values.marks,
        });
        if (!parsed.success) {
            setSaveMessage('Attendance could not be validated. Review the roster and try again.');
            return;
        }
        try {
            await saveAttendance({ payload: parsed.data, staff: isInstitutionStaff }).unwrap();
            setSaveMessage('Attendance saved.');
            toast.success('Attendance saved.');
        } catch {
            setSaveMessage(
                'Attendance could not be saved. Your unsaved selections are still shown; try again or ask an Admin to confirm the Institution timezone.'
            );
        }
    }

    return {
        groupsQuery,
        isInstitutionStaff,
        activeGroups,
        profile,
        staffContext,
        groupId,
        date,
        setDate,
        selectedGroup,
        activeGroupId,
        timezone,
        timezoneReady,
        attendance,
        attendanceData,
        saveState,
        saveMessage,
        attendanceKey,
        selectGroup,
        save,
    };
}
