import { Link } from 'react-router';

import { toast } from 'sonner';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

// import { useForgotPasswordMutation } from '@/features/auth/authApiSlice'; // We will add this

import { ForgotPassForm } from '@/features/auth/forgot-pass-form';
import type { ForgotPasswordPayload } from '@erp/shared';

export default function ForgotPasswordPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    // const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

    const onSubmit = async (_data: ForgotPasswordPayload) => {
        try {
            // await forgotPassword(data).unwrap();
            setIsSubmitted(true);
        } catch (err: any) {
            toast.error(err.data?.message || 'Failed to send reset email. Please try again.');
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl">Forgot Your Password?</CardTitle>
                {!isSubmitted ? (
                    <CardDescription>
                        Enter your email and we'll send you a link to reset it.
                    </CardDescription>
                ) : (
                    <CardDescription className="text-green-600">
                        Check your inbox! If an account exists, you'll receive a reset link shortly.
                    </CardDescription>
                )}
            </CardHeader>
            {/* Forgot Password Form */}
            <CardContent>{!isSubmitted && <ForgotPassForm onSubmit={onSubmit} />}</CardContent>
            <CardFooter className="justify-center">
                <Button variant="link" asChild>
                    <Link to="/signin">Back to Sign In</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
