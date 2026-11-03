import { StaffHomePage } from '@/features/institution/staff-workspace/staff-home-page';
import { WorkspaceGate } from '@/components/shared/workspace-gate';
import type { AppRouteHandle } from '@/lib/route-breadcrumbs';

// eslint-disable-next-line react-refresh/only-export-components
export const handle = { breadcrumb: 'My groups' } satisfies AppRouteHandle;

export default function StaffHomeRoute() {
    return (
        <WorkspaceGate allowedRoles={['INSTITUTION_STAFF']}>
            <StaffHomePage />
        </WorkspaceGate>
    );
}
