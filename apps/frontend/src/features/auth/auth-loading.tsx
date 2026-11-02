import { LoaderCircle } from 'lucide-react';

type AuthLoadingProps = {
    message?: string;
};

export function AuthLoading({ message = 'Restoring your session' }: AuthLoadingProps) {
    return (
        <div
            role="status"
            aria-live="polite"
            className="bg-background text-muted-foreground flex min-h-dvh flex-col items-center justify-center gap-3 p-6"
        >
            <LoaderCircle aria-hidden="true" className="text-primary size-6 animate-spin" />
            <span>{message}</span>
        </div>
    );
}
