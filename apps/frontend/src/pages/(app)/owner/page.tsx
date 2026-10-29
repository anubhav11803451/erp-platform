import { OwnerSetup } from '@/features/owner/owner-setup';

export default function OwnerHomePage() {
    return (
        <section aria-labelledby="owner-page-title" className="space-y-6">
            <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">Platform workspace</p>
                <h1
                    id="owner-page-title"
                    className="text-2xl font-semibold tracking-tight sm:text-3xl"
                >
                    Institution setup
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                    Create a LegalEntity group and its first Institution. A group can contain
                    multiple Institutions.
                </p>
            </div>
            <OwnerSetup />
        </section>
    );
}
