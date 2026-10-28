import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Link } from 'react-router';
import { SignInForm } from '@/features/auth/sign-in-form';

export default function SignInPage() {
    return (
        <Card className="w-full max-w-md shadow-sm">
            <CardHeader className="space-y-2 text-center">
                <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
                    ERP360 Platform
                </p>
                <CardTitle className="text-2xl">Platform Owner sign in</CardTitle>
                <CardDescription>
                    Sign in to manage institution onboarding and your platform workspace.
                </CardDescription>
            </CardHeader>
            <CardContent>
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
