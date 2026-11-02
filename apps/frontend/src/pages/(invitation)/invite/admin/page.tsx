import { InvitationAcceptance } from '@/features/institution-admin-invitation/invitation-acceptance';
import type { AppRouteHandle } from '@/lib/route-breadcrumbs';

// Route metadata is exported for the file-route lazy module.
// eslint-disable-next-line react-refresh/only-export-components
export const handle = {
    breadcrumb: 'Invitation',
} satisfies AppRouteHandle;

export default function InvitationPage() {
    return <InvitationAcceptance />;
}
