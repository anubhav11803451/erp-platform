import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { InstitutionAdminInvitationClaimantStatusResponse } from '@erp/shared';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { formatDate } from '@/lib/utils/formatters';
import { claimantStatusMessages } from './claimant-status-messages';
import { useLogoutMutation } from '@/features/auth/auth-api-slice';

function readableDate(value: string): string {
    return formatDate(new Date(value), 'PPP p');
}

export function ClaimantStatusDetails({
    status,
    refreshing,
    onRefresh,
}: {
    status: InstitutionAdminInvitationClaimantStatusResponse;
    refreshing: boolean;
    onRefresh: () => void;
}) {
    const message = claimantStatusMessages[status.status];
    const navigate = useNavigate();
    const [logout, { isLoading: isSigningOut }] = useLogoutMutation();
    const [signInError, setSignInError] = useState('');

    async function continueToSignIn() {
        setSignInError('');
        try {
            await logout().unwrap();
            navigate('/signin', { replace: true });
        } catch {
            setSignInError(
                'The previous workspace session could not be cleared. Try again or open the link in a fresh browser session.'
            );
        }
    }

    return (
        <section aria-labelledby="claim-status-title" className="space-y-4">
            <Alert aria-live="polite">
                <AlertTitle id="claim-status-title">{message.title}</AlertTitle>
                <AlertDescription className="gap-2">
                    <p>{message.description}</p>
                    <p>Submitted: {readableDate(status.claimed_at)}</p>
                    <p>Review deadline: {readableDate(status.review_expires_at)}</p>
                    {status.decided_at && (
                        <p>Decision recorded: {readableDate(status.decided_at)}</p>
                    )}
                </AlertDescription>
            </Alert>

            {status.status === 'APPROVED' && (
                <>
                    {signInError && (
                        <Alert variant="destructive" aria-live="assertive">
                            <AlertTitle>Could not prepare sign-in</AlertTitle>
                            <AlertDescription>{signInError}</AlertDescription>
                        </Alert>
                    )}
                    <Button
                        type="button"
                        className="min-h-11 w-full"
                        onClick={() => void continueToSignIn()}
                        disabled={isSigningOut}
                        aria-busy={isSigningOut}
                    >
                        {isSigningOut ? (
                            <>
                                <Spinner aria-label="Clearing previous workspace session" />
                                Preparing sign-in…
                            </>
                        ) : (
                            'Continue to shared sign-in'
                        )}
                    </Button>
                </>
            )}

            <p className="text-muted-foreground text-sm">
                Claim status is not an authenticated session and does not provide Institution data.
            </p>
            <Button
                type="button"
                variant="outline"
                className="min-h-11 w-full"
                onClick={onRefresh}
                disabled={refreshing}
                aria-busy={refreshing}
            >
                {refreshing ? (
                    <>
                        <Spinner aria-label="Refreshing claim status" />
                        Refreshing…
                    </>
                ) : (
                    'Refresh claim status'
                )}
            </Button>
        </section>
    );
}
