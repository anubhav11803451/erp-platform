// components/auth/AccessSection.tsx
'use client';

import type { ReactNode } from 'react';
import { canCurrentUserAccess } from '@/lib/utils/current-user-access';
import type { FeatureKey } from '@/config/permissions';

type AccessSectionProps = {
    feature: FeatureKey;
    children: ReactNode;
    fallback?: ReactNode; // show if user has no access
    title?: string; // optional section title
    description?: string; // optional section description
    lockMode?: boolean; // show blurred/locked content
    className?: string; // wrapper class for styling
};

export function AccessSection({
    feature,
    children,
    fallback = null,
    title,
    description,
    lockMode = false,
    className = '',
}: AccessSectionProps) {
    const allowed = canCurrentUserAccess(feature);

    // If fully restricted, hide the content unless lockMode=true
    if (!allowed && !lockMode) {
        return (
            <div className={className}>
                {title && <h3 className="text-lg font-semibold">{title}</h3>}
                {description && <p className="text-muted-foreground text-sm">{description}</p>}
                {fallback}
            </div>
        );
    }

    return (
        <div className={className}>
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {description && <p className="text-muted-foreground mb-3 text-sm">{description}</p>}

            {/* If lock mode → content is visible but blurred + disabled */}
            <div
                className={!allowed ? 'pointer-events-none opacity-40 blur-[1px] select-none' : ''}
            >
                {children}
            </div>

            {/* Add fallback message below in lock mode */}
            {!allowed && lockMode && (
                <p className="mt-2 text-xs font-medium text-red-600">
                    You do not have permission to modify this section.
                </p>
            )}
        </div>
    );
}
