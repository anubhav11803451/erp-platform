import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useInstitutionGroups } from '@/hooks/institution/groups/use-institution-groups';
import {
    useGetInstitutionGroupStudentsQuery,
    useGetInstitutionStudentsQuery,
    useGetStaffGroupStudentsQuery,
} from '@/features/institution/students/students-api-slice';
import {
    selectStudentsUi,
    setSelectedStudentId,
    setStudentCreateOpen,
    setStudentSearch,
    setStudentsStatusMessage,
} from '@/features/institution/students/students-ui-slice';

export function useInstitutionStudents() {
    const dispatch = useAppDispatch();
    const { search, showCreate, statusMessage, selectedStudentId } =
        useAppSelector(selectStudentsUi);
    const groupsQuery = useInstitutionGroups();
    const { activeGroups, isInstitutionStaff } = groupsQuery;
    const [searchParams, setSearchParams] = useSearchParams();
    const requestedGroup = searchParams.get('group') ?? 'all';
    const requestedGroupId = requestedGroup === 'all' ? '' : requestedGroup;
    const groupId = activeGroups.some((group) => group.id === requestedGroupId)
        ? requestedGroupId
        : '';
    const allStudents = useGetInstitutionStudentsQuery(
        { search },
        { skip: isInstitutionStaff || Boolean(groupId) }
    );
    const groupStudents = useGetInstitutionGroupStudentsQuery(
        { groupId, search },
        { skip: isInstitutionStaff || !groupId || groupsQuery.isLoading || groupsQuery.isError }
    );
    const staffStudents = useGetStaffGroupStudentsQuery(
        { groupId, search },
        {
            skip: !isInstitutionStaff || !groupId || groupsQuery.isLoading || groupsQuery.isError,
            refetchOnMountOrArgChange: true,
        }
    );

    useEffect(() => {
        if (
            isInstitutionStaff &&
            !activeGroups.some((group) => group.id === requestedGroupId) &&
            activeGroups[0]
        ) {
            setSearchParams({ group: activeGroups[0].id });
        }
        if (
            !isInstitutionStaff &&
            requestedGroupId &&
            !activeGroups.some((group) => group.id === requestedGroupId)
        ) {
            setSearchParams({});
        }
    }, [activeGroups, groupId, isInstitutionStaff, requestedGroupId, setSearchParams]);

    const query = isInstitutionStaff ? staffStudents : groupId ? groupStudents : allStudents;
    const students = query.currentData?.students.filter((student) => !student.archived_at) ?? [];
    const selectedStudent = students.find((student) => student.id === selectedStudentId);
    const isRosterLoading = query.isLoading || (query.isFetching && !query.currentData);
    const setStatusMessage = (message: string) => dispatch(setStudentsStatusMessage(message));

    return {
        search,
        showCreate,
        statusMessage,
        selectedStudentId,
        selectedStudent,
        activeGroups,
        isInstitutionStaff,
        groupId,
        groupsQuery,
        query,
        students,
        isRosterLoading,
        setStatusMessage,
        setGroup: (value: string) => setSearchParams(value === 'all' ? {} : { group: value }),
        setSearch: (value: string) => dispatch(setStudentSearch(value)),
        toggleCreate: () => dispatch(setStudentCreateOpen(!showCreate)),
        openCreate: () => dispatch(setStudentCreateOpen(true)),
        toggleStudent: (studentId: string) =>
            dispatch(setSelectedStudentId(selectedStudentId === studentId ? null : studentId)),
        closeStudent: () => dispatch(setSelectedStudentId(null)),
    };
}
