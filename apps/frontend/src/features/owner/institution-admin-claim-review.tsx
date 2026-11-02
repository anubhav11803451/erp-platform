import { RefreshCw } from 'lucide-react';
import type {
    InstitutionAdminInvitationDecision,
    InstitutionAdminInvitationOwnerClaim,
} from '@erp/shared';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { formatDate } from '@/lib/utils/formatters';
import { useOwnerClaimReview } from '@/hooks/owner-setup/claim-review-hooks';

type Props = {
    institutionId: string;
    institutionName: string;
    hasPendingClaim: boolean;
    onDecisionRecorded: () => void;
};

const decisionLabels: Record<InstitutionAdminInvitationDecision, string> = {
    APPROVE: 'Approve claim',
    REJECT: 'Reject claim',
    REVOKE: 'Revoke claim',
};

function readableDate(value: string): string {
    return formatDate(new Date(value), 'PPP p');
}

function decisionGuidance(
    decision: InstitutionAdminInvitationDecision,
    institutionName: string,
    claimant: InstitutionAdminInvitationOwnerClaim
): { title: string; description: string } {
    if (decision === 'APPROVE') {
        return {
            title: 'Approve this Institution Admin claim?',
            description: `Confirm that you verified this person in person or using a phone number you had before sending the invitation. Do not treat the invitation email, sign-in email, or the name they entered as proof. Approval grants Institution Admin membership for ${institutionName}; it does not sign them in.`,
        };
    }

    return {
        title: decision === 'REJECT' ? 'Reject this claim?' : 'Revoke this claim?',
        description: `This records a terminal ${decision.toLowerCase()} decision for ${claimant.claimant_login_identifier}. No Institution access is granted. A fresh invitation is required for another attempt.`,
    };
}

export function InstitutionAdminClaimReview({
    institutionId,
    institutionName,
    hasPendingClaim,
    onDecisionRecorded,
}: Props) {
    const {
        claims,
        error,
        isFetching,
        isLoading,
        isDeciding,
        refetch,
        pendingClaim,
        pendingDecision,
        actionError,
        decisionNotice,
        openDecision,
        closeDecision,
        confirmDecision,
    } = useOwnerClaimReview({ institutionId, hasPendingClaim, onDecisionRecorded });
    const dialog =
        pendingClaim && pendingDecision
            ? decisionGuidance(pendingDecision, institutionName, pendingClaim)
            : null;

    return (
        <section aria-labelledby={`claim-review-title-${institutionId}`} className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h3 id={`claim-review-title-${institutionId}`} className="sr-only">
                        Claim Owner Review
                    </h3>
                    <p className="text-muted-foreground text-sm">
                        Verify this person in person or with a phone number you already had. The
                        email and name below do not prove their identity.
                    </p>
                </div>
                {isLoading && (
                    <div
                        role="status"
                        aria-live="polite"
                        className="text-muted-foreground flex items-center gap-2 text-sm"
                    >
                        <Spinner aria-hidden="true" />
                        <span>Loading pending claim review…</span>
                    </div>
                )}
            </div>

            {error && (
                <Alert variant="destructive" aria-live="assertive">
                    <AlertTitle>Claim queue unavailable</AlertTitle>
                    <AlertDescription className="gap-3">
                        <p>The Owner review queue could not be loaded.</p>
                        <Button
                            type="button"
                            variant="outline"
                            className="min-h-11"
                            onClick={() => void refetch()}
                            disabled={isFetching}
                        >
                            {isFetching ? <Spinner aria-label="Refreshing claim queue" /> : null}
                            Try again
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {actionError && (
                <Alert variant="destructive" aria-live="assertive">
                    <AlertTitle>Decision not confirmed</AlertTitle>
                    <AlertDescription>{actionError}</AlertDescription>
                </Alert>
            )}

            {decisionNotice && (
                <Alert aria-live="polite">
                    <AlertTitle>Decision outcome</AlertTitle>
                    <AlertDescription>{decisionNotice}</AlertDescription>
                </Alert>
            )}

            {!isLoading &&
                !isFetching &&
                !error &&
                claims.length === 0 &&
                (hasPendingClaim ? (
                    <Alert role="status" aria-live="polite">
                        <AlertTitle>Claim review queue may be out of date</AlertTitle>
                        <AlertDescription className="gap-3">
                            <p>
                                Invitation status shows a claim awaiting review, but it is not in
                                this queue yet.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                className="min-h-11"
                                onClick={() => void refetch()}
                                disabled={isFetching}
                            >
                                {isFetching ? (
                                    <Spinner aria-label="Refreshing claim queue" />
                                ) : (
                                    <RefreshCw aria-hidden="true" />
                                )}
                                {isFetching ? 'Refreshing…' : 'Refresh claim queue'}
                            </Button>
                        </AlertDescription>
                    </Alert>
                ) : (
                    <p className="text-muted-foreground text-sm" role="status" aria-live="polite">
                        No claim is currently awaiting Owner review.
                    </p>
                ))}

            {claims.map((claim) => (
                <article key={claim.id} className="bg-muted/40 space-y-3 rounded-md p-3">
                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                        {claim.invited_email && (
                            <div className="min-w-0">
                                <dt className="font-medium">Invitation sent to</dt>
                                <dd className="mt-1 break-all">{claim.invited_email}</dd>
                            </div>
                        )}
                        {claim.owner_contact_name && (
                            <div>
                                <dt className="font-medium">Name you provided before inviting</dt>
                                <dd className="mt-1">{claim.owner_contact_name}</dd>
                            </div>
                        )}
                        {claim.owner_contact_phone && (
                            <div>
                                <dt className="font-medium">
                                    Phone number you had before inviting
                                </dt>
                                <dd className="mt-1">{claim.owner_contact_phone}</dd>
                            </div>
                        )}
                        <div className="min-w-0">
                            <dt className="font-medium">Sign-in email (not verified)</dt>
                            <dd className="mt-1 break-all">{claim.claimant_login_identifier}</dd>
                        </div>
                        <div className="min-w-0">
                            <dt className="font-medium">
                                Name they entered when claiming (not verified)
                            </dt>
                            <dd className="mt-1 break-words">{claim.claimant_provided_name}</dd>
                        </div>
                        <div>
                            <dt className="font-medium">Claim submitted</dt>
                            <dd className="mt-1">{readableDate(claim.claimed_at)}</dd>
                        </div>
                        <div>
                            <dt className="font-medium">Review deadline</dt>
                            <dd className="mt-1">{readableDate(claim.review_expires_at)}</dd>
                        </div>
                    </dl>
                    {claim.invited_email ? (
                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                            {(['APPROVE', 'REJECT', 'REVOKE'] as const).map((decision) => (
                                <Button
                                    key={decision}
                                    type="button"
                                    variant={decision === 'APPROVE' ? 'default' : 'outline'}
                                    className="min-h-11"
                                    onClick={() => openDecision(claim, decision)}
                                    disabled={isDeciding}
                                >
                                    {decisionLabels[decision]}
                                </Button>
                            ))}
                        </div>
                    ) : (
                        <Alert role="status">
                            <AlertTitle>Legacy unbound claim cannot be approved</AlertTitle>
                            <AlertDescription>
                                This invitation has no fixed recipient email. It cannot grant
                                access; close it and issue a new addressed invitation instead.
                            </AlertDescription>
                        </Alert>
                    )}
                </article>
            ))}

            <AlertDialog open={Boolean(dialog)} onOpenChange={closeDecision}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{dialog?.title}</AlertDialogTitle>
                        <AlertDialogDescription>{dialog?.description}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeciding}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className={
                                pendingDecision === 'APPROVE'
                                    ? undefined
                                    : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                            }
                            onClick={(event) => {
                                event.preventDefault();
                                void confirmDecision();
                            }}
                            disabled={isDeciding}
                        >
                            {isDeciding ? (
                                <>
                                    <Spinner aria-label="Recording Owner decision" />
                                    Recording…
                                </>
                            ) : pendingDecision ? (
                                `Confirm ${pendingDecision.toLowerCase()}`
                            ) : (
                                'Confirm'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}
