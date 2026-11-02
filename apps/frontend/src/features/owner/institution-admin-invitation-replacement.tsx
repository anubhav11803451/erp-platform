import { Check, Copy } from 'lucide-react';
import { z } from 'zod/v4';
import type {
    InstitutionAdminInvitationReissueRequest,
    InstitutionAdminInvitationStatusResponse,
} from '@erp/shared';
import { institutionAdminInvitationReissueRequestSchema } from '@erp/shared';
import { SmartForm } from '@/components/smart-form';
import { TextField } from '@/components/smart-form/form-fields';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { FormDialogShell } from '@/components/shared/form-dialog-shell';
import { useOwnerInvitationReplacement } from '@/hooks/owner-setup/invitation-replacement-hooks';

const replacementFormSchema = institutionAdminInvitationReissueRequestSchema.extend({
    contact_name: z.string().trim().max(160).optional().or(z.literal('')),
    contact_phone: z.string().trim().max(64).optional().or(z.literal('')),
});

type ReplacementFormValues = z.infer<typeof replacementFormSchema>;

export function InstitutionAdminInvitationReplacement({
    institutionId,
    institutionName,
    currentStatus,
    accessToken,
    open,
    onOpenChange,
    onReplaced,
}: {
    institutionId: string;
    institutionName: string;
    currentStatus: InstitutionAdminInvitationStatusResponse;
    accessToken: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onReplaced: (status: InstitutionAdminInvitationStatusResponse) => void;
}) {
    const {
        oneTimeLink,
        copyMessage,
        actionError,
        isReplacing,
        setActionError,
        replaceInvitation,
        copyInvitationLink,
        clearReplacementState,
    } = useOwnerInvitationReplacement({
        institutionId,
        currentStatus,
        accessToken,
        onReplaced,
    });

    function handleOpenChange(nextOpen: boolean) {
        if (!nextOpen && isReplacing) {
            return;
        }
        onOpenChange(nextOpen);
        if (!nextOpen) {
            clearReplacementState();
        }
    }

    async function submitReplacement(values: ReplacementFormValues) {
        const recipient: InstitutionAdminInvitationReissueRequest = {
            invited_email: values.invited_email,
            contact_name: values.contact_name?.trim() || undefined,
            contact_phone: values.contact_phone?.trim() || undefined,
        };
        const validRecipient = institutionAdminInvitationReissueRequestSchema.safeParse(recipient);
        if (!validRecipient.success) {
            setActionError('Provide a valid invitation email and optional contact details.');
            return;
        }

        await replaceInvitation(validRecipient.data);
    }

    return (
        <FormDialogShell
            isOpen={open}
            setIsOpen={handleOpenChange}
            title={
                oneTimeLink
                    ? 'Invitation link — shown once'
                    : !currentStatus.invited_email || currentStatus.status === 'LEGACY_ACCEPTED'
                      ? 'Close legacy invitation and issue fresh invitation'
                      : 'Issue fresh invitation'
            }
            description={
                oneTimeLink
                    ? 'Copy this link now and share it manually with the fixed recipient. Closing removes your access to it.'
                    : `For ${institutionName}. The old invitation will be closed. Set the fixed recipient and share the new link manually; no email is sent.`
            }
            className="max-h-[90dvh] overflow-y-auto"
        >
            {oneTimeLink ? (
                <>
                    <div className="space-y-2">
                        <Label htmlFor={`replacement-link-${institutionId}`}>
                            One-time invitation link
                        </Label>
                        <Input
                            id={`replacement-link-${institutionId}`}
                            value={oneTimeLink}
                            readOnly
                            onFocus={(event) => event.currentTarget.select()}
                            className="min-h-11 font-mono text-xs"
                        />
                    </div>
                    <p role="status" aria-live="polite" className="text-sm">
                        {copyMessage}
                    </p>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            className="min-h-11"
                            onClick={() => void copyInvitationLink()}
                        >
                            {copyMessage.startsWith('Invitation link copied') ? (
                                <Check aria-hidden="true" />
                            ) : (
                                <Copy aria-hidden="true" />
                            )}
                            Copy link
                        </Button>
                        <Button
                            type="button"
                            className="min-h-11"
                            onClick={() => handleOpenChange(false)}
                        >
                            Done
                        </Button>
                    </DialogFooter>
                </>
            ) : (
                <>
                    {actionError && (
                        <Alert variant="destructive" aria-live="assertive">
                            <AlertTitle>Replacement not confirmed</AlertTitle>
                            <AlertDescription>{actionError}</AlertDescription>
                        </Alert>
                    )}
                    <SmartForm
                        id={`replacement-form-${institutionId}`}
                        schema={replacementFormSchema}
                        defaultValues={{
                            invited_email: currentStatus.invited_email ?? '',
                            contact_name: currentStatus.owner_contact_name ?? '',
                            contact_phone: currentStatus.owner_contact_phone ?? '',
                        }}
                        onSubmit={submitReplacement}
                        noValidate
                        showSubmitButton={false}
                    >
                        <FieldGroup>
                            <TextField
                                name="invited_email"
                                label="Admin invitation email"
                                type="email"
                                autoComplete="email"
                                required
                                disabled={isReplacing}
                            />
                            <TextField
                                name="contact_name"
                                label="Name you already know for this person (optional)"
                                description="They will enter their own name when claiming access. Use a name you know independently to help verify them."
                                autoComplete="name"
                                disabled={isReplacing}
                            />
                            <TextField
                                name="contact_phone"
                                label="Phone number you already have for them (optional)"
                                description="Use a number known before this invitation; do not rely on a number they provide with their request."
                                type="tel"
                                autoComplete="tel"
                                disabled={isReplacing}
                            />
                        </FieldGroup>
                        <DialogFooter className="mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="min-h-11"
                                onClick={() => handleOpenChange(false)}
                                disabled={isReplacing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                form={`replacement-form-${institutionId}`}
                                className="min-h-11"
                                disabled={isReplacing}
                                aria-busy={isReplacing}
                            >
                                {isReplacing ? (
                                    <>
                                        <Spinner aria-label="Replacing invitation" />
                                        Replacing…
                                    </>
                                ) : (
                                    'Close old claim and reissue'
                                )}
                            </Button>
                        </DialogFooter>
                    </SmartForm>
                </>
            )}
        </FormDialogShell>
    );
}
