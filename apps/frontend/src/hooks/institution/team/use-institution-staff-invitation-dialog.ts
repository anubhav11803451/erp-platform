import { useMemo, useState } from 'react';
import {
    type InstitutionGroupResponse,
    type InstitutionStaffInvitationCreateRequest,
    type InstitutionStaffInvitationIssueResponse,
    type InstitutionStaffInvitationResponse,
} from '@erp/shared';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { apiSlice } from '@/api/api-slice';
import { selectCsrfToken } from '@/features/auth/auth-slice';
import {
    issueStaffInvitationOnce,
    StaffInvitationIssueError,
} from '@/features/institution/team/staff-invitation-client';

export function useInstitutionStaffInvitationDialog({
    groups,
    replaceInvitation,
    accessToken,
    onClose,
}: {
    groups: InstitutionGroupResponse[];
    replaceInvitation: InstitutionStaffInvitationResponse | null;
    accessToken: string | null;
    onClose: () => void;
}) {
    const dispatch = useAppDispatch();
    const csrfToken = useAppSelector(selectCsrfToken);
    const [error, setError] = useState<string | null>(null);
    const [created, setCreated] = useState<InstitutionStaffInvitationIssueResponse | null>(null);
    const [copyMessage, setCopyMessage] = useState('');
    const [busy, setBusy] = useState(false);
    const [formVersion, setFormVersion] = useState(0);
    const activeGroups = useMemo(() => groups.filter((group) => !group.archived_at), [groups]);
    const activeGroupIdsKey = activeGroups
        .map((group) => group.id)
        .sort()
        .join(',');
    const activeGroupIdSet = useMemo(
        () => new Set(activeGroupIdsKey ? activeGroupIdsKey.split(',') : []),
        [activeGroupIdsKey]
    );
    const replaceGroupIdsKey = replaceInvitation?.group_ids.join(',') ?? '';
    const archivedSelection = Boolean(
        replaceInvitation?.group_ids.some((id) => !activeGroupIdSet.has(id))
    );
    const defaultValues = useMemo(() => {
        const previousGroupIds = new Set(replaceGroupIdsKey ? replaceGroupIdsKey.split(',') : []);
        return {
            invited_email: replaceInvitation?.invited_email ?? '',
            group_ids: activeGroupIdsKey
                ? activeGroupIdsKey.split(',').filter((id) => previousGroupIds.has(id))
                : [],
        };
    }, [activeGroupIdsKey, replaceGroupIdsKey, replaceInvitation?.invited_email]);

    async function submit(values: InstitutionStaffInvitationCreateRequest) {
        setError(null);
        const selectedActiveGroupIds = values.group_ids.filter((id) => activeGroupIdSet.has(id));
        if (selectedActiveGroupIds.length === 0) {
            setError('Enter a valid email address and assign at least one active group.');
            return;
        }
        setBusy(true);
        try {
            const result = await issueStaffInvitationOnce(
                {
                    ...values,
                    group_ids: selectedActiveGroupIds,
                    ...(replaceInvitation ? { replaceInvitationId: replaceInvitation.id } : {}),
                },
                accessToken,
                csrfToken
            );
            setCreated(result);
            dispatch(apiSlice.util.invalidateTags(['InstitutionTeam']));
            setCopyMessage('');
        } catch (issueError: unknown) {
            setError(
                issueError instanceof StaffInvitationIssueError && issueError.status === 409
                    ? 'This person may already have active Staff access, or the invitation could not be issued because its state changed. Refresh Team. If they are listed as active Staff, update their group assignments instead of issuing a new invitation; otherwise retry with active groups.'
                    : issueError instanceof Error
                      ? issueError.message
                      : 'The invitation could not be confirmed. Refresh Team before retrying.'
            );
        } finally {
            setBusy(false);
        }
    }

    async function copyLink() {
        if (!created) {
            return;
        }
        try {
            await navigator.clipboard.writeText(created.invitation_url);
            setCopyMessage('Invitation link copied. Share it manually with the intended person.');
        } catch {
            setCopyMessage('Copy was unavailable. Select the link above and copy it manually.');
        }
    }

    function close() {
        setCreated(null);
        setCopyMessage('');
        setError(null);
        setFormVersion((current) => current + 1);
        onClose();
    }

    return {
        error,
        created,
        copyMessage,
        busy,
        formVersion,
        activeGroups,
        archivedSelection,
        defaultValues,
        submit,
        copyLink,
        close,
    };
}
