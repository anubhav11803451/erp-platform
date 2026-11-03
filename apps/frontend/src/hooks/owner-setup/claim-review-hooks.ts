import { useEffect, useState } from 'react';
import type {
    InstitutionAdminInvitationDecision,
    InstitutionAdminInvitationOwnerClaim,
} from '@erp/shared';
import {
    useDecideFirstAdminInvitationMutation,
    useGetFirstAdminInvitationClaimsQuery,
} from '@/features/owner/owner-invitation-api-slice';

type UseOwnerClaimReviewProps = {
    institutionId: string;
    enabled: boolean;
    onDecisionRecorded: () => void;
};

export function useOwnerClaimReview({
    institutionId,
    enabled,
    onDecisionRecorded,
}: UseOwnerClaimReviewProps) {
    const { data, error, isFetching, isLoading, refetch } = useGetFirstAdminInvitationClaimsQuery(
        { institutionId },
        { skip: !enabled }
    );
    const [decideInvitation, { isLoading: isDeciding }] = useDecideFirstAdminInvitationMutation();
    const [reviewClaimId, setReviewClaimId] = useState<string | null>(null);
    const [recordingDecision, setRecordingDecision] =
        useState<InstitutionAdminInvitationDecision | null>(null);
    const [actionError, setActionError] = useState('');
    const [decisionNotice, setDecisionNotice] = useState('');
    const claims = data?.claims ?? [];
    const reviewClaim = claims.find((claim) => claim.id === reviewClaimId) ?? null;

    useEffect(() => {
        if (!enabled) {
            setReviewClaimId(null);
        }
    }, [enabled]);

    function openReview(claim: InstitutionAdminInvitationOwnerClaim) {
        setActionError('');
        setDecisionNotice('');
        setReviewClaimId(claim.id);
    }

    function closeReview(open: boolean) {
        if (isDeciding || open) {
            return;
        }
        setReviewClaimId(null);
    }

    async function recordDecision(
        claim: InstitutionAdminInvitationOwnerClaim,
        decision: InstitutionAdminInvitationDecision
    ) {
        setActionError('');
        setRecordingDecision(decision);
        try {
            const result = await decideInvitation({
                institutionId,
                invitationId: claim.id,
                decision,
            }).unwrap();
            if (result.status === 'EXPIRED') {
                setDecisionNotice(
                    'The claim expired before this decision could be applied. No Institution access was granted.'
                );
            } else {
                setDecisionNotice(
                    `${result.status.charAt(0)}${result.status.slice(1).toLowerCase()} recorded. ${
                        result.status === 'APPROVED'
                            ? 'The claimant must sign in separately; no session was issued.'
                            : 'No Institution access was granted.'
                    }`
                );
            }
            setReviewClaimId(null);
            onDecisionRecorded();
            void refetch();
            return true;
        } catch {
            setActionError(
                'The decision could not be confirmed. Refresh the claim queue before trying again.'
            );
            void refetch();
            return false;
        } finally {
            setRecordingDecision(null);
        }
    }

    return {
        claims,
        error,
        isFetching,
        isLoading,
        isDeciding,
        recordingDecision,
        refetch,
        reviewClaim,
        reviewOpen: Boolean(reviewClaim),
        actionError,
        decisionNotice,
        openReview,
        closeReview,
        recordDecision,
    };
}

export type OwnerClaimReviewState = ReturnType<typeof useOwnerClaimReview>;
