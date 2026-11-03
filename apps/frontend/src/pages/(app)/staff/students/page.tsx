import { StudentsPage } from '@/features/institution/students/students-page';
import { WorkspaceGate } from '@/components/shared/workspace-gate';
import type { AppRouteHandle } from '@/lib/route-breadcrumbs';

// eslint-disable-next-line react-refresh/only-export-components
export const handle = { breadcrumb: 'Students' } satisfies AppRouteHandle;

export default function StaffStudentsRoute() {
    return (
        <WorkspaceGate allowedRoles={['INSTITUTION_STAFF']}>
            <StudentsPage />
        </WorkspaceGate>
    );
}
