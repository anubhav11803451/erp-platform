import { Link } from 'react-router';
import { CheckCircle2, LoaderCircle } from 'lucide-react';
import { SmartForm } from '@/components/smart-form';
import { PasswordField } from '@/components/smart-form/form-fields';
import { Breadcrumbs } from '@/components/shared/breadcrumbs/bread-crumbs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { formatDate } from '@/lib/utils/formatters';
import {
    existingAccountPasswordSchema,
    newAccountPasswordSchema,
    useStaffInvitationAcceptance,
} from '@/hooks/institution/staff-invitation/use-staff-invitation-acceptance';

export function StaffInvitationAcceptance() {
    const {
        pageState,
        context,
        mode,
        error,
        canRetryCheck,
        headingRef,
        retryContext,
        changeMode,
        submitPassword,
    } = useStaffInvitationAcceptance();

    return (
        <main className="bg-background min-h-dvh px-4 py-8 sm:px-6 sm:py-12">
            <div className="mx-auto w-full max-w-xl space-y-5">
                <Breadcrumbs />
                <Card>
                    <CardHeader>
                        <p className="text-muted-foreground text-sm font-medium">
                            Institution Staff invitation
                        </p>
                        <h1
                            ref={headingRef}
                            tabIndex={-1}
                            className="text-2xl focus-visible:ring-2 focus-visible:outline-none"
                        >
                            {pageState === 'accepted'
                                ? 'Invitation accepted'
                                : 'Accept Staff invitation'}
                        </h1>
                        <CardDescription>
                            Acceptance creates no session. Sign in normally after your invitation is
                            accepted.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {(pageState === 'capturing' || pageState === 'loading') && (
                            <div
                                role="status"
                                aria-live="polite"
                                className="text-muted-foreground flex items-center gap-2"
                            >
                                <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                                Checking invitation details…
                            </div>
                        )}

                        {pageState === 'unavailable' && (
                            <Alert variant="destructive" aria-live="assertive">
                                <AlertTitle>Invitation unavailable</AlertTitle>
                                <AlertDescription className="gap-3">
                                    <p>{error}</p>
                                    <p>
                                        No Institution roster or attendance data is available on
                                        this page.
                                    </p>
                                    {canRetryCheck && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={retryContext}
                                        >
                                            Try again
                                        </Button>
                                    )}
                                </AlertDescription>
                            </Alert>
                        )}

                        {pageState === 'accepted' && (
                            <Alert aria-live="polite">
                                <CheckCircle2 aria-hidden="true" />
                                <AlertTitle>Staff access is ready</AlertTitle>
                                <AlertDescription className="gap-3">
                                    <p>
                                        Your invitation was accepted. No session was created. Sign
                                        in with your email and password to continue to your assigned
                                        groups.
                                    </p>
                                    <Button asChild>
                                        <Link to="/signin">Continue to sign in</Link>
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        )}

                        {pageState === 'ready' && context && (
                            <>
                                <section
                                    aria-labelledby="staff-invitation-details"
                                    className="space-y-3 rounded-md border p-4"
                                >
                                    <h2 id="staff-invitation-details" className="font-semibold">
                                        Invitation details
                                    </h2>
                                    <dl className="grid gap-3 sm:grid-cols-2">
                                        <div>
                                            <dt className="text-muted-foreground text-sm">
                                                Institution
                                            </dt>
                                            <dd className="font-medium">
                                                {context.institution_name}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-muted-foreground text-sm">
                                                Invited email
                                            </dt>
                                            <dd className="font-medium break-all">
                                                {context.invited_email}
                                            </dd>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <dt className="text-muted-foreground text-sm">
                                                Invitation expires
                                            </dt>
                                            <dd className="font-medium">
                                                {formatDate(new Date(context.expires_at), 'PPP p')}
                                            </dd>
                                        </div>
                                    </dl>
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-medium">Assigned groups</h3>
                                        {context.groups.length ? (
                                            <ul className="list-inside list-disc space-y-1 text-sm">
                                                {context.groups.map((group) => (
                                                    <li key={group.id}>
                                                        {group.name} ·{' '}
                                                        {group.type === 'SCHOOL_SECTION'
                                                            ? 'School section'
                                                            : 'Coaching batch'}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-muted-foreground text-sm">
                                                No groups are assigned. Ask the Institution Admin
                                                about your access before accepting.
                                            </p>
                                        )}
                                    </div>
                                    <p className="text-sm">
                                        Staff can view and update students and attendance only in
                                        the groups assigned to them. Access starts after acceptance
                                        and ordinary sign-in.
                                    </p>
                                </section>

                                <div className="grid gap-2 sm:grid-cols-2">
                                    <Button
                                        type="button"
                                        variant={mode === 'existing' ? 'default' : 'outline'}
                                        aria-pressed={mode === 'existing'}
                                        onClick={() => changeMode('existing')}
                                    >
                                        I have an account
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={mode === 'new' ? 'default' : 'outline'}
                                        aria-pressed={mode === 'new'}
                                        onClick={() => changeMode('new')}
                                    >
                                        I am new to this service
                                    </Button>
                                </div>

                                {mode === 'existing' ? (
                                    <SmartForm
                                        key={`existing-${context.institution_id}`}
                                        id="staff-accept-existing-form"
                                        schema={existingAccountPasswordSchema}
                                        defaultValues={{ password: '' }}
                                        onSubmit={({ password }) => submitPassword(password)}
                                        noValidate
                                        showSubmitButton={false}
                                    >
                                        {(form) => (
                                            <>
                                                <PasswordField
                                                    name="password"
                                                    idPrefix="staff-accept-existing"
                                                    label="Current password"
                                                    autoComplete="current-password"
                                                    description="Enter the current password for the invited email."
                                                    required
                                                    disabled={form.formState.isSubmitting}
                                                />
                                                {error && (
                                                    <Alert
                                                        variant="destructive"
                                                        aria-live="assertive"
                                                    >
                                                        <AlertTitle>
                                                            Could not accept invitation
                                                        </AlertTitle>
                                                        <AlertDescription>{error}</AlertDescription>
                                                    </Alert>
                                                )}
                                                <Button
                                                    type="submit"
                                                    form="staff-accept-existing-form"
                                                    className="w-full"
                                                    disabled={
                                                        form.formState.isSubmitting ||
                                                        context.groups.length === 0
                                                    }
                                                    aria-busy={form.formState.isSubmitting}
                                                >
                                                    {form.formState.isSubmitting
                                                        ? 'Accepting…'
                                                        : 'Accept invitation'}
                                                </Button>
                                            </>
                                        )}
                                    </SmartForm>
                                ) : (
                                    <SmartForm
                                        key={`new-${context.institution_id}`}
                                        id="staff-accept-new-form"
                                        schema={newAccountPasswordSchema}
                                        defaultValues={{ password: '', confirm_password: '' }}
                                        onSubmit={({ password }) => submitPassword(password)}
                                        noValidate
                                        showSubmitButton={false}
                                    >
                                        {(form) => (
                                            <>
                                                <PasswordField
                                                    name="password"
                                                    idPrefix="staff-accept-new"
                                                    label="Create a password"
                                                    autoComplete="new-password"
                                                    description="Use at least 8 characters. You will sign in after acceptance."
                                                    required
                                                    disabled={form.formState.isSubmitting}
                                                />
                                                <PasswordField
                                                    name="confirm_password"
                                                    idPrefix="staff-accept-new"
                                                    label="Confirm password"
                                                    autoComplete="new-password"
                                                    description="Re-enter the password to confirm it."
                                                    required
                                                    disabled={form.formState.isSubmitting}
                                                />
                                                {error && (
                                                    <Alert
                                                        variant="destructive"
                                                        aria-live="assertive"
                                                    >
                                                        <AlertTitle>
                                                            Could not accept invitation
                                                        </AlertTitle>
                                                        <AlertDescription>{error}</AlertDescription>
                                                    </Alert>
                                                )}
                                                <Button
                                                    type="submit"
                                                    form="staff-accept-new-form"
                                                    className="w-full"
                                                    disabled={
                                                        form.formState.isSubmitting ||
                                                        context.groups.length === 0
                                                    }
                                                    aria-busy={form.formState.isSubmitting}
                                                >
                                                    {form.formState.isSubmitting
                                                        ? 'Accepting…'
                                                        : 'Accept invitation'}
                                                </Button>
                                            </>
                                        )}
                                    </SmartForm>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
