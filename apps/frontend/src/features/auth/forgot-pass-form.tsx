import { SmartForm } from '@/components/smart-form';
import { TextField } from '@/components/smart-form/form-fields';
import { Button } from '@/components/ui/button';
import { forgotPasswordSchema, type ForgotPasswordPayload } from '@erp/shared';
import type { SubmitHandler } from 'react-hook-form';

export function ForgotPassForm({ onSubmit }: { onSubmit: SubmitHandler<ForgotPasswordPayload> }) {
    return (
        <SmartForm
            id="forgot-password-form"
            onSubmit={onSubmit}
            schema={forgotPasswordSchema}
            defaultValues={{
                email: '',
            }}
            showSubmitButton={false}
        >
            <TextField name="email" label="Email" placeholder="your.email@example.com" required />
            <Button
                id="forgot-password-form-submit-button"
                type="submit"
                className="w-full"
                // disabled={isLoading}
            >
                Send Reset Link
                {/* {isLoading ? 'Sending...' : 'Send Reset Link'} */}
            </Button>
        </SmartForm>
    );
}
