import { SmartForm } from '@/components/smart-form';
import { TextField } from '@/components/smart-form/form-fields';
import { FieldGroup } from '@/components/ui/field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { signInSchema } from './schemas';
import { useLoginMutation } from './auth-api-slice';

export function SignInForm() {
    const [login, { isLoading, data }] = useLoginMutation();

    console.log(data, isLoading);

    return (
        <Card className="w-full sm:max-w-md">
            <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Enter your credentials to sign in.</CardDescription>
            </CardHeader>
            <CardContent>
                <SmartForm
                    schema={signInSchema}
                    onSubmit={(data) => login(data).unwrap()}
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
