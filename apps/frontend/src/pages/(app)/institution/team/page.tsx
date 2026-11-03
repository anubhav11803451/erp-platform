import { InstitutionTeamPage } from '@/features/institution/team/team-page';
import { WorkspaceGate } from '@/components/shared/workspace-gate';
import type { AppRouteHandle } from '@/lib/route-breadcrumbs';

// eslint-disable-next-line react-refresh/only-export-components
export const handle = { breadcrumb: 'Team' } satisfies AppRouteHandle;

export default function InstitutionTeamRoute() {
    return (
        <WorkspaceGate allowedRoles={['INSTITUTION_ADMIN']}>
            <InstitutionTeamPage />
        </WorkspaceGate>
    );
}
