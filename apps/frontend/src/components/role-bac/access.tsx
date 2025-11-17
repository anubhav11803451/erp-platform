'use client';

import { Fragment, type ReactNode } from 'react';
import { canCurrentUserAccess } from '@/lib/utils/current-user-access';
import type { FeatureKey } from '@/config/permissions';

function Fallback() {
    return <p className="text-muted-foreground opacity-50">Access denied</p>;
}
type AccessProps = {
    feature: FeatureKey;
    children: ReactNode;
    fallback?: ReactNode; // Optional: show something else when blocked
};

export function Access({ feature, children, fallback = <Fallback /> }: AccessProps) {
    const allowed = canCurrentUserAccess(feature);

    if (!allowed) return fallback;
    return <Fragment>{children}</Fragment>;
}
