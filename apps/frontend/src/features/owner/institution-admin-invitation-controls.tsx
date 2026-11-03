import type {
    InstitutionAdminInvitationStatusResponse,
    LegalEntityDirectoryGroup,
} from '@erp/shared';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Flex } from '@/components/ui/flex';
import { formatDate } from '@/lib/utils/formatters';
import { InstitutionAdminClaimReview } from './institution-admin-claim-review';
import { InstitutionAdminInvitationReplacement } from './institution-admin-invitation-replacement';
import {
    InstitutionAdminInvitationStatusCard,
    type InstitutionAdminInvitationDetail,
    type InstitutionAdminInvitationStatusAction,
} from './institution-admin-invitation-status-card';
import { useOwnerClaimReview } from '@/hooks/owner-setup/claim-review-hooks';
import { useOwnerInvitationControls } from '@/hooks/owner-setup/invitation-controls-hooks';

type Props = {
    institution: LegalEntityDirectoryGroup['institutions'][number];
    legalEntityCode: string | null;
};

function readableDate(value: string): string {
    return formatDate(new Date(value), 'PPP p');
}

function getInvitationSummary(
    status: InstitutionAdminInvitationStatusResponse,
    hasClaim: boolean
): string {
    if (status.status === 'PENDING') {
        return `Invitation sent · expires ${readableDate(status.expires_at)}`;
    }
    if (status.status === 'PENDING_APPROVAL') {
        return `Review pending claim · submitted ${readableDate(status.claimed_at ?? status.created_at)}`;
    }
    if (status.status === 'APPROVED') {
        return `Approved · decision recorded ${readableDate(status.decided_at ?? status.created_at)}`;
    }
    if (status.status === 'REJECTED') {
        return `Rejected · decision recorded ${readableDate(status.decided_at ?? status.created_at)}`;
    }
    if (status.status === 'REVOKED') {
        return `Revoked · issued ${readableDate(status.created_at)}`;
    }
    if (status.status === 'EXPIRED') {
        return `${hasClaim ? 'Claim review expired' : 'Invitation expired'} · ${readableDate(status.review_expires_at ?? status.expires_at)}`;
    }
    return 'Legacy unbound claim · it cannot be approved or used to grant access';
}

function getInvitationDetails(
    status: InstitutionAdminInvitationStatusResponse
): InstitutionAdminInvitationDetail[] {
    if (status.status === 'APPROVED') {
        return [
            {
                label: 'Login identifier',
                value: status.claimant_login_identifier ?? status.invited_email ?? 'Not available',
                monospace: true,
            },
            {
                label: 'Claimant-provided name',
                value: status.claimant_provided_name ?? 'Not available',
            },
            {
                label: 'Claim submitted',
                value: status.claimed_at ? readableDate(status.claimed_at) : 'Not available',
            },
            {
                label: 'Review deadline',
                value: status.review_expires_at
                    ? readableDate(status.review_expires_at)
                    : 'Not available',
            },
        ];
    }

    const details: InstitutionAdminInvitationDetail[] = [];
    if (status.invited_email) {
        details.push({ label: 'Invited email', value: status.invited_email, monospace: true });
    }
    if (status.owner_contact_name) {
        details.push({ label: 'Name provided before inviting', value: status.owner_contact_name });
    }
    if (status.owner_contact_phone) {
        details.push({ label: 'Phone contact', value: status.owner_contact_phone });
    }
    if (status.claimant_login_identifier) {
        details.push({
            label: 'Sign-in email (unverified)',
            value: status.claimant_login_identifier,
            monospace: true,
        });
    }
    if (status.claimant_provided_name) {
        details.push({
            label: 'Name entered when claiming (unverified)',
            value: status.claimant_provided_name,
        });
    }
    if (status.claimed_at) {
        details.push({ label: 'Claim submitted', value: readableDate(status.claimed_at) });
    }
    if (status.review_expires_at) {
        details.push({ label: 'Review deadline', value: readableDate(status.review_expires_at) });
    }
    return details;
}

function getInvitationFooterMessage(
    status: InstitutionAdminInvitationStatusResponse | undefined,
    hasClaim: boolean
): string | undefined {
    if (!status) return undefined;
    if (status.status === 'PENDING') {
        return 'No Institution membership or session is granted until the claim is approved.';
    }
    if (status.status === 'PENDING_APPROVAL') {
        return 'Verify separately in person or through a phone contact known before inviting; email and the invitation link are not proof.';
    }
    if (status.status === 'APPROVED') {
        return 'Approval grants membership but does not issue a session. The claimant must sign in separately.';
    }
    if (status.status === 'REJECTED') {
        return 'The rejected claim granted no Institution access.';
    }
    if (status.status === 'REVOKED') {
        return 'The invitation is revoked. No membership or session is created by revocation.';
    }
    if (status.status === 'EXPIRED') {
        return hasClaim
            ? 'The expired claim did not grant Institution access.'
            : 'The expired invitation did not grant Institution access.';
    }
    return 'This legacy unbound claim grants no new access.';
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
    const claimReview = useOwnerClaimReview({
        institutionId,
        enabled: state === 'PENDING_APPROVAL',
        onDecisionRecorded: () => void refetch(),
    });
    const details = currentStatus ? getInvitationDetails(currentStatus) : [];
    const summary = currentStatus ? getInvitationSummary(currentStatus, hasClaim) : undefined;
    const footerMessage = getInvitationFooterMessage(currentStatus, hasClaim);
    const pendingClaim = claimReview.claims.find((claim) => Boolean(claim.invited_email));
    const statusAction: InstitutionAdminInvitationStatusAction | undefined =
        state === 'PENDING_APPROVAL' && pendingClaim
            ? {
                  label: 'Review Pending Claim',
                  onClick: () => claimReview.openReview(pendingClaim),
                  disabled: claimReview.isDeciding,
              }
            : undefined;

    return (
        <>
            <InstitutionAdminInvitationStatusCard
                institutionId={institutionId}
                institutionName={institutionName}
                institutionCode={institution.code ?? institutionCodeSuffix}
                status={state}
                isLoading={isLoading}
                isFetching={isFetching}
                statusUnavailable={statusUnavailable}
                notFound={notFound}
                statusAction={statusAction}
                summary={summary}
                details={details}
                footerMessage={footerMessage}
                codeCopyMessage={codeCopyMessage}
                codeCopyFailed={codeCopyFailed}
                onCopyInstitutionCode={() => void copyInstitutionCode()}
                onRefresh={() => void refetch()}
            >
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
                        review={claimReview}
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
                ) : null}
                {currentStatus && state === 'LEGACY_ACCEPTED' && (
                    <Alert>
                        <AlertTitle>Legacy claim cannot be approved</AlertTitle>
                        <AlertDescription>
                            This unbound record grants no new access. Explicitly close it by issuing
                            a fresh invitation to a known recipient.
                        </AlertDescription>
                    </Alert>
                )}
                {currentStatus &&
                    state !== 'PENDING_APPROVAL' &&
                    (state === 'PENDING' || canReplace) && (
                        <Flex wrap className="gap-2">
                            {state === 'PENDING' && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setRevokeOpen(true)}
                                >
                                    Revoke invitation
                                </Button>
                            )}
                            {canReplace && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setReplacementTarget(currentStatus)}
                                >
                                    {!currentStatus.invited_email || state === 'LEGACY_ACCEPTED'
                                        ? 'Close legacy invitation and reissue'
                                        : 'Issue fresh invitation'}
                                </Button>
                            )}
                        </Flex>
                    )}
            </InstitutionAdminInvitationStatusCard>

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
        </>
    );
}
