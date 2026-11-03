import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectAccessToken } from '@/features/auth/auth-slice';
import { useGetInstitutionGroupsQuery } from '@/features/institution/groups/groups-api-slice';
import {
    useGetInstitutionStaffInvitationsQuery,
    useGetInstitutionStaffMembersQuery,
} from '@/features/institution/team/team-api-slice';
import type { InstitutionStaffInvitationResponse } from '@erp/shared';
import {
    closeTeamInvitationDialog,
    openTeamInvitationDialog,
    selectTeamUi,
    setTeamStatusMessage,
} from '@/features/institution/team/team-ui-slice';

export function useInstitutionTeam() {
    const dispatch = useAppDispatch();
    const accessToken = useAppSelector(selectAccessToken);
    const ui = useAppSelector(selectTeamUi);
    const groupsQuery = useGetInstitutionGroupsQuery();
    const invitationsQuery = useGetInstitutionStaffInvitationsQuery();
    const membersQuery = useGetInstitutionStaffMembersQuery();
    const groups = groupsQuery.data?.groups.filter((group) => !group.archived_at) ?? [];
    const invitations = invitationsQuery.data?.invitations ?? [];
    const members = membersQuery.data?.staff ?? [];
    const replaceInvitation =
        invitations.find((invitation) => invitation.id === ui.replacementInvitationId) ?? null;
    const isLoading = groupsQuery.isLoading || invitationsQuery.isLoading || membersQuery.isLoading;
    const isError = groupsQuery.isError || invitationsQuery.isError || membersQuery.isError;

    function openInvite(invitation: InstitutionStaffInvitationResponse | null = null) {
        dispatch(openTeamInvitationDialog(invitation?.id ?? null));
    }

    function closeDialog() {
        dispatch(closeTeamInvitationDialog());
    }

    function setStatusMessage(message: string) {
        dispatch(setTeamStatusMessage(message));
    }

    return {
        accessToken,
        groupsQuery,
        invitationsQuery,
        membersQuery,
        groups,
        invitations,
        members,
        isLoading,
        isError,
        dialogOpen: ui.dialogOpen,
        replacementInvitation: replaceInvitation,
        statusMessage: ui.statusMessage,
        openInvite,
        closeDialog,
        setStatusMessage,
    };
}
