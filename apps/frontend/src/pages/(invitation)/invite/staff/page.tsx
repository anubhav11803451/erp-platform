import { StaffInvitationAcceptance } from '@/features/institution/staff-invitation/staff-invitation-acceptance';
import type { AppRouteHandle } from '@/lib/route-breadcrumbs';

// eslint-disable-next-line react-refresh/only-export-components
export const handle = { breadcrumb: 'Staff invitation' } satisfies AppRouteHandle;

export default function StaffInvitationPage() {
    return <StaffInvitationAcceptance />;
}
