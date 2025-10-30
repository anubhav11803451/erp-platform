import { ModeToggle } from '@/components/theme-toggle';
import { Container } from '@/components/ui/container';
import { SmartBugReportForm } from '@/features/bug-report-form';

export default function Page() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center">
            {/* Page */}
            <ModeToggle />
            <SmartBugReportForm />
        </div>
    );
}
