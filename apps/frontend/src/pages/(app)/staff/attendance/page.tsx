import { AttendancePage } from '@/features/institution/attendance/attendance-page';
import { WorkspaceGate } from '@/components/shared/workspace-gate';
import type { AppRouteHandle } from '@/lib/route-breadcrumbs';

// eslint-disable-next-line react-refresh/only-export-components
export const handle = { breadcrumb: 'Attendance' } satisfies AppRouteHandle;

export default function StaffAttendanceRoute() {
    return (
        <WorkspaceGate allowedRoles={['INSTITUTION_STAFF']}>
            <AttendancePage />
        </WorkspaceGate>
    );
}
