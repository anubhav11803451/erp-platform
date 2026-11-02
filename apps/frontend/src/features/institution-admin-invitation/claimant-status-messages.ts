import type { InstitutionAdminInvitationClaimantStatusResponse } from '@erp/shared';

export const claimantStatusMessages: Record<
    InstitutionAdminInvitationClaimantStatusResponse['status'],
    { title: string; description: string }
> = {
    PENDING_APPROVAL: {
        title: 'Claim submitted — awaiting Owner review',
        description:
            'Your claim does not create Institution membership or sign you in. The Platform Owner must review it.',
    },
    APPROVED: {
        title: 'Claim approved',
        description:
            'Approval does not sign you in. Use the same account to sign in separately and confirm Institution access.',
    },
    REJECTED: {
        title: 'Claim rejected',
        description:
            'No Institution access was granted. A new invitation is required; contact the Platform Owner.',
    },
    REVOKED: {
        title: 'Claim revoked',
        description:
            'No Institution access was granted. Contact the Platform Owner if you need a new invitation.',
    },
    EXPIRED: {
        title: 'Claim expired',
        description:
            'The service confirmed that this claim expired. No Institution access was granted.',
    },
};
