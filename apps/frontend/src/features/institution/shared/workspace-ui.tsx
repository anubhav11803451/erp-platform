import type { ReactNode } from 'react';
import { AlertCircle, LoaderCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/utils';

export function PageHeading({
    title,
    description,
    actions,
    className,
}: {
    title: string;
    description: string;
    actions?: ReactNode;
    className?: string;
}) {
    return (
        <header
            className={cn(
                'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
                className
            )}
        >
            <div className="min-w-0 space-y-2">
                <p className="text-muted-foreground text-sm font-medium">Institution workspace</p>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
                <p className="text-muted-foreground max-w-2xl">{description}</p>
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </header>
    );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
    return (
        <div
            role="status"
            aria-live="polite"
            className="text-muted-foreground flex items-center gap-2 py-6"
        >
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            <span>{label}</span>
        </div>
    );
}

export function RequestError({
    error,
    title = 'Could not load this information',
    onRetry,
}: {
    error: unknown;
    title?: string;
    onRetry?: () => void;
}) {
    return (
        <Alert variant="destructive" aria-live="assertive">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription className="gap-3">
                <p>
                    {getApiErrorMessage(
                        error,
                        'Please try again. Your changes are not assumed saved.'
                    )}
                </p>
                {onRetry && (
                    <Button type="button" variant="outline" onClick={onRetry}>
                        Try again
                    </Button>
                )}
            </AlertDescription>
        </Alert>
    );
}

export function EmptyState({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="rounded-lg border border-dashed p-6 text-center">
            <h2 className="font-semibold">{title}</h2>
            <p className="text-muted-foreground mx-auto mt-2 max-w-xl text-sm">{description}</p>
            {action && <div className="mt-4 flex justify-center">{action}</div>}
        </div>
    );
}
