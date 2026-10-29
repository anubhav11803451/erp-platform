import { useEffect, useRef, useState } from 'react';
import { Building2, CheckCircle2, RefreshCw } from 'lucide-react';
import { institutionPairCreateSchema, type InstitutionPairCreatePayload } from '@erp/shared';
import { SmartForm } from '@/components/smart-form';
import { TextField } from '@/components/smart-form/form-fields';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import {
    useCreateInitialLegalEntityPairMutation,
    useGetLegalEntitiesQuery,
} from './owner-api-slice';
import { getApiErrorMessage } from '@/lib/utils';

const initialValues: InstitutionPairCreatePayload = {
    legal_entity_name: '',
    institution_name: '',
};

function isPermissionError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null || !('status' in error)) {
        return false;
    }

    return error.status === 401 || error.status === 403;
}

function DirectoryReloadButton({
    isFetching,
    onReload,
}: {
    isFetching: boolean;
    onReload: () => void;
}) {
    return (
        <Button
            type="button"
            variant="outline"
            onClick={onReload}
            disabled={isFetching}
            className="min-h-11"
        >
            {isFetching ? <Spinner aria-label="Refreshing directory" /> : <RefreshCw />}
            {isFetching ? 'Refreshing…' : 'Reload directory'}
        </Button>
    );
}

export function OwnerSetup() {
    const { data, error, isError, isFetching, isLoading, refetch } = useGetLegalEntitiesQuery();
    const [createPair, { isLoading: isCreating }] = useCreateInitialLegalEntityPairMutation();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);
    const [submissionDenied, setSubmissionDenied] = useState(false);
    const [retryNeedsRefresh, setRetryNeedsRefresh] = useState(false);
    const [isCheckingDirectory, setIsCheckingDirectory] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [reconciliationMessage, setReconciliationMessage] = useState<string | null>(null);
    const successRef = useRef<HTMLDivElement>(null);
    const createSetupButtonRef = useRef<HTMLButtonElement>(null);
    const restoreCreateFocusRef = useRef(false);
    const permissionDenied = isPermissionError(error);
    const legalEntities = data?.legal_entities ?? [];
    const hasDirectory = legalEntities.length > 0;

    useEffect(() => {
        if (successMessage) {
            successRef.current?.focus();
        }
    }, [successMessage]);

    useEffect(() => {
        if (!isFormOpen && restoreCreateFocusRef.current) {
            createSetupButtonRef.current?.focus();
            restoreCreateFocusRef.current = false;
        }
    }, [isFormOpen]);

    const reloadDirectory = () => {
        void refetch();
    };

    const refreshBeforeRetry = async () => {
        setIsCheckingDirectory(true);
        setReconciliationMessage(null);

        try {
            await refetch().unwrap();
            setRetryNeedsRefresh(false);
            setReconciliationMessage(
                'The directory is up to date. Review it before deliberately retrying creation.'
            );
        } catch {
            setRetryNeedsRefresh(true);
            setReconciliationMessage(
                'The directory could not be refreshed. Creation remains disabled until it can be checked.'
            );
        } finally {
            setIsCheckingDirectory(false);
        }
    };

    const onSubmit = async (payload: InstitutionPairCreatePayload) => {
        setSubmissionError(null);
        setSubmissionDenied(false);
        setReconciliationMessage(null);
        setRetryNeedsRefresh(false);

        try {
            await createPair(payload).unwrap();
        } catch (mutationError) {
            const denied = isPermissionError(mutationError);
            setSubmissionDenied(denied);
            setSubmissionError(
                denied
                    ? 'This workspace is not available to your account. No directory details are shown.'
                    : getApiErrorMessage(
                          mutationError,
                          'The request could not be confirmed. Refresh the directory before retrying.'
                      )
            );
            if (denied) {
                setRetryNeedsRefresh(false);
                return;
            }

            setRetryNeedsRefresh(true);
            await refreshBeforeRetry();
            return;
        }

        setSuccessMessage(
            `Created LegalEntity group “${payload.legal_entity_name}” and first Institution “${payload.institution_name}”.`
        );
        setIsFormOpen(false);
        void refetch();
    };

    const handleCancel = () => {
        restoreCreateFocusRef.current = true;
        setIsFormOpen(false);
        setSubmissionError(null);
        setSubmissionDenied(false);
        setRetryNeedsRefresh(false);
        setReconciliationMessage(null);
    };

    return (
        <div className="space-y-6">
            {successMessage && (
                <div
                    ref={successRef}
                    role="status"
                    aria-live="polite"
                    tabIndex={-1}
                    className="focus-visible:ring-ring rounded-lg outline-none focus-visible:ring-2"
                >
                    <Alert role="presentation">
                        <CheckCircle2 aria-hidden="true" />
                        <AlertTitle>Setup created</AlertTitle>
                        <AlertDescription>{successMessage}</AlertDescription>
                    </Alert>
                </div>
            )}

            <Card>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1.5">
                        <CardTitle>LegalEntity directory</CardTitle>
                        <CardDescription>
                            Institutions are grouped under their LegalEntity.
                        </CardDescription>
                    </div>
                    <DirectoryReloadButton isFetching={isFetching} onReload={reloadDirectory} />
                </CardHeader>
                <CardContent className="space-y-4">
                    {permissionDenied ? (
                        <Alert variant="destructive">
                            <AlertTitle>Workspace unavailable</AlertTitle>
                            <AlertDescription>
                                This workspace is not available to your account. No directory
                                details are shown.
                            </AlertDescription>
                        </Alert>
                    ) : isLoading ? (
                        <div
                            role="status"
                            aria-live="polite"
                            aria-label="Loading LegalEntity directory"
                            className="space-y-3"
                        >
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ) : isError && !data ? (
                        <Alert variant="destructive">
                            <AlertTitle>Could not load the directory</AlertTitle>
                            <AlertDescription>
                                <p>
                                    {getApiErrorMessage(
                                        error,
                                        'Please try loading the directory again.'
                                    )}
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={reloadDirectory}
                                    disabled={isFetching}
                                    className="mt-3 min-h-11"
                                >
                                    Try again
                                </Button>
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <>
                            {isError && data && (
                                <Alert variant="destructive">
                                    <AlertTitle>Directory refresh failed</AlertTitle>
                                    <AlertDescription>
                                        The displayed records may be out of date. Reload before
                                        relying on them.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {hasDirectory ? (
                                <>
                                    {submissionError && (
                                        <Alert variant="destructive">
                                            <AlertTitle>Creation was not confirmed</AlertTitle>
                                            <AlertDescription>
                                                <p>{submissionError}</p>
                                                {reconciliationMessage && (
                                                    <p className="mt-2">{reconciliationMessage}</p>
                                                )}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                    <ul className="space-y-4">
                                        {legalEntities.map((legalEntity) => (
                                            <li key={legalEntity.id}>
                                                <section
                                                    aria-labelledby={`legal-entity-${legalEntity.id}`}
                                                    className="rounded-lg border p-4 sm:p-5"
                                                >
                                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                                                        <h2
                                                            id={`legal-entity-${legalEntity.id}`}
                                                            className="text-base font-semibold break-words"
                                                        >
                                                            {legalEntity.name}
                                                        </h2>
                                                        <p className="text-muted-foreground text-sm">
                                                            {legalEntity.institutions.length}{' '}
                                                            {legalEntity.institutions.length === 1
                                                                ? 'Institution'
                                                                : 'Institutions'}
                                                        </p>
                                                    </div>
                                                    {legalEntity.institutions.length > 0 ? (
                                                        <ul className="mt-3 space-y-2 border-l-2 pl-4 sm:ml-2">
                                                            {legalEntity.institutions.map(
                                                                (institution) => (
                                                                    <li
                                                                        key={institution.id}
                                                                        className="flex min-h-11 items-center gap-2 text-sm break-words"
                                                                    >
                                                                        <Building2
                                                                            aria-hidden="true"
                                                                            className="text-muted-foreground size-4 shrink-0"
                                                                        />
                                                                        {institution.name}
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-muted-foreground mt-3 text-sm">
                                                            No Institutions are listed under this
                                                            group.
                                                        </p>
                                                    )}
                                                </section>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : isFormOpen ? (
                                <Card className="border-dashed">
                                    <CardHeader>
                                        <CardTitle>Create group and first Institution</CardTitle>
                                        <CardDescription>
                                            Create a LegalEntity group and its first Institution.
                                            One group can contain multiple Institutions.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {submissionError && (
                                            <Alert
                                                variant="destructive"
                                                className="mb-5"
                                                aria-live="assertive"
                                            >
                                                <AlertTitle>
                                                    {submissionDenied
                                                        ? 'Workspace unavailable'
                                                        : 'Creation was not confirmed'}
                                                </AlertTitle>
                                                <AlertDescription>
                                                    <p>{submissionError}</p>
                                                    {reconciliationMessage && (
                                                        <p className="mt-2">
                                                            {reconciliationMessage}
                                                        </p>
                                                    )}
                                                    {retryNeedsRefresh && !submissionDenied && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() =>
                                                                void refreshBeforeRetry()
                                                            }
                                                            disabled={isCheckingDirectory}
                                                            className="mt-3 min-h-11"
                                                        >
                                                            {isCheckingDirectory && (
                                                                <Spinner aria-label="Checking directory" />
                                                            )}
                                                            {isCheckingDirectory
                                                                ? 'Checking directory…'
                                                                : 'Check directory before retry'}
                                                        </Button>
                                                    )}
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                        <SmartForm
                                            id="owner-institution-pair-form"
                                            schema={institutionPairCreateSchema}
                                            defaultValues={initialValues}
                                            onSubmit={onSubmit}
                                            noValidate
                                            showSubmitButton={false}
                                        >
                                            <FieldGroup>
                                                <FieldSet className="rounded-md border p-4 sm:p-5">
                                                    <FieldLegend>LegalEntity group</FieldLegend>
                                                    <TextField
                                                        name="legal_entity_name"
                                                        label="LegalEntity name"
                                                        placeholder="e.g., Northstar Education Group"
                                                        description="Required. Up to 160 characters; leading and trailing spaces are trimmed."
                                                        required
                                                        autoFocus
                                                        disabled={
                                                            isCreating ||
                                                            isCheckingDirectory ||
                                                            retryNeedsRefresh ||
                                                            submissionDenied
                                                        }
                                                    />
                                                </FieldSet>
                                                <FieldSet className="ml-3 rounded-md border p-4 sm:ml-6 sm:p-5">
                                                    <FieldLegend>First Institution</FieldLegend>
                                                    <TextField
                                                        name="institution_name"
                                                        label="Institution name"
                                                        placeholder="e.g., Northstar Academy"
                                                        description="Required. Up to 160 characters; leading and trailing spaces are trimmed."
                                                        required
                                                        disabled={
                                                            isCreating ||
                                                            isCheckingDirectory ||
                                                            retryNeedsRefresh ||
                                                            submissionDenied
                                                        }
                                                    />
                                                </FieldSet>
                                            </FieldGroup>
                                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleCancel}
                                                    disabled={isCreating || isCheckingDirectory}
                                                    className="min-h-11"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    form="owner-institution-pair-form"
                                                    disabled={
                                                        isCreating ||
                                                        isCheckingDirectory ||
                                                        retryNeedsRefresh ||
                                                        submissionDenied
                                                    }
                                                    className="min-h-11"
                                                >
                                                    {isCreating ? (
                                                        <>
                                                            <Spinner aria-label="Creating setup" />
                                                            Creating…
                                                        </>
                                                    ) : (
                                                        'Create'
                                                    )}
                                                </Button>
                                            </div>
                                        </SmartForm>
                                    </CardContent>
                                </Card>
                            ) : successMessage ? (
                                <Alert role="status">
                                    <AlertTitle>
                                        Setup created; directory needs refreshing
                                    </AlertTitle>
                                    <AlertDescription>
                                        The creation was confirmed, but the directory does not yet
                                        show the new records. Reload the directory before
                                        continuing.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <Empty className="rounded-lg border">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <Building2 aria-hidden="true" />
                                        </EmptyMedia>
                                        <EmptyTitle>No institution setup yet</EmptyTitle>
                                        <EmptyDescription>
                                            Create a LegalEntity group and its first Institution. A
                                            group can contain multiple Institutions.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                    <Button
                                        ref={createSetupButtonRef}
                                        type="button"
                                        onClick={() => {
                                            setSuccessMessage(null);
                                            setIsFormOpen(true);
                                        }}
                                        className="min-h-11"
                                    >
                                        Create group and first Institution
                                    </Button>
                                </Empty>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
