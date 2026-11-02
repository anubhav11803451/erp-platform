import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Breadcrumbs } from '@/components/shared/breadcrumbs/bread-crumbs';
import { formatDate } from '@/lib/utils/formatters';
import {
    ClaimantNameForm,
    ExistingInvitationAccountForm,
    NewInvitationAccountForm,
} from './invitation-account-forms';
import { ClaimantStatusDetails } from './claimant-status-details';
import { useInvitationAcceptance } from '@/hooks/forms/use-invitation-acceptance';

function readableDate(value: string): string {
    return formatDate(new Date(value), 'PPP p');
}

function InvitationStatus({ children }: { children: string }) {
    return (
        <div
            role="status"
            aria-live="polite"
            className="text-muted-foreground flex items-center gap-2"
        >
            <Spinner aria-hidden="true" />
            <span>{children}</span>
        </div>
    );
}

export function InvitationAcceptance() {
    const {
        headingRef,
        pageState,
        accountMode,
        existingAccountReady,
        feedback,
        feedbackIsError,
        claimCheckAvailable,
        isRefreshing,
        statusHeading,
        invitationContext,
        claimantStatus,
        selectAccountMode,
        retryEntryCheck,
        refreshStatus,
        submitExistingAccount,
        submitExistingClaim,
        submitNewAccountClaim,
    } = useInvitationAcceptance();

    return (
        <main className="bg-background min-h-dvh px-4 py-8 sm:px-6 sm:py-12">
            <div className="mx-auto w-full max-w-xl space-y-5">
                <Breadcrumbs />
                <Card>
                    <CardHeader>
                        <p className="text-muted-foreground text-sm font-medium">
                            Institution invitation
                        </p>
                        <CardTitle
                            ref={headingRef}
                            tabIndex={-1}
                            className="text-2xl focus-visible:ring-2 focus-visible:outline-none"
                        >
                            {statusHeading ?? 'Claim Institution Admin invitation'}
                        </CardTitle>
                        <CardDescription>
                            Claiming requests Owner review. It does not create Institution access or
                            sign you in.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {pageState === 'loading' && (
                            <>
                                <InvitationStatus>
                                    Checking the invitation and restoring its secure status…
                                </InvitationStatus>
                                {feedback && (
                                    <Alert variant="destructive" aria-live="assertive">
                                        <AlertTitle>Check could not finish</AlertTitle>
                                        <AlertDescription className="gap-3">
                                            <p>{feedback}</p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="min-h-11"
                                                onClick={() => void retryEntryCheck()}
                                            >
                                                Try again
                                            </Button>
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </>
                        )}

                        {pageState === 'unavailable' && (
                            <Alert variant="destructive" aria-live="assertive">
                                <AlertTitle>Invitation or status unavailable</AlertTitle>
                                <AlertDescription className="gap-3">
                                    <p>
                                        {feedback ||
                                            'This link is invalid or unavailable. It may have expired after the review deadline; we cannot verify a terminal outcome with this link.'}
                                    </p>
                                    <p>
                                        Contact the Platform Owner for current status. This page
                                        does not provide Institution access.
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="min-h-11"
                                        onClick={() => void retryEntryCheck()}
                                    >
                                        Try again
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        )}

                        {pageState === 'service-error' && (
                            <Alert variant="destructive" aria-live="assertive">
                                <AlertTitle>Invitation check could not finish</AlertTitle>
                                <AlertDescription className="gap-3">
                                    <p>
                                        {feedback ||
                                            'The service could not confirm the invitation or claim status. No access is assumed.'}
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="min-h-11"
                                        onClick={() => void retryEntryCheck()}
                                    >
                                        Try again
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        )}

                        {invitationContext && pageState === 'invitation' && (
                            <>
                                <section
                                    aria-labelledby="validated-invitation-title"
                                    className="space-y-2 rounded-md border p-4"
                                >
                                    <h2 id="validated-invitation-title" className="font-semibold">
                                        Invitation details
                                    </h2>
                                    <p className="wrap-break-word">
                                        {invitationContext.institution.name}
                                    </p>
                                    <p className="text-muted-foreground text-sm">
                                        Fixed role: Institution Admin
                                    </p>
                                    <p className="text-muted-foreground text-sm">
                                        Invitation expires{' '}
                                        {readableDate(invitationContext.invitation_expires_at)}.
                                    </p>
                                    <p className="text-sm">
                                        If you submit a claim, the Platform Owner reviews the
                                        account login identifier and claimant-provided name. The
                                        name is unverified until separately checked in person or
                                        through a previously known phone contact—not by email or
                                        this link.
                                    </p>
                                </section>

                                {!existingAccountReady && (
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <Button
                                            type="button"
                                            variant={accountMode === 'new' ? 'default' : 'outline'}
                                            className="min-h-11 flex-1"
                                            aria-pressed={accountMode === 'new'}
                                            onClick={() => selectAccountMode('new')}
                                        >
                                            Create a new account
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={
                                                accountMode === 'existing' ? 'default' : 'outline'
                                            }
                                            className="min-h-11 flex-1"
                                            aria-pressed={accountMode === 'existing'}
                                            onClick={() => selectAccountMode('existing')}
                                        >
                                            Use an existing account
                                        </Button>
                                    </div>
                                )}

                                {feedback && (
                                    <Alert
                                        variant={feedbackIsError ? 'destructive' : 'default'}
                                        aria-live={feedbackIsError ? 'assertive' : 'polite'}
                                    >
                                        <AlertTitle>
                                            {feedbackIsError
                                                ? 'Could not continue'
                                                : 'Ready to claim'}
                                        </AlertTitle>
                                        <AlertDescription className="gap-3">
                                            <p>{feedback}</p>
                                            {claimCheckAvailable && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="min-h-11"
                                                    onClick={() => void retryEntryCheck()}
                                                >
                                                    Check claim status
                                                </Button>
                                            )}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {existingAccountReady ? (
                                    <ClaimantNameForm onSubmit={submitExistingClaim} />
                                ) : accountMode === 'existing' ? (
                                    <ExistingInvitationAccountForm
                                        invitedEmail={invitationContext.invited_email}
                                        onSubmit={submitExistingAccount}
                                    />
                                ) : (
                                    <NewInvitationAccountForm
                                        invitedEmail={invitationContext.invited_email}
                                        onSubmit={submitNewAccountClaim}
                                    />
                                )}
                                <p className="text-muted-foreground text-sm">
                                    Accounts already assigned to an Institution or holding Platform
                                    Owner authority cannot claim. No claim gives access before
                                    approval and a separate sign-in.
                                </p>
                            </>
                        )}

                        {claimantStatus && pageState === 'claimant-status' && (
                            <>
                                {feedback && (
                                    <Alert variant="destructive" aria-live="assertive">
                                        <AlertTitle>Status refresh unavailable</AlertTitle>
                                        <AlertDescription>{feedback}</AlertDescription>
                                    </Alert>
                                )}
                                <ClaimantStatusDetails
                                    status={claimantStatus}
                                    refreshing={isRefreshing}
                                    onRefresh={() => void refreshStatus()}
                                />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
