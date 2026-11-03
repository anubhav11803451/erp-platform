import { Link } from 'react-router';
import { UserRound } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    EmptyState,
    LoadingState,
    PageHeading,
    RequestError,
} from '@/features/institution/shared/workspace-ui';
import { WorkspaceGate } from '@/components/shared/workspace-gate';
import { InviteStaffDialog } from './invite-staff-dialog';
import { TeamInvitationsDataTable, TeamMembersDataTable } from './team-data-tables';
import { useInstitutionTeam } from '@/hooks/institution/team/use-institution-team';

export function InstitutionTeamPage() {
    const {
        accessToken,
        groupsQuery,
        invitationsQuery,
        membersQuery,
        groups,
        invitations,
        members,
        isLoading,
        isError,
        dialogOpen,
        replacementInvitation: replaceInvitation,
        statusMessage,
        openInvite,
        closeDialog,
        setStatusMessage,
    } = useInstitutionTeam();
    const allGroups = groupsQuery.data?.groups ?? [];

    return (
        <WorkspaceGate allowedRoles={['INSTITUTION_ADMIN']}>
            <section className="space-y-6">
                <PageHeading
                    title="Team"
                    description="Staff can view and update students and attendance only in the groups assigned to them."
                    actions={
                        <Button
                            type="button"
                            onClick={() => openInvite()}
                            disabled={groupsQuery.isLoading || groups.length === 0}
                        >
                            <UserRound aria-hidden="true" />
                            Invite Staff
                        </Button>
                    }
                />
                {statusMessage && (
                    <p role="status" aria-live="polite" className="text-sm">
                        {statusMessage}
                    </p>
                )}
                <p className="text-muted-foreground text-sm">
                    Invitations are manually shared. No email is sent.
                </p>
                {isLoading && <LoadingState label="Loading Institution Team…" />}
                {groupsQuery.isError && (
                    <RequestError
                        error={groupsQuery.error}
                        title="Groups could not be loaded"
                        onRetry={() => void groupsQuery.refetch()}
                    />
                )}
                {invitationsQuery.isError && (
                    <RequestError
                        error={invitationsQuery.error}
                        title="Invitations could not be loaded"
                        onRetry={() => void invitationsQuery.refetch()}
                    />
                )}
                {membersQuery.isError && (
                    <RequestError
                        error={membersQuery.error}
                        title="Staff members could not be loaded"
                        onRetry={() => void membersQuery.refetch()}
                    />
                )}
                {!isLoading && !isError && groups.length === 0 && (
                    <Alert>
                        <AlertTitle>Set up a group before inviting Staff</AlertTitle>
                        <AlertDescription>
                            Staff receive access only to groups assigned by an Admin.
                            <Button asChild variant="outline" className="mt-2">
                                <Link to="/institution/groups">Create a group</Link>
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}
                <section aria-labelledby="team-members-title" className="space-y-3">
                    <h2 id="team-members-title" className="text-lg font-semibold">
                        Staff members
                    </h2>
                    {!isLoading && !isError && members.length === 0 && (
                        <EmptyState
                            title="No Staff members"
                            description="Accepted Staff invitations will appear here with their assigned groups."
                            action={
                                groups.length > 0 ? (
                                    <Button type="button" onClick={() => openInvite()}>
                                        Invite Staff
                                    </Button>
                                ) : undefined
                            }
                        />
                    )}
                    {members.length > 0 && (
                        <TeamMembersDataTable
                            members={members}
                            groups={groups}
                            onStatus={setStatusMessage}
                        />
                    )}
                </section>
                <section aria-labelledby="team-invitations-title" className="space-y-3">
                    <h2 id="team-invitations-title" className="text-lg font-semibold">
                        Staff invitations
                    </h2>
                    {!isLoading && !isError && invitations.length === 0 && (
                        <EmptyState
                            title="No Staff invitations"
                            description="Created invitations and their current status will appear here."
                        />
                    )}
                    {invitations.length > 0 && (
                        <TeamInvitationsDataTable
                            invitations={invitations}
                            groups={allGroups}
                            onReplace={openInvite}
                            onStatus={setStatusMessage}
                        />
                    )}
                </section>
                <InviteStaffDialog
                    key={replaceInvitation?.id ?? 'new'}
                    open={dialogOpen}
                    groups={groups}
                    replaceInvitation={replaceInvitation}
                    accessToken={accessToken}
                    onClose={closeDialog}
                />
            </section>
        </WorkspaceGate>
    );
}
