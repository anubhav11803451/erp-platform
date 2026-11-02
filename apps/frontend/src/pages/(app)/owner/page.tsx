import { Navigate } from 'react-router';
import { Access } from '@/components/role-bac/access';
import { OwnerSetup } from '@/features/owner/owner-setup';
import type { AppRouteHandle } from '@/lib/route-breadcrumbs';

// Route metadata is exported for the file-route lazy module.
// eslint-disable-next-line react-refresh/only-export-components
export const handle = {
    breadcrumb: 'Institution setup',
} satisfies AppRouteHandle;

export default function OwnerHomePage() {
    return (
        <Access feature="PLATFORM.SETUP" fallback={<Navigate to="/institution" replace />}>
            <section aria-labelledby="owner-page-title" className="space-y-6">
                <div className="space-y-2">
                    <p className="text-muted-foreground text-sm font-medium">Platform workspace</p>
                    <h1
                        id="owner-page-title"
                        className="text-2xl font-semibold tracking-tight sm:text-3xl"
                    >
                        Institution setup
                    </h1>
                    <p className="text-muted-foreground max-w-2xl">
                        Create a LegalEntity group and its first Institution. A group can contain
                        multiple Institutions.
                    </p>
                </div>
                <OwnerSetup />
            </section>
        </Access>
    );
}
