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
    hasPendingClaim: boolean;
    onDecisionRecorded: () => void;
};

export function useOwnerClaimReview({
    institutionId,
    hasPendingClaim,
    onDecisionRecorded,
}: UseOwnerClaimReviewProps) {
    const { data, error, isFetching, isLoading, refetch } = useGetFirstAdminInvitationClaimsQuery({
        institutionId,
    });
    const [decideInvitation, { isLoading: isDeciding }] = useDecideFirstAdminInvitationMutation();
    const [pendingClaim, setPendingClaim] = useState<InstitutionAdminInvitationOwnerClaim | null>(
        null
    );
    const [pendingDecision, setPendingDecision] =
        useState<InstitutionAdminInvitationDecision | null>(null);
    const [actionError, setActionError] = useState('');
    const [decisionNotice, setDecisionNotice] = useState('');

    useEffect(() => {
        if (hasPendingClaim) {
            void refetch();
        }
    }, [hasPendingClaim, refetch]);

    function openDecision(
        claim: InstitutionAdminInvitationOwnerClaim,
        decision: InstitutionAdminInvitationDecision
    ) {
        setActionError('');
        setDecisionNotice('');
        setPendingClaim(claim);
        setPendingDecision(decision);
    }

    function closeDecision(open: boolean) {
        if (isDeciding || open) {
            return;
        }
        setPendingClaim(null);
        setPendingDecision(null);
    }

    async function confirmDecision() {
        if (!pendingClaim || !pendingDecision) {
            return;
        }

        setActionError('');
        try {
            const result = await decideInvitation({
                institutionId,
                invitationId: pendingClaim.id,
                decision: pendingDecision,
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
            setPendingClaim(null);
            setPendingDecision(null);
            onDecisionRecorded();
            void refetch();
        } catch {
            setActionError(
                'The decision could not be confirmed. Refresh the claim queue before trying again.'
            );
            setPendingClaim(null);
            setPendingDecision(null);
            void refetch();
        }
    }

    return {
        claims: data?.claims ?? [],
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
    };
}
