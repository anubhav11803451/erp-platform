import { institutionProfileUpdateRequestSchema } from '@erp/shared';
import { SmartForm } from '@/components/smart-form';
import { TextField } from '@/components/smart-form/form-fields';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    LoadingState,
    PageHeading,
    RequestError,
} from '@/features/institution/shared/workspace-ui';
import { WorkspaceGate } from '@/components/shared/workspace-gate';
import {
    isValidInstitutionTimezone,
    useInstitutionProfile,
} from '@/hooks/institution/profile/use-institution-profile';

export function InstitutionProfilePage() {
    const { profile, updateState, fieldError, statusMessage, defaultValues, submit } =
        useInstitutionProfile();

    return (
        <WorkspaceGate allowedRoles={['INSTITUTION_ADMIN']}>
            <section className="space-y-6">
                <PageHeading
                    title="Institution profile"
                    description="Manage the Institution name and timezone used to determine attendance dates."
                />
                {statusMessage && (
                    <p role="status" aria-live="polite" className="text-sm">
                        {statusMessage}
                    </p>
                )}
                {profile.isLoading && <LoadingState label="Loading Institution profile…" />}
                {profile.isError && (
                    <RequestError error={profile.error} onRetry={() => void profile.refetch()} />
                )}
                {profile.data && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Institution details</CardTitle>
                            <CardDescription>
                                Attendance stays unavailable until a valid timezone is saved.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SmartForm
                                id="institution-profile-form"
                                schema={institutionProfileUpdateRequestSchema}
                                defaultValues={defaultValues}
                                onSubmit={submit}
                                enableReinitialize
                                noValidate
                                showSubmitButton={false}
                                className="space-y-5"
                            >
                                {(form) => {
                                    const name = form.watch('name');
                                    const timezone = form.watch('timezone');
                                    const unchanged =
                                        name.trim() === profile.data?.name &&
                                        timezone.trim() === (profile.data?.timezone ?? '');
                                    const timezoneValid =
                                        timezone.trim() !== '' &&
                                        isValidInstitutionTimezone(timezone.trim());

                                    return (
                                        <>
                                            <TextField
                                                name="name"
                                                idPrefix="institution-profile"
                                                label="Institution name"
                                                description="This name appears in workspace context and Staff invitations."
                                                required
                                                disabled={updateState.isLoading}
                                            />
                                            <TextField
                                                name="timezone"
                                                idPrefix="institution-profile"
                                                label="Institution timezone"
                                                placeholder="Asia/Kolkata"
                                                autoComplete="off"
                                                description="Enter an IANA timezone, such as Asia/Kolkata or America/Chicago. The browser timezone is not used."
                                                required
                                                disabled={updateState.isLoading}
                                            />
                                            {fieldError && (
                                                <p
                                                    role="alert"
                                                    className="text-destructive text-sm"
                                                >
                                                    {fieldError}
                                                </p>
                                            )}
                                            <Button
                                                type="submit"
                                                form="institution-profile-form"
                                                disabled={
                                                    updateState.isLoading ||
                                                    !name.trim() ||
                                                    !timezoneValid ||
                                                    unchanged ||
                                                    !form.formState.isDirty
                                                }
                                                aria-busy={updateState.isLoading}
                                            >
                                                {updateState.isLoading ? 'Saving…' : 'Save changes'}
                                            </Button>
                                        </>
                                    );
                                }}
                            </SmartForm>
                        </CardContent>
                    </Card>
                )}
            </section>
        </WorkspaceGate>
    );
}
