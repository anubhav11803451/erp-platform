import { useEffect, useState } from 'react';
import { z } from 'zod/v4';
import type {
    InstitutionAdminInvitationCreateRequest,
    InstitutionAdminInvitationCreateResponse,
    LegalEntityCreateRequest,
} from '@erp/shared';
import {
    institutionAdminInvitationCreateRequestSchema,
    legalEntityCreateRequestSchema,
} from '@erp/shared';
import { SmartForm } from '@/components/smart-form';
import { TextField } from '@/components/smart-form/form-fields';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { FormDialogShell } from '@/components/shared/form-dialog-shell';
import { FieldGroup } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useInstitutionFormHooks } from '@/hooks/owner-setup/institution-form-hooks';
import { useLegalEntityFormHooks } from '@/hooks/owner-setup/legal-entity-form-hooks';
import {
    closeOwnerSetupDialog,
    selectInstitutionCreationUnconfirmed,
    selectOwnerSetupDialog,
} from './owner-setup-slice';
import { OwnerInvitationCreatedDialog } from './owner-invitation-created-dialog';

const institutionFormSchema = institutionAdminInvitationCreateRequestSchema.extend({
    contact_name: z.string().trim().max(160).optional().or(z.literal('')),
    contact_phone: z.string().trim().max(64).optional().or(z.literal('')),
});

export type InstitutionFormValues = z.infer<typeof institutionFormSchema>;

const initialLegalEntity: LegalEntityCreateRequest = { name: '', code: '' };
const initialInstitution: InstitutionFormValues = {
    name: '',
    code_suffix: '',
    invited_email: '',
    contact_name: '',
    contact_phone: '',
};

export function LegalEntityForm() {
    const dispatch = useAppDispatch();
    const dialog = useAppSelector(selectOwnerSetupDialog);
    const isOpen = dialog === 'legal-entity';
    const { submitLegalEntity, isSaving, error, clearError } = useLegalEntityFormHooks();

    useEffect(() => {
        if (isOpen) {
            clearError();
        }
    }, [clearError, isOpen]);

    return (
        <FormDialogShell
            isOpen={isOpen}
            setIsOpen={(open) => {
                if (!open) {
                    dispatch(closeOwnerSetupDialog());
                }
            }}
            title="Create LegalEntity"
            description="This creates only the LegalEntity. Institutions are added separately."
        >
            <SmartForm
                id="legal-entity-form"
                schema={legalEntityCreateRequestSchema}
                defaultValues={initialLegalEntity}
                onSubmit={submitLegalEntity}
                noValidate
                showSubmitButton={false}
            >
                <FieldGroup>
                    <TextField
                        name="name"
                        label="LegalEntity name"
                        placeholder="e.g., Northstar Education Group"
                        description="Required. Up to 160 characters."
                        required
                        autoFocus
                        disabled={isSaving}
                    />
                    <TextField
                        name="code"
                        label="LegalEntity code"
                        placeholder="e.g., NORTHSTAR"
                        description="Required. Use 2–12 uppercase letters, digits, or internal hyphens."
                        required
                        autoComplete="off"
                        disabled={isSaving}
                    />
                </FieldGroup>
                {error && (
                    <Alert variant="destructive" aria-live="assertive" className="mt-4">
                        <AlertTitle>LegalEntity was not created</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <DialogFooter className="mt-5">
                    <Button
                        type="button"
                        variant="outline"
                        className="min-h-11"
                        onClick={() => dispatch(closeOwnerSetupDialog())}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="legal-entity-form"
                        className="min-h-11"
                        disabled={isSaving}
                        aria-busy={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <Spinner aria-label="Creating LegalEntity" />
                                Creating…
                            </>
                        ) : (
                            'Create LegalEntity'
                        )}
                    </Button>
                </DialogFooter>
            </SmartForm>
        </FormDialogShell>
    );
}

export function InstitutionForm() {
    const {
        dialogOpen,
        legalEntity,
        closeDialog,
        createInstitution,
        refreshBeforeRetry,
        markCreationUnconfirmed,
        markCreated,
    } = useInstitutionFormHooks();
    const isUnconfirmed = useAppSelector(selectInstitutionCreationUnconfirmed);
    const [created, setCreated] = useState<InstitutionAdminInvitationCreateResponse | null>(null);
    const [error, setError] = useState('');
    const [copyMessage, setCopyMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    async function onSubmit(values: InstitutionFormValues) {
        if (!legalEntity) {
            return;
        }

        const payload: InstitutionAdminInvitationCreateRequest = {
            name: values.name,
            code_suffix: values.code_suffix,
            invited_email: values.invited_email,
            contact_name: values.contact_name?.trim() || undefined,
            contact_phone: values.contact_phone?.trim() || undefined,
        };
        const parsed = institutionAdminInvitationCreateRequestSchema.safeParse(payload);
        if (!parsed.success) {
            setError('Check the Institution and invitation details.');
            return;
        }

        setError('');
        setIsSaving(true);
        try {
            const result = await createInstitution(parsed.data);
            setCreated(result);
            setCopyMessage('The one-time link is ready. Copy it now; it cannot be shown again.');
            markCreated(result.institution.name);
        } catch (createError: unknown) {
            markCreationUnconfirmed();
            setError(
                createError instanceof Error
                    ? `${createError.message} Do not retry until you refresh and review the directory.`
                    : 'The request could not be confirmed. Refresh and review the directory before retrying.'
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function onRefresh() {
        setIsRefreshing(true);
        try {
            const refreshed = await refreshBeforeRetry();
            setError(
                refreshed
                    ? 'Directory refreshed. Review it carefully before deliberately submitting again.'
                    : 'The directory could not be refreshed. Keep creation disabled until it can be checked.'
            );
        } finally {
            setIsRefreshing(false);
        }
    }

    async function copyInvitationLink() {
        if (!created) {
            return;
        }
        try {
            await navigator.clipboard.writeText(created.invitation.one_time_invitation_url);
            setCopyMessage('Invitation link copied. Share it only with the intended recipient.');
        } catch {
            setCopyMessage('Copy was unavailable. Select the link field and copy it manually.');
        }
    }

    function handleOpenChange(open: boolean) {
        if (!open && (isSaving || isUnconfirmed)) {
            return;
        }
        if (!open) {
            setError('');
            closeDialog();
        }
    }

    return (
        <>
            <FormDialogShell
                isOpen={dialogOpen}
                setIsOpen={handleOpenChange}
                title="Generate claim / Add Campus"
                description={`Add an Institution under ${legalEntity?.name ?? 'this LegalEntity'}. The first Admin invitation is created atomically with the Institution.`}
                className="max-h-[90dvh] overflow-y-auto"
            >
                {legalEntity && (
                    <SmartForm
                        key={legalEntity.id}
                        id={`institution-create-form-${legalEntity.id}`}
                        schema={institutionFormSchema}
                        defaultValues={initialInstitution}
                        onSubmit={onSubmit}
                        noValidate
                        showSubmitButton={false}
                    >
                        {(form) => (
                            <>
                                <FieldGroup>
                                    <TextField
                                        name="name"
                                        label="Institution name"
                                        required
                                        autoFocus
                                        disabled={isSaving || isUnconfirmed}
                                    />
                                    <TextField
                                        name="code_suffix"
                                        label="Institution code suffix"
                                        description="Use 2–12 uppercase letters, digits, or internal hyphens."
                                        required
                                        autoComplete="off"
                                        disabled={isSaving || isUnconfirmed}
                                    />
                                    <p className="text-muted-foreground text-sm">
                                        Full code preview:{' '}
                                        <span className="text-foreground font-medium">
                                            {legalEntity.code ?? 'ENTITY'}-
                                            {form.watch('code_suffix')?.trim().toUpperCase() ||
                                                'SUFFIX'}
                                        </span>
                                    </p>
                                    <TextField
                                        name="invited_email"
                                        label="Institution Admin invitation email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        disabled={isSaving || isUnconfirmed}
                                    />
                                    <TextField
                                        name="contact_name"
                                        label="Name you already know for this person (optional)"
                                        description="They will enter their own name when claiming access. Use a name you know independently to help verify them."
                                        autoComplete="name"
                                        disabled={isSaving || isUnconfirmed}
                                    />
                                    <TextField
                                        name="contact_phone"
                                        label="Phone number you already have for them (optional)"
                                        description="Use a number known before this invitation; do not rely on a number they provide with their request."
                                        type="tel"
                                        autoComplete="tel"
                                        disabled={isSaving || isUnconfirmed}
                                    />
                                </FieldGroup>
                                <p className="text-muted-foreground mt-4 text-sm">
                                    “Generate claim / Add Campus” creates an Institution under this
                                    LegalEntity and issues a fixed-email Admin invitation. It does
                                    not create a Campus record or send email.
                                </p>
                                {error && (
                                    <Alert
                                        variant="destructive"
                                        aria-live="assertive"
                                        className="mt-4"
                                    >
                                        <AlertTitle>Creation could not be confirmed</AlertTitle>
                                        <AlertDescription className="gap-3">
                                            <p>{error}</p>
                                            {isUnconfirmed && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="min-h-11"
                                                    onClick={() => void onRefresh()}
                                                    disabled={isRefreshing}
                                                >
                                                    {isRefreshing ? (
                                                        <Spinner aria-label="Refreshing LegalEntity directory" />
                                                    ) : (
                                                        'Refresh directory before retry'
                                                    )}
                                                    {isRefreshing ? 'Refreshing…' : null}
                                                </Button>
                                            )}
                                        </AlertDescription>
                                    </Alert>
                                )}
                                <DialogFooter className="mt-5">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="min-h-11"
                                        onClick={() => handleOpenChange(false)}
                                        disabled={isSaving || isUnconfirmed}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        form={`institution-create-form-${legalEntity.id}`}
                                        className="min-h-11"
                                        disabled={isSaving || isUnconfirmed}
                                        aria-busy={isSaving}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Spinner aria-label="Creating Institution and invitation" />
                                                Creating…
                                            </>
                                        ) : (
                                            'Create Institution and invitation'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </SmartForm>
                )}
            </FormDialogShell>
            <OwnerInvitationCreatedDialog
                created={created}
                copyMessage={copyMessage}
                onCopy={copyInvitationLink}
                onClose={() => {
                    setCreated(null);
                    setCopyMessage('');
                }}
            />
        </>
    );
}
