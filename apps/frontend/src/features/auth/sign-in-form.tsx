import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { PasswordField, TextField } from '@/components/smart-form/form-fields';
import { SmartForm } from '@/components/smart-form';
import { platformOwnerSignInSchema } from '@erp/shared';
import type { PlatformOwnerSignInPayload } from '@erp/shared';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export function SignInForm() {
    const {
        signIn: { handleSignIn, isSigningIn },
    } = useAuth();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function submit(values: PlatformOwnerSignInPayload) {
        setErrorMessage(null);
        try {
            await handleSignIn(values);
        } catch (error: unknown) {
            setErrorMessage(
                error instanceof Error ? error.message : 'Unable to sign in. Please try again.'
            );
        }
    }

    return (
        <SmartForm
            id="platform-owner-sign-in-form"
            schema={platformOwnerSignInSchema}
            onSubmit={submit}
            defaultValues={{ email: '', password: '' }}
            showSubmitButton={false}
            className="space-y-5"
        >
            <FieldGroup className="gap-5">
                <TextField
                    name="email"
                    label="Email address"
                    type="email"
                    placeholder="owner@example.com"
                    required
                    autoComplete="username"
                    autoFocus
                    disabled={isSigningIn}
                />
                <PasswordField
                    name="password"
                    label="Password"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    disabled={isSigningIn}
                />
            </FieldGroup>
            {errorMessage && (
                <Alert variant="destructive" aria-live="assertive">
                    <AlertTitle>Sign-in failed</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isSigningIn} aria-busy={isSigningIn}>
                {isSigningIn ? (
                    <>
                        <LoaderCircle aria-hidden="true" className="animate-spin" />
                        Signing in…
                    </>
                ) : (
                    'Sign in'
                )}
            </Button>
        </SmartForm>
    );
}
