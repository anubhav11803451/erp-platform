import { SmartForm } from '@/components/smart-form';
import { TextField } from '@/components/smart-form/form-fields';
import { FieldGroup } from '@/components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { signInSchema } from './schemas';
import { useAuth } from '@/hooks/use-auth';

export function SignInForm() {
    const { handleSignIn } = useAuth();

    return (
        <Card className="w-full sm:max-w-md">
            <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Enter your credentials to sign in.</CardDescription>
            </CardHeader>
            <CardContent>
                <SmartForm
                    schema={signInSchema}
                    onSubmit={handleSignIn}
                    defaultValues={{
                        email: '',
                        password: '',
                    }}
                    submitButtonText="Sign In"
                    className="w-full"
                >
                    <FieldGroup>
                        <TextField name="email" label="Email" placeholder="Email" required />
                        <TextField
                            name="password"
                            label="Password"
                            placeholder="Password"
                            required
                        />
                    </FieldGroup>
                </SmartForm>
            </CardContent>
        </Card>
    );
}
