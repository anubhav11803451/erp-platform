import { useGetInstitutionProfileQuery } from '@/features/institution/profile/profile-api-slice';
import { useRoleAccess } from '@/hooks/use-role-access';

export function useInstitutionOverview() {
    const { user } = useRoleAccess();
    const isAdmin = user?.identity_kind === 'INSTITUTION_ADMIN';
    const profile = useGetInstitutionProfileQuery(undefined, { skip: !isAdmin });

    return {
        profile,
        institution: isAdmin ? user.institution : null,
        account: isAdmin ? user.account : null,
    };
}
