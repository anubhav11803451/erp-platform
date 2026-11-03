import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import type { AppRole } from '@/config/permissions';
import { useRoleAccess } from '@/hooks/use-role-access';
import { workspacePathForRole } from '@/lib/utils/workspace-path';

export function WorkspaceGate({
    allowedRoles,
    children,
}: {
    allowedRoles: readonly AppRole[];
    children: ReactNode;
}) {
    const { role } = useRoleAccess();
    if (!role || !allowedRoles.includes(role)) {
        return <Navigate to={workspacePathForRole(role)} replace />;
    }
    return children;
}
