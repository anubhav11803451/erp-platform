import { useState } from 'react';
import type {
    InstitutionAdminInvitationIssueResponse,
    InstitutionAdminInvitationReissueRequest,
    InstitutionAdminInvitationStatusResponse,
} from '@erp/shared';
import { replaceOwnerInvitationOnce } from '@/features/owner/owner-invitation-api-slice';
import { useAppSelector } from '@/app/hooks';
import { selectCsrfToken } from '@/features/auth/auth-slice';

type UseOwnerInvitationReplacementProps = {
    institutionId: string;
    currentStatus: InstitutionAdminInvitationStatusResponse;
    accessToken: string | null;
    onReplaced: (status: InstitutionAdminInvitationStatusResponse) => void;
};

function statusFromIssue(
    invitation: InstitutionAdminInvitationIssueResponse,
    recipient: InstitutionAdminInvitationReissueRequest
): InstitutionAdminInvitationStatusResponse {
    return {
        id: invitation.id,
        status: invitation.status,
        created_at: invitation.created_at,
        expires_at: invitation.expires_at,
        invited_email: invitation.invited_email,
        owner_contact_name: recipient.contact_name ?? null,
        owner_contact_phone: recipient.contact_phone ?? null,
        accepted_at: null,
        revoked_at: null,
        claimed_at: null,
        claimed_by_account_id: null,
        claimant_login_identifier: null,
        claimant_provided_name: null,
        review_expires_at: null,
        decided_at: null,
        decided_by_account_id: null,
    };
}

export function useOwnerInvitationReplacement({
    institutionId,
    currentStatus,
    accessToken,
    onReplaced,
}: UseOwnerInvitationReplacementProps) {
    const csrfToken = useAppSelector(selectCsrfToken);
    const [oneTimeLink, setOneTimeLink] = useState<string | null>(null);
    const [copyMessage, setCopyMessage] = useState('');
    const [actionError, setActionError] = useState('');
    const [isReplacing, setIsReplacing] = useState(false);

    async function replaceInvitation(recipient: InstitutionAdminInvitationReissueRequest) {
        setActionError('');
        setIsReplacing(true);
        try {
            const replacement = await replaceOwnerInvitationOnce(
                institutionId,
                currentStatus.id,
                recipient,
                accessToken,
                csrfToken
            );
            onReplaced(statusFromIssue(replacement, recipient));
            setOneTimeLink(replacement.one_time_invitation_url);
            setCopyMessage('The one-time link is ready. Copy it now; it cannot be shown again.');
        } catch (error: unknown) {
            setActionError(
                error instanceof Error
                    ? error.message
                    : 'The replacement was not confirmed. Refresh status before another attempt.'
            );
        } finally {
            setIsReplacing(false);
        }
    }

    async function copyInvitationLink() {
        if (!oneTimeLink) {
            return;
        }
        try {
            await navigator.clipboard.writeText(oneTimeLink);
            setCopyMessage('Invitation link copied. Share it only with the intended invitee.');
        } catch {
            setCopyMessage('Copy was unavailable. Select the link field and copy it manually.');
        }
    }

    function clearReplacementState() {
        setOneTimeLink(null);
        setCopyMessage('');
        setActionError('');
    }

    return {
        oneTimeLink,
        copyMessage,
        actionError,
        isReplacing,
        setActionError,
        replaceInvitation,
        copyInvitationLink,
        clearReplacementState,
    };
}
