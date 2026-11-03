import { useState } from 'react';
import {
    institutionStaffGroupAssignmentUpdateRequestSchema,
    type InstitutionGroupResponse,
    type InstitutionStaffInvitationResponse,
    type InstitutionStaffMembershipResponse,
} from '@erp/shared';
import { toast } from 'sonner';
import {
    useRevokeInstitutionStaffInvitationMutation,
    useRevokeInstitutionStaffMemberMutation,
    useUpdateInstitutionStaffGroupsMutation,
} from '@/features/institution/team/team-api-slice';

type StatusHandler = (message: string) => void;

function getGroupNames(groupIds: string[], groups: InstitutionGroupResponse[]): string[] {
    return groupIds.map((id) => groups.find((group) => group.id === id)?.name ?? 'Archived group');
}

export function useInstitutionTeamMemberActions(
    member: InstitutionStaffMembershipResponse,
    groups: InstitutionGroupResponse[],
    onStatus: StatusHandler
) {
    const [updateGroups, updateState] = useUpdateInstitutionStaffGroupsMutation();
    const [revokeMember, revokeState] = useRevokeInstitutionStaffMemberMutation();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const activeGroups = groups.filter((group) => !group.archived_at);
    const activeGroupIdsKey = activeGroups
        .map((group) => group.id)
        .sort()
        .join(',');
    const memberGroupIdsKey = member.group_ids.join(',');
    const activeGroupIdSet = new Set(activeGroupIdsKey ? activeGroupIdsKey.split(',') : []);
    const hasArchivedAssignments = member.group_ids.some((id) => !activeGroupIdSet.has(id));
    const activeMemberGroupIds = member.group_ids.filter((id) => activeGroupIdSet.has(id));
    const names = getGroupNames(member.group_ids, groups);
    const isRevoked = Boolean(member.revoked_at);
    const busy = updateState.isLoading || revokeState.isLoading;

    async function saveAssignments(values: { group_ids: string[] }) {
        setError(null);
        onStatus('');
        const parsed = institutionStaffGroupAssignmentUpdateRequestSchema.safeParse(values);
        if (!parsed.success) {
            setError('Assignments could not be validated. Refresh Team and try again.');
            return;
        }
        try {
            await updateGroups({
                accountId: member.account_id,
                groupIds: parsed.data.group_ids,
            }).unwrap();
            onStatus('Staff group assignments saved.');
            toast.success('Staff group assignments saved.');
        } catch {
            setError('Assignments could not be saved. Refresh Team and try again.');
        }
    }

    async function revoke() {
        setError(null);
        onStatus('');
        try {
            await revokeMember({ accountId: member.account_id }).unwrap();
            setConfirmOpen(false);
            onStatus('Staff access revoked.');
            toast.success('Staff access revoked.');
        } catch {
            setConfirmOpen(false);
            setError('Access could not be revoked. Refresh Team and try again.');
        }
    }

    return {
        activeGroups,
        activeGroupIdsKey,
        activeMemberGroupIds,
        memberGroupIdsKey,
        hasArchivedAssignments,
        names,
        isRevoked,
        busy,
        updateState,
        revokeState,
        confirmOpen,
        setConfirmOpen,
        error,
        saveAssignments,
        revoke,
    };
}

export function useInstitutionInvitationActions(
    invitation: InstitutionStaffInvitationResponse,
    groups: InstitutionGroupResponse[],
    onStatus: StatusHandler
) {
    const [revokeInvitation, revokeState] = useRevokeInstitutionStaffInvitationMutation();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const names = getGroupNames(invitation.group_ids, groups);

    async function revoke() {
        setError(null);
        onStatus('');
        try {
            await revokeInvitation({ invitationId: invitation.id }).unwrap();
            setConfirmOpen(false);
            onStatus('Invitation revoked.');
            toast.success('Invitation revoked.');
        } catch {
            setConfirmOpen(false);
            setError('Invitation could not be revoked. Refresh Team and try again.');
        }
    }

    return { names, revokeState, confirmOpen, setConfirmOpen, error, revoke };
}
