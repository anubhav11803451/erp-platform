import { InstitutionProfilePage } from '@/features/institution/profile/profile-page';
import { WorkspaceGate } from '@/components/shared/workspace-gate';
import type { AppRouteHandle } from '@/lib/route-breadcrumbs';

// eslint-disable-next-line react-refresh/only-export-components
export const handle = { breadcrumb: 'Institution profile' } satisfies AppRouteHandle;

export default function InstitutionProfileRoute() {
    return (
        <WorkspaceGate allowedRoles={['INSTITUTION_ADMIN']}>
            <InstitutionProfilePage />
        </WorkspaceGate>
    );
}
