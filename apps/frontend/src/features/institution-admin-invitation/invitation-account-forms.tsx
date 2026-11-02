import { useRef } from 'react';
import { z } from 'zod/v4';
import type { UseFormReturn } from 'react-hook-form';
import {
    institutionAdminInvitationAccountCredentialsSchema,
    institutionAdminInvitationClaimRequestSchema,
    institutionAdminInvitationNewAccountClaimSchema,
    type InstitutionAdminInvitationAccountCredentials,
    type InstitutionAdminInvitationClaimRequest,
    type InstitutionAdminInvitationNewAccountClaim,
} from '@erp/shared';
import { SmartForm } from '@/components/smart-form';
import { PasswordField, TextField } from '@/components/smart-form/form-fields';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';

type ExistingAccountFormProps = {
    invitedEmail: string;
    onSubmit: (credentials: InstitutionAdminInvitationAccountCredentials) => Promise<boolean>;
};

type ClaimFormProps = {
    onSubmit: (claim: InstitutionAdminInvitationClaimRequest) => Promise<boolean>;
};

type NewAccountFormProps = {
    invitedEmail: string;
    onSubmit: (claim: InstitutionAdminInvitationNewAccountClaim) => Promise<boolean>;
};

const newAccountFormSchema = institutionAdminInvitationNewAccountClaimSchema.extend({
    password_confirmation: z.string().min(8, 'Confirm your password.'),
});

type NewAccountFormValues = z.infer<typeof newAccountFormSchema>;
type NewAccountForm = UseFormReturn<NewAccountFormValues, unknown, NewAccountFormValues>;

export function ExistingInvitationAccountForm({
    invitedEmail,
    onSubmit,
}: ExistingAccountFormProps) {
    return (
        <SmartForm
            id="invitation-existing-account-form"
            schema={institutionAdminInvitationAccountCredentialsSchema}
            defaultValues={{ email: invitedEmail, password: '' }}
            onSubmit={onSubmit}
            showSubmitButton={false}
        >
            {(form) => (
                <>
                    <FieldGroup className="**:data-[slot=input]:min-h-11 **:data-[slot=input-group-input]:min-h-11">
                        <TextField
                            name="email"
                            label="Invited email (fixed by the Platform Owner)"
                            type="email"
                            autoComplete="username"
                            required
                            disabled={form.formState.isSubmitting}
                            readOnly
                        />
                        <PasswordField
                            name="password"
                            label="Password"
                            autoComplete="current-password"
                            required
                            disabled={form.formState.isSubmitting}
                        />
                    </FieldGroup>
                    <Button
                        type="submit"
                        form="invitation-existing-account-form"
                        className="min-h-11 w-full"
                        disabled={form.formState.isSubmitting}
                        aria-busy={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? (
                            <>
                                <Spinner aria-label="Checking account" />
                                Checking account…
                            </>
                        ) : (
                            'Continue with existing account'
                        )}
                    </Button>
                </>
            )}
        </SmartForm>
    );
}

export function ClaimantNameForm({ onSubmit }: ClaimFormProps) {
    return (
        <SmartForm
            id="invitation-claimant-name-form"
            schema={institutionAdminInvitationClaimRequestSchema}
            defaultValues={{ claimant_provided_name: '' }}
            onSubmit={onSubmit}
            showSubmitButton={false}
        >
            {(form) => (
                <>
                    <FieldGroup className="**:data-[slot=input]:min-h-11">
                        <TextField
                            name="claimant_provided_name"
                            label="Your name"
                            autoComplete="name"
                            description="The Owner will see this name when reviewing your request. It is not verified automatically."
                            required
                            disabled={form.formState.isSubmitting}
                        />
                    </FieldGroup>
                    <Button
                        type="submit"
                        form="invitation-claimant-name-form"
                        className="min-h-11 w-full"
                        disabled={form.formState.isSubmitting}
                        aria-busy={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? (
                            <>
                                <Spinner aria-label="Submitting claim" />
                                Submitting claim…
                            </>
                        ) : (
                            'Submit claim for review'
                        )}
                    </Button>
                </>
            )}
        </SmartForm>
    );
}

export function NewInvitationAccountForm({ invitedEmail, onSubmit }: NewAccountFormProps) {
    const formRef = useRef<NewAccountForm | null>(null);

    async function submit(values: NewAccountFormValues) {
        formRef.current?.clearErrors('password_confirmation');
        if (values.password !== values.password_confirmation) {
            formRef.current?.setError('password_confirmation', {
                type: 'validate',
                message: 'Passwords do not match.',
            });
            return;
        }

        const submitted = await onSubmit({
            password: values.password,
            claimant_provided_name: values.claimant_provided_name,
        });
        if (submitted) {
            formRef.current?.reset({
                password: '',
                password_confirmation: '',
                claimant_provided_name: '',
            });
        }
    }

    return (
        <SmartForm
            id="invitation-new-account-form"
            schema={newAccountFormSchema}
            defaultValues={{
                password: '',
                password_confirmation: '',
                claimant_provided_name: '',
            }}
            onSubmit={submit}
            showSubmitButton={false}
        >
            {(form) => {
                formRef.current = form;
                return (
                    <>
                        <dl className="grid gap-1 rounded-md border p-3">
                            <dt className="text-muted-foreground text-sm font-medium">
                                Invitation email (fixed by the Platform Owner)
                            </dt>
                            <dd className="font-medium break-all">{invitedEmail}</dd>
                        </dl>
                        <FieldGroup className="**:data-[slot=input]:min-h-11 **:data-[slot=input-group-input]:min-h-11">
                            <PasswordField
                                name="password"
                                label="Create password"
                                autoComplete="new-password"
                                description="Use at least eight characters."
                                required
                                disabled={form.formState.isSubmitting}
                            />
                            <PasswordField
                                name="password_confirmation"
                                label="Confirm password"
                                autoComplete="new-password"
                                required
                                disabled={form.formState.isSubmitting}
                            />
                            <TextField
                                name="claimant_provided_name"
                                label="Your name"
                                autoComplete="name"
                                description="The Owner will see this name when reviewing your request. It is not verified automatically."
                                required
                                disabled={form.formState.isSubmitting}
                            />
                        </FieldGroup>
                        <Button
                            type="submit"
                            form="invitation-new-account-form"
                            className="min-h-11 w-full"
                            disabled={form.formState.isSubmitting}
                            aria-busy={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? (
                                <>
                                    <Spinner aria-label="Submitting new-account claim" />
                                    Submitting claim…
                                </>
                            ) : (
                                'Create account and submit claim'
                            )}
                        </Button>
                    </>
                );
            }}
        </SmartForm>
    );
}
