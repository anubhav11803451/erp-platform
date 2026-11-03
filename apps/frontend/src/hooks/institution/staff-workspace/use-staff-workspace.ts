import { useRoleAccess } from '@/hooks/use-role-access';
import { useInstitutionGroups } from '@/hooks/institution/groups/use-institution-groups';
import { useGetInstitutionStaffContextQuery } from '@/features/institution/staff-workspace/staff-workspace-api-slice';

export function useStaffWorkspace() {
    const { user } = useRoleAccess();
    const groups = useInstitutionGroups();
    const context = useGetInstitutionStaffContextQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });
    const institutionName =
        context.data?.institution_name ??
        (user?.identity_kind === 'INSTITUTION_STAFF' ? user.institution.name : 'Not available');

    return {
        user,
        groups,
        context,
        assignedGroups: groups.activeGroups,
        institutionName,
    };
}
