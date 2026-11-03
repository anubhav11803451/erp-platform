import { Check, Copy, MailPlus } from 'lucide-react';
import {
    institutionStaffInvitationCreateRequestSchema,
    type InstitutionGroupResponse,
    type InstitutionStaffInvitationResponse,
} from '@erp/shared';
import { SmartForm } from '@/components/smart-form';
import { TextField } from '@/components/smart-form/form-fields';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDate } from '@/lib/utils/formatters';
import { CheckboxGroupField } from '@/features/institution/shared/checkbox-group-field';
import { useInstitutionStaffInvitationDialog } from '@/hooks/institution/team/use-institution-staff-invitation-dialog';

export function InviteStaffDialog({
    open,
    groups,
    replaceInvitation,
    accessToken,
    onClose,
}: {
    open: boolean;
    groups: InstitutionGroupResponse[];
    replaceInvitation: InstitutionStaffInvitationResponse | null;
    accessToken: string | null;
    onClose: () => void;
}) {
    const {
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
    } = useInstitutionStaffInvitationDialog({
        groups,
        replaceInvitation,
        accessToken,
        onClose,
    });

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen && !busy) {
                    close();
                }
            }}
        >
            <DialogContent className="max-h-[90dvh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {created
                            ? 'Staff invitation link'
                            : replaceInvitation
                              ? 'Replace Staff invitation'
                              : 'Invite Staff'}
                    </DialogTitle>
                    <DialogDescription>
                        {created
                            ? 'This one-time URL is shown only in this result. No email is sent.'
                            : 'Choose the groups this person will be able to access after they accept.'}
                    </DialogDescription>
                </DialogHeader>
                {created ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="staff-invitation-url">One-time invitation URL</Label>
                            <Input
                                id="staff-invitation-url"
                                value={created.invitation_url}
                                readOnly
                                className="font-mono text-xs"
                                onFocus={(event) => event.currentTarget.select()}
                            />
                            <p className="text-muted-foreground text-sm">
                                Share this link manually with {created.invited_email}. It expires{' '}
                                {formatDate(new Date(created.expires_at), 'PPP p')}. No email is
                                sent.
                            </p>
                        </div>
                        <p role="status" aria-live="polite" className="text-sm">
                            {copyMessage || 'Invitation link is ready to copy and share manually.'}
                        </p>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => void copyLink()}>
                                {copyMessage.startsWith('Invitation link copied') ? (
                                    <Check aria-hidden="true" />
                                ) : (
                                    <Copy aria-hidden="true" />
                                )}
                                Copy invitation link
                            </Button>
                            <Button type="button" onClick={close}>
                                Done
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <SmartForm
                        key={`${replaceInvitation?.id ?? 'new'}-${formVersion}`}
                        id="staff-invite-form"
                        schema={institutionStaffInvitationCreateRequestSchema}
                        defaultValues={defaultValues}
                        onSubmit={submit}
                        enableReinitialize
                        noValidate
                        showSubmitButton={false}
                    >
                        {() => (
                            <>
                                <TextField
                                    name="invited_email"
                                    idPrefix="staff-invite"
                                    label="Invitee email"
                                    type="email"
                                    autoComplete="email"
                                    description="The invitation is bound to this email address and expires after seven days."
                                    required
                                    disabled={busy || Boolean(replaceInvitation)}
                                />
                                {archivedSelection && (
                                    <p className="text-muted-foreground text-sm">
                                        Archived groups were removed from the invitation. Select one
                                        or more active groups before issuing the replacement link.
                                    </p>
                                )}
                                <CheckboxGroupField
                                    name="group_ids"
                                    idPrefix="staff-invite-group"
                                    label="Assign groups"
                                    description="Staff can view and update students and attendance only in the groups assigned to them."
                                    options={activeGroups.map((group) => ({
                                        value: group.id,
                                        label: group.name,
                                    }))}
                                    emptyMessage="Create an active group before inviting Staff."
                                    disabled={busy}
                                />
                                {error && (
                                    <Alert variant="destructive" aria-live="assertive">
                                        <AlertTitle>
                                            {replaceInvitation
                                                ? 'Invitation could not be replaced'
                                                : 'Invitation could not be created'}
                                        </AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={busy}
                                        onClick={close}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        form="staff-invite-form"
                                        disabled={busy || activeGroups.length === 0}
                                        aria-busy={busy}
                                    >
                                        <MailPlus aria-hidden="true" />
                                        {busy
                                            ? replaceInvitation
                                                ? 'Replacing…'
                                                : 'Creating…'
                                            : replaceInvitation
                                              ? 'Replace invitation'
                                              : 'Create invitation'}
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </SmartForm>
                )}
            </DialogContent>
        </Dialog>
    );
}
