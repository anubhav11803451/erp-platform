import { useMemo } from 'react';
import type { InstitutionGroupResponse } from '@erp/shared';
import { useRoleAccess } from '@/hooks/use-role-access';
import {
    useGetInstitutionGroupsQuery,
    useGetStaffGroupsQuery,
} from '@/features/institution/groups/groups-api-slice';

const EMPTY_GROUPS: InstitutionGroupResponse[] = [];

export function useInstitutionGroups() {
    const { isInstitutionStaff } = useRoleAccess();
    const adminQuery = useGetInstitutionGroupsQuery(undefined, { skip: isInstitutionStaff });
    const staffQuery = useGetStaffGroupsQuery(undefined, {
        skip: !isInstitutionStaff,
        refetchOnMountOrArgChange: true,
    });
    const query = isInstitutionStaff ? staffQuery : adminQuery;
    const groups = query.data?.groups ?? EMPTY_GROUPS;
    const activeGroups = useMemo(() => groups.filter((group) => !group.archived_at), [groups]);

    return {
        ...query,
        groups,
        activeGroups,
        isInstitutionStaff,
    };
}
