import { SmartForm } from '@/components/smart-form';
import { Button } from '@/components/ui/button';
import { signUpSchema, UserRole, type SignUpPayload } from '@erp/shared';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { FieldGroup } from '@/components/ui/field';
import { PasswordField, TextField } from '@/components/smart-form/form-fields';
import { Grid } from '@/components/ui/grid';
import { getApiErrorMessage } from '@/lib/utils';

export function SignUpForm() {
    const navigate = useNavigate();
    const onSubmit = async (_data: SignUpPayload) => {
        try {
            // We only send the fields the backend expects
            // await register({
            //     first_name: data.first_name,
            //     last_name: data.last_name,
            //     email: data.email,
            //     password: data.password,
            // }).unwrap();
            toast.success('Account created successfully!');
            navigate('/'); // Redirect to dashboard on success
        } catch (err) {
            toast.error(getApiErrorMessage(err));
        }
    };
    return (
        <SmartForm
            id="sign-up-form"
            schema={signUpSchema}
            onSubmit={onSubmit}
            defaultValues={{ role: UserRole.STAFF }}
            showSubmitButton={false}
        >
            <FieldGroup>
                <Grid columns={2} className="gap-4">
                    <TextField name="first_name" label="First Name" placeholder="Jane" required />
                    <TextField name="last_name" label="Last Name" placeholder="Doe" required />
                </Grid>
                <TextField name="email" label="Email" placeholder="jane.doe@example.com" required />
                <PasswordField name="password" label="Password" placeholder="••••••••" required />
                <PasswordField
                    name="confirm_password"
                    label="Confirm Password"
                    placeholder="••••••••"
                    required
                />
            </FieldGroup>
            <Button
                id="sign-up-form-submit-button"
                type="submit"
                className="mt-4 w-full"
                // disabled={isLoading}
            >
                Create Account
                {/* {isLoading ? 'Creating Account...' : 'Create Account'} */}
            </Button>
        </SmartForm>
    );
}
