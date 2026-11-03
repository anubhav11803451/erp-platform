import { Outlet } from 'react-router';
import { WorkspaceGate } from '@/components/shared/workspace-gate';

export default function StaffWorkspaceLayout() {
    return (
        <WorkspaceGate allowedRoles={['INSTITUTION_STAFF']}>
            <Outlet />
        </WorkspaceGate>
    );
}
