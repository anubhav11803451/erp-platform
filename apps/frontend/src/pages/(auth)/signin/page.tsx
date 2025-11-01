import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Link } from 'react-router';
import { SignInForm } from '@/features/auth/sigin-in-form';

export default function SignInPage() {
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl">Sign In</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Sign In Form */}
                <SignInForm />
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
                <div className="text-muted-foreground text-sm">
                    <Link
                        to="/forgot-password"
                        className="text-muted-foreground text-xs hover:underline"
                    >
                        Forgot your password?
                    </Link>
                </div>
                <div className="text-muted-foreground text-center text-sm">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-primary font-semibold hover:underline">
                        Sign Up
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}
