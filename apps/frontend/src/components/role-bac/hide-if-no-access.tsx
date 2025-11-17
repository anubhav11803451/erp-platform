'use client';

import { type ReactElement, cloneElement } from 'react';
import { canCurrentUserAccess } from '@/lib/utils/current-user-access';
import type { FeatureKey } from '@/config/permissions';
import { cn } from '@/lib/utils';

type HideIfNoAccessProps<P> = {
    feature: FeatureKey;
    hide?: boolean;
    children: ReactElement<P>;
};

export function HideIfNoAccess<P extends { disabled?: boolean; className?: string }>({
    feature,
    hide = false,
    children,
}: HideIfNoAccessProps<P>) {
    const allowed = canCurrentUserAccess(feature);

    if (allowed) return children;

    // hide completely
    if (hide) return null;

    // inject disabled + tailwind classes
    return cloneElement(children, {
        disabled: true,
        className: cn(children.props.className, 'cursor-not-allowed opacity-50'),
    } as P);
}
