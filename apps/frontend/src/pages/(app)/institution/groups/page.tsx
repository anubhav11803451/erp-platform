import { InstitutionGroupsPage } from '@/features/institution/groups/groups-page';
import { WorkspaceGate } from '@/components/shared/workspace-gate';
import type { AppRouteHandle } from '@/lib/route-breadcrumbs';

// eslint-disable-next-line react-refresh/only-export-components
export const handle = { breadcrumb: 'Groups' } satisfies AppRouteHandle;

export default function InstitutionGroupsRoute() {
    return (
        <WorkspaceGate allowedRoles={['INSTITUTION_ADMIN']}>
            <InstitutionGroupsPage />
        </WorkspaceGate>
    );
}
