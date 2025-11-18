import { Link } from 'react-router';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { SignUpForm } from '@/features/auth/sign-up-form';

// import { useRegisterMutation } from '@/features/auth/authApiSlice'; // We will add this

export default function SignUpPage() {
    // const [register, { isLoading }] = useRegisterMutation();

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl">Create an Account</CardTitle>
                <CardDescription>Enter your details to get started with ERP360</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Sign Up Form */}
                <SignUpForm />
            </CardContent>
            <CardFooter className="justify-center">
                <div className="text-muted-foreground text-center text-sm">
                    Already have an account?{' '}
                    <Link to="/signin" className="text-primary font-semibold hover:underline">
                        Sign In
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}
