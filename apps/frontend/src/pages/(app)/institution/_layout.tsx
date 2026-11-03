import { Outlet } from 'react-router';
import { WorkspaceGate } from '@/components/shared/workspace-gate';

export default function InstitutionWorkspaceLayout() {
    return (
        <WorkspaceGate allowedRoles={['INSTITUTION_ADMIN']}>
            <Outlet />
        </WorkspaceGate>
    );
}
