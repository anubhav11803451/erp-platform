import { Building2, Copy, RefreshCw } from 'lucide-react';
import type {
    InstitutionAdminInvitationStatusResponse,
    LegalEntityDirectoryGroup,
} from '@erp/shared';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { formatDate } from '@/lib/utils/formatters';
import { InstitutionAdminClaimReview } from './institution-admin-claim-review';
import { InstitutionAdminInvitationReplacement } from './institution-admin-invitation-replacement';
import { useOwnerInvitationControls } from '@/hooks/owner-setup/invitation-controls-hooks';

type Props = {
    institution: LegalEntityDirectoryGroup['institutions'][number];
    legalEntityCode: string | null;
};

function readableDate(value: string): string {
    return formatDate(new Date(value), 'PPP p');
}

function invitationStatusLabel(
    status: InstitutionAdminInvitationStatusResponse['status'] | undefined,
    isLoading: boolean,
    statusUnavailable: boolean,
    notFound: boolean
): string {
    if (status === 'PENDING') return 'Claim Invited';
    if (status === 'PENDING_APPROVAL') return 'Review Pending Claim';
    if (status === 'APPROVED') return 'Approved';
    if (status === 'REJECTED') return 'Rejected';
    if (status === 'REVOKED') return 'Revoked';
    if (status === 'EXPIRED') return 'Expired';
    if (status === 'LEGACY_ACCEPTED') return 'Legacy Claim';
    if (isLoading) return 'Loading status';
    if (statusUnavailable) return 'Status unavailable';
    if (notFound) return 'Invitation not found';
    return 'Status unknown';
}

function invitationStatusTone(
    status: InstitutionAdminInvitationStatusResponse['status'] | undefined
) {
    if (status === 'APPROVED') {
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    }
    if (status === 'PENDING_APPROVAL') {
        return 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400';
    }
    if (status === 'REJECTED') {
        return 'border-destructive/30 bg-destructive/10 text-destructive';
    }
    return 'text-muted-foreground';
}

export function InstitutionAdminInvitationControls({ institution, legalEntityCode }: Props) {
    const {
        institutionId,
        institutionName,
        accessToken,
        isFetching,
        isLoading,
        isRevoking,
        refetch,
        currentStatus,
        state,
        notFound,
        statusUnavailable,
        canReplace,
        hasClaim,
        panelTitle,
        institutionCodeSuffix,
        replacementTarget,
        setReplacementTarget,
        revokeOpen,
        setRevokeOpen,
        actionError,
        codeCopyMessage,
        codeCopyFailed,
        copyInstitutionCode,
        confirmRevocation,
        handleReplacement,
    } = useOwnerInvitationControls({ institution, legalEntityCode });
    const statusLabel = invitationStatusLabel(state, isLoading, statusUnavailable, notFound);

    return (
        <article className="bg-card space-y-3 rounded-lg border p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-md">
                        <Building2 aria-hidden="true" className="text-muted-foreground size-5" />
                    </span>
                    <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold wrap-break-word">{institutionName}</h3>
                            <Badge variant="outline" className="font-mono">
                                {institutionCodeSuffix}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">Role: Institution Admin</p>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                    <Badge
                        variant="outline"
                        className={invitationStatusTone(state)}
                        role="status"
                        aria-live="polite"
                    >
                        {statusLabel}
                    </Badge>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-11"
                        aria-label={
                            institution.code
                                ? `Copy Institution code ${institution.code}`
                                : 'Institution code unavailable to copy'
                        }
                        onClick={() => void copyInstitutionCode()}
                        disabled={!institution.code}
                    >
                        <Copy aria-hidden="true" />
                    </Button>
                </div>
            </div>

            {codeCopyMessage && (
                <p
                    role={codeCopyFailed ? 'alert' : 'status'}
                    aria-live={codeCopyFailed ? 'assertive' : 'polite'}
                    className={
                        codeCopyFailed
                            ? 'text-destructive text-sm'
                            : 'text-muted-foreground text-sm'
                    }
                >
                    {codeCopyMessage}
                </p>
            )}

            <div className="bg-background/60 space-y-3 rounded-md border p-3 sm:p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-1">
                        <h4 className="font-medium">{panelTitle}</h4>
                        {isLoading ? (
                            <Skeleton className="h-4 w-56" />
                        ) : currentStatus ? (
                            <p className="text-muted-foreground text-sm" role="status">
                                {state === 'PENDING' &&
                                    `Invitation sent · expires ${readableDate(currentStatus.expires_at)}`}
                                {state === 'PENDING_APPROVAL' &&
                                    `Review pending claim · submitted ${readableDate(currentStatus.claimed_at ?? currentStatus.created_at)}`}
                                {state === 'EXPIRED' &&
                                    `${hasClaim ? 'Claim review expired' : 'Invitation expired'} · ${readableDate(currentStatus.review_expires_at ?? currentStatus.expires_at)}`}
                                {state === 'REVOKED' &&
                                    `Revoked · issued ${readableDate(currentStatus.created_at)}`}
                                {state === 'APPROVED' &&
                                    `Approved · decision recorded ${readableDate(currentStatus.decided_at ?? currentStatus.created_at)}`}
                                {state === 'REJECTED' &&
                                    `Rejected · decision recorded ${readableDate(currentStatus.decided_at ?? currentStatus.created_at)}`}
                                {state === 'LEGACY_ACCEPTED' &&
                                    'Legacy unbound claim · it cannot be approved or used to grant access'}
                            </p>
                        ) : isFetching && !notFound ? (
                            <span role="status" className="text-muted-foreground text-sm">
                                <Spinner aria-label="Loading invitation status" /> Checking status…
                            </span>
                        ) : null}
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        className="min-h-11 shrink-0 self-start"
                        onClick={() => void refetch()}
                        disabled={isFetching}
                    >
                        <RefreshCw aria-hidden="true" />
                        {isFetching ? 'Refreshing…' : 'Refresh status'}
                    </Button>
                </div>

                {actionError && (
                    <Alert variant="destructive" aria-live="assertive">
                        <AlertTitle>Invitation action not confirmed</AlertTitle>
                        <AlertDescription>{actionError}</AlertDescription>
                    </Alert>
                )}

                {state === 'PENDING_APPROVAL' && (
                    <InstitutionAdminClaimReview
                        institutionId={institutionId}
                        institutionName={institutionName}
                        hasPendingClaim
                        onDecisionRecorded={() => void refetch()}
                    />
                )}

                {statusUnavailable ? (
                    <Alert variant="destructive">
                        <AlertTitle>Invitation status unavailable</AlertTitle>
                        <AlertDescription>
                            Refresh before taking another invitation action.
                        </AlertDescription>
                    </Alert>
                ) : notFound && !isLoading ? (
                    <Alert role="status">
                        <AlertTitle>Invitation status not found</AlertTitle>
                        <AlertDescription>
                            Initial invitations are issued atomically when an Institution is
                            created. No separate invitation can be issued here.
                        </AlertDescription>
                    </Alert>
                ) : currentStatus && state !== 'PENDING_APPROVAL' ? (
                    <div className="space-y-3">
                        {(currentStatus.invited_email ||
                            currentStatus.claimed_at ||
                            currentStatus.owner_contact_name ||
                            currentStatus.owner_contact_phone) && (
                            <dl className="grid gap-3 text-sm sm:grid-cols-2">
                                {state !== 'APPROVED' && currentStatus.invited_email && (
                                    <div className="min-w-0">
                                        <dt className="font-medium">Invited email</dt>
                                        <dd className="mt-1 break-all">
                                            {currentStatus.invited_email}
                                        </dd>
                                    </div>
                                )}
                                {state !== 'APPROVED' && currentStatus.owner_contact_name && (
                                    <div>
                                        <dt className="font-medium">
                                            Name you provided before inviting
                                        </dt>
                                        <dd className="mt-1">{currentStatus.owner_contact_name}</dd>
                                    </div>
                                )}
                                {state !== 'APPROVED' && currentStatus.owner_contact_phone && (
                                    <div>
                                        <dt className="font-medium">
                                            Phone number you had before inviting
                                        </dt>
                                        <dd className="mt-1">
                                            {currentStatus.owner_contact_phone}
                                        </dd>
                                    </div>
                                )}
                                {currentStatus.claimant_login_identifier && (
                                    <div className="min-w-0">
                                        <dt className="font-medium">
                                            Sign-in email
                                            {state === 'APPROVED' ? '' : ' (unverified)'}
                                        </dt>
                                        <dd className="mt-1 break-all">
                                            {currentStatus.claimant_login_identifier}
                                        </dd>
                                    </div>
                                )}
                                {currentStatus.claimant_provided_name && (
                                    <div className="min-w-0">
                                        <dt className="font-medium">
                                            Name they entered when claiming
                                            {state === 'APPROVED' ? '' : ' (unverified)'}
                                        </dt>
                                        <dd className="mt-1 break-words">
                                            {currentStatus.claimant_provided_name}
                                        </dd>
                                    </div>
                                )}
                                {currentStatus.claimed_at && (
                                    <div>
                                        <dt className="font-medium">Claim submitted</dt>
                                        <dd className="mt-1">
                                            {readableDate(currentStatus.claimed_at)}
                                        </dd>
                                    </div>
                                )}
                                {currentStatus.review_expires_at && (
                                    <div>
                                        <dt className="font-medium">Review deadline</dt>
                                        <dd className="mt-1">
                                            {readableDate(currentStatus.review_expires_at)}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        )}
                        {state === 'APPROVED' && (
                            <p className="text-muted-foreground text-sm">
                                Approval grants membership but does not issue a session. The
                                claimant must sign in separately.
                            </p>
                        )}
                        {state === 'LEGACY_ACCEPTED' && (
                            <Alert>
                                <AlertTitle>Legacy claim cannot be approved</AlertTitle>
                                <AlertDescription>
                                    This unbound record grants no new access. Explicitly close it by
                                    issuing a fresh invitation to a known recipient.
                                </AlertDescription>
                            </Alert>
                        )}
                        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                            {state === 'PENDING' && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="min-h-11"
                                    onClick={() => setRevokeOpen(true)}
                                >
                                    Revoke invitation
                                </Button>
                            )}
                            {canReplace && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="min-h-11"
                                    onClick={() => setReplacementTarget(currentStatus)}
                                >
                                    {!currentStatus.invited_email || state === 'LEGACY_ACCEPTED'
                                        ? 'Close legacy invitation and reissue'
                                        : 'Issue fresh invitation'}
                                </Button>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>

            {replacementTarget && (
                <InstitutionAdminInvitationReplacement
                    institutionId={institutionId}
                    institutionName={institutionName}
                    currentStatus={replacementTarget}
                    accessToken={accessToken}
                    open
                    onOpenChange={(open) => {
                        if (!open) {
                            setReplacementTarget(null);
                        }
                    }}
                    onReplaced={handleReplacement}
                />
            )}

            <ConfirmDialog
                isOpen={revokeOpen}
                onOpenChange={setRevokeOpen}
                onConfirm={() => void confirmRevocation()}
                isLoading={isRevoking}
                title="Revoke this invitation?"
                description="The invitation link will no longer be usable. No membership or session is created by revocation."
                confirmLabel={isRevoking ? 'Revoking…' : 'Revoke invitation'}
            />
        </article>
    );
}
