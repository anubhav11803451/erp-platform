import { useMatches } from 'react-router';
import type { AppRouteHandle } from '@/lib/route-breadcrumbs';

export type BreadcrumbItem = {
    id: string;
    label: string;
    href?: string;
};

export function useBreadcrumbs() {
    const matches = useMatches();

    return matches.flatMap((match): BreadcrumbItem[] => {
        const handle = match.handle as AppRouteHandle | undefined;
        if (!handle) {
            return [];
        }
        if (typeof handle.breadcrumb !== 'string' && typeof handle.breadcrumb !== 'function') {
            return [];
        }

        const label =
            typeof handle.breadcrumb === 'function'
                ? handle.breadcrumb(match.loaderData)
                : handle.breadcrumb;
        if (!label.trim()) {
            return [];
        }

        const activeParent = handle.to
            ? matches.find((candidate) => candidate.pathname === handle.to)
            : undefined;

        return [
            {
                id: match.id,
                label,
                href: activeParent?.pathname,
            },
        ];
    });
}
