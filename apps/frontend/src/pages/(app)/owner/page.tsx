import { Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OwnerHomePage() {
    return (
        <section aria-labelledby="owner-page-title" className="space-y-6">
            <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">Platform workspace</p>
                <h1
                    id="owner-page-title"
                    className="text-2xl font-semibold tracking-tight sm:text-3xl"
                >
                    Platform Owner
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                    Your Platform Owner workspace for institution onboarding.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <div className="bg-primary/10 text-primary mb-2 flex size-10 items-center justify-center rounded-lg">
                        <Building2 aria-hidden="true" className="size-5" />
                    </div>
                    <CardTitle>Institution setup is coming next</CardTitle>
                    <CardDescription>
                        This first slice establishes secure Platform Owner access.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Institution creation and Admin invitations are planned for the next approved
                        slice. No institution or tenant data is available in this workspace yet.
                    </p>
                </CardContent>
            </Card>
        </section>
    );
}
