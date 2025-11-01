import { SmartForm } from '@/components/smart-form';
import { Button } from '@/components/ui/button';
import { signupSchema, type SignupFormValues } from './schemas';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { FieldGroup } from '@/components/ui/field';
import { TextField } from '@/components/smart-form/form-fields';
import { UserRole } from '@erp/db/browser';

export function SignUpForm() {
    const navigate = useNavigate();
    const onSubmit = async (_data: SignupFormValues) => {
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
        } catch (err: any) {
            toast.error(err.data?.message || 'Sign up failed. Please try again.');
        }
    };
    return (
        <SmartForm
            id="sign-up-form"
            schema={signupSchema}
            onSubmit={onSubmit}
            defaultValues={{ role: UserRole.STAFF }}
            showSubmitButton={false}
        >
            <FieldGroup>
                <div className="grid grid-cols-2 gap-4">
                    <TextField name="first_name" label="First Name" placeholder="Jane" required />
                    <TextField name="last_name" label="Last Name" placeholder="Doe" required />
                </div>
                <TextField name="email" label="Email" placeholder="jane.doe@example.com" required />
                <TextField name="password" label="Password" placeholder="••••••••" required />
                <TextField
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
