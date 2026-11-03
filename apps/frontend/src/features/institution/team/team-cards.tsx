import { Save, ShieldBan } from 'lucide-react';
import { institutionStaffGroupAssignmentUpdateRequestSchema } from '@erp/shared';
import type {
    InstitutionGroupResponse,
    InstitutionStaffInvitationResponse,
    InstitutionStaffMembershipResponse,
} from '@erp/shared';
import { SmartForm } from '@/components/smart-form';
import { CheckboxGroupField } from '@/features/institution/shared/checkbox-group-field';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils/formatters';
import {
    useInstitutionInvitationActions,
    useInstitutionTeamMemberActions,
} from '@/hooks/institution/team/use-institution-team-actions';

function InvitationStatus({ status }: { status: InstitutionStaffInvitationResponse['status'] }) {
    const label = status.charAt(0) + status.slice(1).toLowerCase();
    return <Badge variant={status === 'PENDING' ? 'secondary' : 'outline'}>{label}</Badge>;
}

export function TeamMemberCard({
    member,
    groups,
    onStatus,
    idScope = 'member',
}: {
    member: InstitutionStaffMembershipResponse;
    groups: InstitutionGroupResponse[];
    onStatus: (message: string) => void;
    idScope?: string;
}) {
    const {
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
    } = useInstitutionTeamMemberActions(member, groups, onStatus);
    const controlPrefix = `${idScope}-${member.account_id}`;
    const formId = `staff-groups-${controlPrefix}`;

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                        <CardTitle className="break-all">{member.email}</CardTitle>
                        <CardDescription>Institution Staff</CardDescription>
                    </div>
                    <Badge variant={isRevoked ? 'destructive' : 'secondary'}>
                        {isRevoked ? 'Revoked' : 'Active Staff'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <Alert id={`team-error-${controlPrefix}`} variant="destructive">
                        <AlertTitle>Team update failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {hasArchivedAssignments && (
                    <Alert>
                        <AlertTitle>Archived assignments need review</AlertTitle>
                        <AlertDescription>
                            Archived groups are not available for Staff access. Saving assignments
                            removes those inactive groups.
                        </AlertDescription>
                    </Alert>
                )}
                <p className="text-muted-foreground text-sm">
                    {names.join(', ') || 'No groups assigned'}
                </p>
                {!isRevoked && (
                    <SmartForm
                        key={`${member.account_id}-${memberGroupIdsKey}-${activeGroupIdsKey}`}
                        id={formId}
                        schema={institutionStaffGroupAssignmentUpdateRequestSchema}
                        defaultValues={{ group_ids: activeMemberGroupIds }}
                        onSubmit={saveAssignments}
                        noValidate
                        showSubmitButton={false}
                    >
                        {(form) => {
                            const groupIds = form.watch('group_ids');
                            const unchanged =
                                groupIds.length === activeMemberGroupIds.length &&
                                groupIds.every((id) => activeMemberGroupIds.includes(id)) &&
                                !hasArchivedAssignments;
                            return (
                                <>
                                    <CheckboxGroupField
                                        name="group_ids"
                                        idPrefix={`staff-${controlPrefix}`}
                                        label="Assigned groups"
                                        description="Changes apply to the next protected Staff request."
                                        options={activeGroups.map((group) => ({
                                            value: group.id,
                                            label: group.name,
                                        }))}
                                        emptyMessage="Create a group before assigning Staff."
                                        disabled={busy}
                                    />
                                    {groupIds.length === 0 && (
                                        <p className="text-muted-foreground text-sm">
                                            No groups assigned. This Staff member has no roster or
                                            attendance scope.
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="submit"
                                            form={formId}
                                            variant="outline"
                                            disabled={busy || unchanged}
                                        >
                                            <Save aria-hidden="true" />
                                            {updateState.isLoading ? 'Saving…' : 'Save assignments'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            disabled={busy}
                                            onClick={() => setConfirmOpen(true)}
                                        >
                                            <ShieldBan aria-hidden="true" />
                                            Revoke access
                                        </Button>
                                    </div>
                                </>
                            );
                        }}
                    </SmartForm>
                )}
                <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Revoke access for {member.email}?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This removes their access to all assigned groups. Subsequent
                                protected use will be denied. Revocation does not promise a forced
                                sign-out; restoring access requires a new invitation.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row">
                            <AlertDialogCancel disabled={revokeState.isLoading}>
                                Cancel
                            </AlertDialogCancel>
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={revokeState.isLoading}
                                onClick={() => void revoke()}
                            >
                                {revokeState.isLoading ? 'Revoking…' : 'Revoke access'}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}

export function InvitationCard({
    invitation,
    groups,
    onReplace,
    onStatus,
}: {
    invitation: InstitutionStaffInvitationResponse;
    groups: InstitutionGroupResponse[];
    onReplace: (invitation: InstitutionStaffInvitationResponse) => void;
    onStatus: (message: string) => void;
}) {
    const { names, revokeState, confirmOpen, setConfirmOpen, error, revoke } =
        useInstitutionInvitationActions(invitation, groups, onStatus);

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                        <CardTitle className="break-all">{invitation.invited_email}</CardTitle>
                        <CardDescription>
                            Expires {formatDate(new Date(invitation.expires_at), 'PPP p')}
                        </CardDescription>
                    </div>
                    <InvitationStatus status={invitation.status} />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-sm">
                    Selected groups: {names.length ? names.join(', ') : 'None'}
                </p>
                {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Invitation update failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {(invitation.status === 'PENDING' || invitation.status === 'EXPIRED') && (
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onReplace(invitation)}
                        >
                            {invitation.status === 'EXPIRED' ? 'Issue new link' : 'Replace link'}
                        </Button>
                        {invitation.status === 'PENDING' && (
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={revokeState.isLoading}
                                onClick={() => setConfirmOpen(true)}
                            >
                                <ShieldBan aria-hidden="true" />
                                Revoke invitation
                            </Button>
                        )}
                    </div>
                )}
                <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Revoke invitation for {invitation.invited_email}?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                The current one-time link will no longer be valid. This does not
                                grant Staff access.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row">
                            <AlertDialogCancel disabled={revokeState.isLoading}>
                                Cancel
                            </AlertDialogCancel>
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={revokeState.isLoading}
                                onClick={() => void revoke()}
                            >
                                {revokeState.isLoading ? 'Revoking…' : 'Revoke invitation'}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    );
}
