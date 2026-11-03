import { useLocation, useMatches } from 'react-router';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/auth-slice';
import {
    useGetInstitutionGroupsQuery,
    useGetStaffGroupsQuery,
} from '@/features/institution/groups/groups-api-slice';
import { useRoleAccess } from '@/hooks/use-role-access';
import type { AppRouteHandle } from '@/lib/route-breadcrumbs';

export type BreadcrumbItem = {
    id: string;
    label: string;
    href?: string;
};

export function useBreadcrumbs() {
    const matches = useMatches();
    const location = useLocation();
    const user = useAppSelector(selectCurrentUser);
    const { isInstitutionAdmin, isInstitutionStaff } = useRoleAccess();
    const isInstitutionWorkspace =
        location.pathname === '/institution' ||
        location.pathname.startsWith('/institution/') ||
        location.pathname === '/staff' ||
        location.pathname.startsWith('/staff/');
    const groupId = new URLSearchParams(location.search).get('group');
    const shouldLoadGroup = isInstitutionWorkspace && Boolean(groupId);
    const adminGroups = useGetInstitutionGroupsQuery(undefined, {
        skip: !shouldLoadGroup || !isInstitutionAdmin,
    });
    const staffGroups = useGetStaffGroupsQuery(undefined, {
        skip: !shouldLoadGroup || !isInstitutionStaff,
    });
    const groups = isInstitutionStaff
        ? staffGroups.data?.groups
        : isInstitutionAdmin
          ? adminGroups.data?.groups
          : undefined;
    const selectedGroup = groups?.find((group) => group.id === groupId && !group.archived_at);

    const routeCrumbs = matches.flatMap((match): BreadcrumbItem[] => {
        const handle = match.handle as AppRouteHandle | undefined;
        if (!handle) {
            return [];
        }
        if (typeof handle.breadcrumb !== 'string' && typeof handle.breadcrumb !== 'function') {
            return [];
        }

        const label =
            typeof handle.breadcrumb === 'function'
                ? handle.breadcrumb(match.loaderData)
                : handle.breadcrumb;
        if (!label.trim()) {
            return [];
        }

        const activeParent = handle.to
            ? matches.find((candidate) => candidate.pathname === handle.to)
            : undefined;

        return [
            {
                id: match.id,
                label,
                href: activeParent?.pathname,
            },
        ];
    });
    if (
        !isInstitutionWorkspace ||
        !user ||
        (user.identity_kind !== 'INSTITUTION_ADMIN' && user.identity_kind !== 'INSTITUTION_STAFF')
    ) {
        return routeCrumbs;
    }

    const institutionCrumb: BreadcrumbItem = {
        id: 'institution-root',
        label: user.institution.name,
        href: user.identity_kind === 'INSTITUTION_STAFF' ? '/staff' : '/institution',
    };
    const groupCrumb: BreadcrumbItem | null = selectedGroup
        ? {
              id: `group-${selectedGroup.id}`,
              label: `${selectedGroup.type === 'SCHOOL_SECTION' ? 'Class' : 'Batch'}: ${selectedGroup.name}`,
          }
        : null;

    return [institutionCrumb, ...(groupCrumb ? [groupCrumb] : []), ...routeCrumbs];
}
