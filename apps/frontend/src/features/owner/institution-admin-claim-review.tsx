import { Clock, ShieldAlert, ShieldCheck } from 'lucide-react';
import type {
    InstitutionAdminInvitationDecision,
    InstitutionAdminInvitationOwnerClaim,
} from '@erp/shared';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Flex } from '@/components/ui/flex';
import { Grid } from '@/components/ui/grid';
import { Spinner } from '@/components/ui/spinner';
import { Typography } from '@/components/ui/typography';
import { formatDate } from '@/lib/utils/formatters';
import type { OwnerClaimReviewState } from '@/hooks/owner-setup/claim-review-hooks';

type Props = {
    institutionId: string;
    institutionName: string;
    review: OwnerClaimReviewState;
};

function readableDate(value: string): string {
    return formatDate(new Date(value), 'PPP p');
}

function claimDetails(claim: InstitutionAdminInvitationOwnerClaim): [string, string][] {
    const details: [string, string][] = [
        ['Claimant name (unverified)', claim.claimant_provided_name],
    ];

    if (claim.owner_contact_name) {
        details.push(['Name provided before inviting', claim.owner_contact_name]);
    }

    details.push(
        ['Phone contact', claim.owner_contact_phone ?? 'Not provided'],
        ['Login identifier', claim.claimant_login_identifier]
    );

    if (claim.invited_email && claim.invited_email !== claim.claimant_login_identifier) {
        details.push(['Invitation email', claim.invited_email]);
    }

    details.push(
        ['Claim submitted', readableDate(claim.claimed_at)],
        ['Review deadline', readableDate(claim.review_expires_at)]
    );

    return details;
}

export function InstitutionAdminClaimReview({ institutionId, institutionName, review }: Props) {
    const {
        claims,
        error,
        isFetching,
        isLoading,
        isDeciding,
        recordingDecision,
        refetch,
        reviewClaim,
        reviewOpen,
        actionError,
        decisionNotice,
        closeReview,
        recordDecision,
    } = review;

    function decide(decision: InstitutionAdminInvitationDecision) {
        if (reviewClaim) {
            void recordDecision(reviewClaim, decision);
        }
    }

    return (
        <section aria-labelledby={`claim-review-title-${institutionId}`} className="space-y-3">
            <h3 id={`claim-review-title-${institutionId}`} className="sr-only">
                Claim Owner Review
            </h3>

            {isLoading && (
                <Flex
                    id={`claim-review-loading-${institutionId}`}
                    alignItems="center"
                    className="text-muted-foreground gap-2 text-sm"
                    role="status"
                    aria-live="polite"
                >
                    <Spinner aria-hidden="true" />
                    <Typography as="span" variant="muted">
                        Loading pending claim review…
                    </Typography>
                </Flex>
            )}

            {error && (
                <Alert variant="destructive" aria-live="assertive">
                    <AlertTitle>Claim queue unavailable</AlertTitle>
                    <AlertDescription className="gap-3">
                        <p>The Owner review queue could not be loaded.</p>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => void refetch()}
                            disabled={isFetching}
                        >
                            {isFetching ? <Spinner aria-label="Refreshing claim queue" /> : null}
                            Try again
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {decisionNotice && (
                <Alert aria-live="polite">
                    <AlertTitle>Decision outcome</AlertTitle>
                    <AlertDescription>{decisionNotice}</AlertDescription>
                </Alert>
            )}

            {!isLoading && !isFetching && !error && claims.length === 0 && (
                <Alert role="status" aria-live="polite">
                    <AlertTitle>Claim review queue may be out of date</AlertTitle>
                    <AlertDescription className="gap-3">
                        <p>
                            Invitation status shows a claim awaiting review, but it is not in this
                            queue yet.
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => void refetch()}
                            disabled={isFetching}
                        >
                            {isFetching ? (
                                <Spinner aria-label="Refreshing claim queue" />
                            ) : (
                                <Clock aria-hidden="true" />
                            )}
                            {isFetching ? 'Refreshing…' : 'Refresh claim queue'}
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {claims
                .filter((claim) => !claim.invited_email)
                .map((claim) => (
                    <Alert key={claim.id} role="status">
                        <AlertTitle>Legacy unbound claim cannot be approved</AlertTitle>
                        <AlertDescription>
                            This invitation has no fixed recipient email. It cannot grant access;
                            close it and issue a new addressed invitation instead.
                        </AlertDescription>
                    </Alert>
                ))}

            <Dialog open={reviewOpen} onOpenChange={closeReview}>
                <DialogContent className="max-h-[90dvh] gap-0 overflow-y-auto p-0 sm:max-w-xl">
                    {reviewClaim && (
                        <>
                            <DialogHeader className="border-b p-5 pr-12">
                                <Flex
                                    id={`owner-claim-dialog-header-${reviewClaim.id}`}
                                    alignItems="start"
                                    className="gap-3"
                                >
                                    <ShieldCheck
                                        aria-hidden="true"
                                        className="text-primary mt-0.5 size-5 shrink-0"
                                    />
                                    <div className="space-y-2">
                                        <DialogTitle>Owner Review: Claim Approval</DialogTitle>
                                        <DialogDescription>{institutionName}</DialogDescription>
                                    </div>
                                </Flex>
                            </DialogHeader>

                            <div className="space-y-4 p-5">
                                <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-800">
                                    <ShieldAlert
                                        aria-hidden="true"
                                        className="dark:text-amber-400"
                                    />
                                    <AlertTitle className="text-amber-800 dark:text-amber-300">
                                        Verify separately in person or through a previously known
                                        phone contact.
                                    </AlertTitle>
                                    <AlertDescription className="text-amber-800 dark:text-amber-300">
                                        Do not use the email address or invitation link to verify
                                        identity.
                                    </AlertDescription>
                                </Alert>

                                <Grid
                                    as="dl"
                                    id={`owner-claim-details-${reviewClaim.id}`}
                                    columns={1}
                                    className="gap-0 rounded-md border p-4"
                                >
                                    {claimDetails(reviewClaim).map(([label, value], index) => (
                                        <Flex
                                            as="div"
                                            id={`owner-claim-detail-${reviewClaim.id}-${index}`}
                                            key={label}
                                            alignItems="start"
                                            justifyContent="between"
                                            className="gap-4 border-b py-2 first:pt-0 last:border-b-0 last:pb-0"
                                        >
                                            <dt className="text-muted-foreground text-sm">
                                                {label}
                                            </dt>
                                            <dd className="min-w-0 text-right text-sm break-all">
                                                {value}
                                            </dd>
                                        </Flex>
                                    ))}
                                </Grid>

                                {actionError && (
                                    <Alert variant="destructive" aria-live="assertive">
                                        <AlertTitle>Decision not confirmed</AlertTitle>
                                        <AlertDescription>{actionError}</AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            <DialogFooter className="flex-col-reverse border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => decide('REJECT')}
                                    disabled={isDeciding}
                                >
                                    {recordingDecision === 'REJECT' ? (
                                        <>
                                            <Spinner aria-label="Recording rejection" />
                                            Rejecting…
                                        </>
                                    ) : (
                                        'Reject Claim'
                                    )}
                                </Button>
                                <Flex
                                    id={`owner-claim-dialog-actions-${reviewClaim.id}`}
                                    alignItems="center"
                                    justifyContent="end"
                                    className="gap-2"
                                >
                                    <DialogClose asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={isDeciding}
                                        >
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button
                                        type="button"
                                        onClick={() => decide('APPROVE')}
                                        disabled={isDeciding}
                                    >
                                        {recordingDecision === 'APPROVE' ? (
                                            <>
                                                <Spinner aria-label="Recording approval" />
                                                Approving…
                                            </>
                                        ) : (
                                            'Confirm & Approve'
                                        )}
                                    </Button>
                                </Flex>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
}
