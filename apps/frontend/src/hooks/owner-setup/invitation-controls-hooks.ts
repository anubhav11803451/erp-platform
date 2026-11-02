import { useEffect, useState } from 'react';
import type {
    InstitutionAdminInvitationStatusResponse,
    LegalEntityDirectoryGroup,
} from '@erp/shared';
import { useAppSelector } from '@/app/hooks';
import { selectAccessToken } from '@/features/auth/auth-slice';
import {
    useGetFirstAdminInvitationStatusQuery,
    useRevokeFirstAdminInvitationMutation,
} from '@/features/owner/owner-invitation-api-slice';

type UseOwnerInvitationControlsProps = {
    institution: LegalEntityDirectoryGroup['institutions'][number];
    legalEntityCode: string | null;
};

function getErrorStatus(error: unknown): number | undefined {
    if (typeof error !== 'object' || error === null || !('status' in error)) {
        return undefined;
    }

    return typeof error.status === 'number' ? error.status : undefined;
}

export function useOwnerInvitationControls({
    institution,
    legalEntityCode,
}: UseOwnerInvitationControlsProps) {
    const institutionId = institution.id;
    const institutionName = institution.name;
    const accessToken = useAppSelector(selectAccessToken);
    const {
        data,
        error: statusError,
        isFetching,
        isLoading,
        refetch,
    } = useGetFirstAdminInvitationStatusQuery({ institutionId });
    const [revokeInvitation, { isLoading: isRevoking }] = useRevokeFirstAdminInvitationMutation();
    const [statusOverride, setStatusOverride] =
        useState<InstitutionAdminInvitationStatusResponse>();
    const [replacementTarget, setReplacementTarget] =
        useState<InstitutionAdminInvitationStatusResponse | null>(null);
    const [revokeOpen, setRevokeOpen] = useState(false);
    const [actionError, setActionError] = useState('');
    const [codeCopyMessage, setCodeCopyMessage] = useState('');
    const [codeCopyFailed, setCodeCopyFailed] = useState(false);

    useEffect(() => {
        setStatusOverride(undefined);
    }, [data]);

    const currentStatus = statusOverride ?? data;
    const state = currentStatus?.status;
    const notFound = getErrorStatus(statusError) === 404;
    const statusUnavailable = Boolean(statusError) && !notFound && !isLoading && !currentStatus;
    const canReplace =
        (!currentStatus?.invited_email && (state === 'PENDING' || state === 'PENDING_APPROVAL')) ||
        state === 'REJECTED' ||
        state === 'REVOKED' ||
        state === 'EXPIRED' ||
        state === 'LEGACY_ACCEPTED';
    const hasClaim = Boolean(currentStatus?.claimed_at);
    const panelTitle =
        state === 'PENDING_APPROVAL' ||
        state === 'APPROVED' ||
        state === 'REJECTED' ||
        (state === 'EXPIRED' && hasClaim)
            ? 'Claim Owner Review'
            : 'First Admin invitation';
    const codePrefix = legalEntityCode ? `${legalEntityCode}-` : '';
    const institutionCodeSuffix =
        institution.code && codePrefix && institution.code.startsWith(codePrefix)
            ? institution.code.slice(codePrefix.length)
            : (institution.code ?? 'Code unavailable');

    async function copyInstitutionCode() {
        if (!institution.code) {
            return;
        }
        try {
            await navigator.clipboard.writeText(institution.code);
            setCodeCopyFailed(false);
            setCodeCopyMessage('Institution code copied.');
        } catch {
            setCodeCopyFailed(true);
            setCodeCopyMessage('The Institution code could not be copied.');
        }
    }

    async function confirmRevocation() {
        if (!currentStatus) {
            return;
        }

        setActionError('');
        try {
            const updated = await revokeInvitation({
                institutionId,
                invitationId: currentStatus.id,
            }).unwrap();
            setStatusOverride(updated);
            setRevokeOpen(false);
            void refetch();
        } catch {
            setActionError(
                'The link could not be revoked. Refresh its status before taking another action.'
            );
            setRevokeOpen(false);
            void refetch();
        }
    }

    function handleReplacement(status: InstitutionAdminInvitationStatusResponse) {
        setStatusOverride(status);
        void refetch();
    }

    return {
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
    };
}
