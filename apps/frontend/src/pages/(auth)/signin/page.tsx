import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SignInForm } from '@/features/auth/sign-in-form';

export default function SignInPage() {
    return (
        <Card className="w-full max-w-md shadow-sm">
            <CardHeader className="space-y-2 text-center">
                <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
                    ERP360 Workspace
                </p>
                <CardTitle className="text-2xl">Sign in to your workspace</CardTitle>
                <CardDescription>
                    Use your account email and password. Accounts are created by invitation only;
                    public registration is not available.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <SignInForm />
            </CardContent>
        </Card>
    );
}
