import { SmartForm } from '@/components/smart-form';
import { PasswordField, TextField } from '@/components/smart-form/form-fields';
import { FieldGroup } from '@/components/ui/field';

import { signInSchema } from './schemas';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

export function SignInForm() {
    const {
        signIn: { handleSignIn, isSigningIn },
    } = useAuth();

    return (
        <SmartForm
            id="sign-in-form"
            schema={signInSchema}
            onSubmit={handleSignIn}
            defaultValues={{
                email: '',
                password: '',
            }}
            showSubmitButton={false}
        >
            <FieldGroup>
                <TextField name="email" label="Email" placeholder="Email" required />
                <PasswordField name="password" label="Password" placeholder="Password" required />
            </FieldGroup>
            <Button
                id="sign-in-form-submit-button"
                type="submit"
                className="mt-4 w-full"
                disabled={isSigningIn}
            >
                {isSigningIn ? 'Signing In...' : 'Sign In'}
            </Button>
        </SmartForm>
    );
}
